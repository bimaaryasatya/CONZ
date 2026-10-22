use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;
use std::process::Command;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, RunEvent, WindowEvent,
};
use tauri_plugin_notification::NotificationExt;

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[cfg(target_os = "windows")]
mod win_input {
    #[repr(C)]
    #[derive(Default, Copy, Clone)]
    pub struct POINT {
        pub x: i32,
        pub y: i32,
    }

    #[link(name = "user32")]
    unsafe extern "system" {
        pub fn GetAsyncKeyState(v_key: i32) -> i16;
        pub fn GetCursorPos(lp_point: *mut POINT) -> i32;
    }

    pub fn is_key_down(vk: i32) -> bool {
        unsafe { (GetAsyncKeyState(vk) as u16 & 0x8000) != 0 }
    }

    pub fn get_mouse_pos() -> Option<(i32, i32)> {
        let mut pt = POINT::default();
        if unsafe { GetCursorPos(&mut pt) } != 0 {
            Some((pt.x, pt.y))
        } else {
            None
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ConvertResult {
    pub success: bool,
    pub input_path: String,
    pub output_path: String,
    pub output_filename: String,
    pub message: String,
    pub size_bytes: u64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct FileMetadata {
    pub name: String,
    pub extension: String,
    pub dir: String,
    pub size_bytes: u64,
}

#[tauri::command]
fn get_file_metadata(file_path: String) -> Result<FileMetadata, String> {
    let p = Path::new(&file_path);
    if !p.exists() {
        return Err("File does not exist".to_string());
    }

    let name = p
        .file_name()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();
    let extension = p
        .extension()
        .map(|s| s.to_string_lossy().to_lowercase())
        .unwrap_or_default();
    let dir = p
        .parent()
        .map(|s| s.to_string_lossy().to_string())
        .unwrap_or_default();
    let size_bytes = fs::metadata(p).map(|m| m.len()).unwrap_or(0);

    Ok(FileMetadata {
        name,
        extension,
        dir,
        size_bytes,
    })
}

#[tauri::command]
fn open_in_folder(file_path: String) -> Result<bool, String> {
    let p = Path::new(&file_path);
    if !p.exists() {
        return Err("File not found".to_string());
    }

    #[cfg(target_os = "windows")]
    {
        let arg = format!("/select,\"{}\"", p.to_string_lossy());
        let _ = Command::new("explorer.exe").args([&arg]).spawn();
    }

    #[cfg(not(target_os = "windows"))]
    {
        if let Some(parent) = p.parent() {
            let _ = open::that(parent);
        }
    }

    Ok(true)
}

#[tauri::command]
fn hide_radial_window(window: tauri::WebviewWindow) {
    let _ = window.hide();
}

/// Convert any supported image (PNG, JPG, WEBP, BMP, ICO) to a standard PDF document
fn image_to_pdf(input_path: &Path, output_path: &Path) -> Result<(), String> {
    let img = image::open(input_path).map_err(|e| format!("Gagal membuka gambar: {}", e))?;
    let (width, height) = (img.width(), img.height());

    let rgb = img.to_rgb8();
    let mut jpeg_data = Vec::new();
    let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut jpeg_data, 90);
    encoder
        .encode(rgb.as_raw(), width, height, image::ExtendedColorType::Rgb8)
        .map_err(|e| format!("Gagal memproses gambar ke JPEG: {}", e))?;

    let jpeg_len = jpeg_data.len();

    let mut pdf = Vec::new();
    let mut offsets = Vec::new();

    pdf.extend_from_slice(b"%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

    // Obj 1: Catalog
    offsets.push(pdf.len());
    pdf.extend_from_slice(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");

    // Obj 2: Pages
    offsets.push(pdf.len());
    pdf.extend_from_slice(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");

    // Obj 3: Page with MediaBox set to image dimensions
    offsets.push(pdf.len());
    let page_obj = format!(
        "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {} {}] /Resources << /XObject << /Im1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n",
        width, height
    );
    pdf.extend_from_slice(page_obj.as_bytes());

    // Obj 4: Image XObject with raw JPEG stream
    offsets.push(pdf.len());
    let img_header = format!(
        "4 0 obj\n<< /Type /XObject /Subtype /Image /Width {} /Height {} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length {} >>\nstream\n",
        width, height, jpeg_len
    );
    pdf.extend_from_slice(img_header.as_bytes());
    pdf.extend_from_slice(&jpeg_data);
    pdf.extend_from_slice(b"\nendstream\nendobj\n");

    // Obj 5: Page contents stream placing image across page
    offsets.push(pdf.len());
    let draw_cmd = format!("q {} 0 0 {} 0 0 cm /Im1 Do Q\n", width, height);
    let contents_obj = format!(
        "5 0 obj\n<< /Length {} >>\nstream\n{}endstream\nendobj\n",
        draw_cmd.len(),
        draw_cmd
    );
    pdf.extend_from_slice(contents_obj.as_bytes());

    // xref table
    let xref_offset = pdf.len();
    pdf.extend_from_slice(b"xref\n0 6\n0000000000 65535 f \n");
    for off in offsets {
        let entry = format!("{:010} 00000 n \n", off);
        pdf.extend_from_slice(entry.as_bytes());
    }

    // trailer
    let trailer = format!(
        "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{}\n%%EOF\n",
        xref_offset
    );
    pdf.extend_from_slice(trailer.as_bytes());

    fs::write(output_path, pdf).map_err(|e| format!("Gagal menyimpan file PDF: {}", e))?;
    Ok(())
}

fn do_convert_file(input_path: &str, target_format: &str) -> Result<ConvertResult, String> {
    let p = Path::new(input_path);
    if !p.exists() {
        return Err(format!("File input tidak ditemukan: {}", input_path));
    }

    let src_ext = p
        .extension()
        .and_then(|e| e.to_str())
        .unwrap_or("")
        .to_lowercase();
    let target_ext = target_format.to_lowercase();

    let parent_dir = p.parent().unwrap_or_else(|| Path::new("."));
    let stem = p.file_stem().and_then(|s| s.to_str()).unwrap_or("output");

    let output_filename = format!("{}_converted.{}", stem, target_ext);
    let output_path = parent_dir.join(&output_filename);
    let output_path_str = output_path.to_string_lossy().to_string();

    let image_extensions = ["png", "jpg", "jpeg", "webp", "bmp", "ico"];

    // 1. Image -> PDF
    if image_extensions.contains(&src_ext.as_str()) && target_ext == "pdf" {
        image_to_pdf(p, &output_path)?;
        let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
        return Ok(ConvertResult {
            success: true,
            input_path: input_path.to_string(),
            output_path: output_path_str,
            output_filename,
            message: "Berhasil dikonversi ke PDF".to_string(),
            size_bytes: size,
        });
    }

    // 2. Image -> Image
    if image_extensions.contains(&src_ext.as_str()) && image_extensions.contains(&target_ext.as_str()) {
        let img = image::open(p).map_err(|e| format!("Gagal membaca gambar: {}", e))?;
        img.save(&output_path)
            .map_err(|e| format!("Gagal menyimpan gambar sebagai {}: {}", target_ext, e))?;

        let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
        return Ok(ConvertResult {
            success: true,
            input_path: input_path.to_string(),
            output_path: output_path_str,
            output_filename,
            message: format!("Berhasil dikonversi ke {}", target_ext.to_uppercase()),
            size_bytes: size,
        });
    }

    // 3. Word Document -> PDF (Completely silent execution)
    if (src_ext == "docx" || src_ext == "doc") && target_ext == "pdf" {
        #[cfg(target_os = "windows")]
        {
            let script = format!(
                r#"
                $ErrorActionPreference = 'Stop'
                try {{
                    $word = New-Object -ComObject Word.Application
                    $word.Visible = $false
                    $doc = $word.Documents.Open('{input}')
                    $doc.SaveAs([ref]'{output}', [ref]17)
                    $doc.Close([ref]0)
                    $word.Quit()
                    exit 0
                }} catch {{
                    Write-Error $_.Exception.Message
                    exit 1
                }}
                "#,
                input = p.to_string_lossy().replace("'", "''"),
                output = output_path.to_string_lossy().replace("'", "''")
            );

            // Execute completely silently in the background (CREATE_NO_WINDOW)
            let mut cmd = Command::new("powershell");
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &script]);

            let output = cmd.output();

            if let Ok(res) = output {
                if res.status.success() {
                    let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
                    return Ok(ConvertResult {
                        success: true,
                        input_path: input_path.to_string(),
                        output_path: output_path_str,
                        output_filename,
                        message: "Berhasil dikonversi ke PDF via Microsoft Word".to_string(),
                        size_bytes: size,
                    });
                }

                // Fallback to LibreOffice if installed
                let soffice_paths = [
                    r"C:\Program Files\LibreOffice\program\soffice.exe",
                    r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
                ];
                for soffice in soffice_paths {
                    if Path::new(soffice).exists() {
                        let mut lo_cmd = Command::new(soffice);
                        lo_cmd.creation_flags(CREATE_NO_WINDOW);
                        lo_cmd.args([
                            "--headless",
                            "--convert-to",
                            "pdf",
                            "--outdir",
                            parent_dir.to_string_lossy().as_ref(),
                            p.to_string_lossy().as_ref(),
                        ]);

                        if let Ok(lo_res) = lo_cmd.output() {
                            if lo_res.status.success() {
                                let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
                                return Ok(ConvertResult {
                                    success: true,
                                    input_path: input_path.to_string(),
                                    output_path: output_path_str,
                                    output_filename,
                                    message: "Berhasil dikonversi via LibreOffice ke PDF".to_string(),
                                    size_bytes: size,
                                });
                            }
                        }
                    }
                }

                return Err("Gagal mengonversi dokumen Word. Pastikan Microsoft Word terpasang.".to_string());
            }
        }
    }

    Err(format!(
        "Format konversi dari .{} ke .{} belum didukung.",
        src_ext, target_ext
    ))
}

#[tauri::command]
async fn convert_file(
    app: tauri::AppHandle,
    input_path: String,
    target_format: String,
) -> Result<ConvertResult, String> {
    // Run conversion in a background worker thread so the app remains 100% responsive
    let in_path = input_path.clone();
    let tgt_fmt = target_format.clone();
    let result = tauri::async_runtime::spawn_blocking(move || do_convert_file(&in_path, &tgt_fmt))
        .await
        .map_err(|e| format!("Task thread error: {}", e))??;

    // Send native Windows desktop notification upon completion
    let _ = app
        .notification()
        .builder()
        .title("CONZ — Konversi Berhasil! ✨")
        .body(format!("Tersimpan: {}", result.output_filename))
        .show();

    let _ = app.emit("conversion-finished", &result);

    Ok(result)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            // Build Tray Icon with Menu
            let status_item = MenuItem::with_id(app, "status", "CONZ: Drag + Tahan Shift", false, None::<&str>)?;
            let test_item = MenuItem::with_id(app, "test", "Tes Radial Menu", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Keluar", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&status_item, &test_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("CONZ — File Converter (Drag + Shift)")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "test" => {
                        if let Some(window) = app.get_webview_window("main") {
                            #[cfg(target_os = "windows")]
                            if let Some((x, y)) = win_input::get_mouse_pos() {
                                let _ = window.set_position(tauri::PhysicalPosition::new(x - 270, y - 270));
                            }
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("test-radial", ());
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } = event
                    {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            #[cfg(target_os = "windows")]
                            if let Some((x, y)) = win_input::get_mouse_pos() {
                                let _ = window.set_position(tauri::PhysicalPosition::new(x - 270, y - 270));
                            }
                            let _ = window.show();
                            let _ = window.set_focus();
                            let _ = window.emit("test-radial", ());
                        }
                    }
                })
                .build(app)?;

            // Background Drag + Shift Listener Thread
            let app_handle = app.handle().clone();
            std::thread::spawn(move || {
                let mut was_active = false;
                let mut start_pos: Option<(i32, i32)> = None;

                loop {
                    std::thread::sleep(std::time::Duration::from_millis(30));

                    #[cfg(target_os = "windows")]
                    {
                        let lbutton = win_input::is_key_down(0x01); // VK_LBUTTON
                        let shift = win_input::is_key_down(0x10);   // VK_SHIFT

                        if lbutton && shift {
                            if let Some((x, y)) = win_input::get_mouse_pos() {
                                if start_pos.is_none() {
                                    start_pos = Some((x, y));
                                }

                                let moved = if let Some((sx, sy)) = start_pos {
                                    let dx = (x - sx).abs();
                                    let dy = (y - sy).abs();
                                    dx > 4 || dy > 4
                                } else {
                                    false
                                };

                                if moved && !was_active {
                                    was_active = true;
                                    if let Some(window) = app_handle.get_webview_window("main") {
                                        let _ = window.set_position(tauri::PhysicalPosition::new(x - 270, y - 270));
                                        let _ = window.show();
                                        let _ = window.set_focus();
                                        let _ = window.emit("radial-show", ());
                                    }
                                }
                            }
                        } else {
                            if was_active {
                                was_active = false;
                                start_pos = None;
                                std::thread::sleep(std::time::Duration::from_millis(150));
                                let _ = app_handle.emit("radial-check-hide", ());
                            } else {
                                start_pos = None;
                            }
                        }
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| match event {
            WindowEvent::CloseRequested { api, .. } => {
                let _ = window.hide();
                api.prevent_close();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_file_metadata,
            convert_file,
            open_in_folder,
            hide_radial_window
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    app.run(|_app_handle, event| {
        match event {
            RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            _ => {}
        }
    });
}
