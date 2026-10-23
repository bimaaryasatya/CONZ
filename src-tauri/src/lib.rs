use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
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

#[cfg(target_os = "macos")]
mod mac_input {
    use std::ffi::c_void;

    type CGEventRef = *mut c_void;
    type CGEventSourceStateID = i32;
    type CGMouseButton = u32;
    type CGEventFlags = u64;

    #[repr(C)]
    #[derive(Default, Copy, Clone)]
    pub struct CGPoint {
        pub x: f64,
        pub y: f64,
    }

    const COMBINED_SESSION_STATE: CGEventSourceStateID = 0;
    const MOUSE_BUTTON_LEFT: CGMouseButton = 0;
    const FLAG_MASK_SHIFT: CGEventFlags = 0x00020000;

    #[link(name = "CoreGraphics", kind = "framework")]
    unsafe extern "C" {
        fn CGEventCreate(source: *const c_void) -> CGEventRef;
        fn CGEventGetLocation(event: CGEventRef) -> CGPoint;
        fn CGEventSourceButtonState(state_id: CGEventSourceStateID, button: CGMouseButton) -> bool;
        fn CGEventSourceFlagsState(state_id: CGEventSourceStateID) -> CGEventFlags;
    }

    #[link(name = "CoreFoundation", kind = "framework")]
    unsafe extern "C" {
        fn CFRelease(cf: *const c_void);
    }

    pub fn is_mouse_down() -> bool {
        unsafe { CGEventSourceButtonState(COMBINED_SESSION_STATE, MOUSE_BUTTON_LEFT) }
    }

    pub fn is_shift_down() -> bool {
        unsafe { (CGEventSourceFlagsState(COMBINED_SESSION_STATE) & FLAG_MASK_SHIFT) != 0 }
    }

    pub fn get_mouse_pos() -> Option<(i32, i32)> {
        unsafe {
            let event = CGEventCreate(std::ptr::null());
            if event.is_null() {
                None
            } else {
                let loc = CGEventGetLocation(event);
                CFRelease(event as *const c_void);
                Some((loc.x.round() as i32, loc.y.round() as i32))
            }
        }
    }
}

fn get_current_mouse_pos() -> Option<(i32, i32)> {
    #[cfg(target_os = "windows")]
    {
        win_input::get_mouse_pos()
    }
    #[cfg(target_os = "macos")]
    {
        mac_input::get_mouse_pos()
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        None
    }
}

fn is_drag_shift_active() -> bool {
    #[cfg(target_os = "windows")]
    {
        win_input::is_key_down(0x01) && win_input::is_key_down(0x10)
    }
    #[cfg(target_os = "macos")]
    {
        mac_input::is_mouse_down() && mac_input::is_shift_down()
    }
    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        false
    }
}

fn set_window_position_at_cursor(window: &tauri::WebviewWindow) {
    if let Some((x, y)) = get_current_mouse_pos() {
        #[cfg(target_os = "windows")]
        let _ = window.set_position(tauri::PhysicalPosition::new(x - 270, y - 270));

        #[cfg(target_os = "macos")]
        let _ = window.set_position(tauri::LogicalPosition::new((x - 270) as f64, (y - 270) as f64));

        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        let _ = window.center();
    } else {
        let _ = window.center();
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

    #[cfg(target_os = "macos")]
    {
        let _ = Command::new("open").arg("-R").arg(p).spawn();
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        if let Some(parent) = p.parent() {
            let _ = Command::new("xdg-open").arg(parent).spawn();
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

// Helper to locate FFmpeg binary
fn find_ffmpeg() -> Option<PathBuf> {
    // 1. Check beside current executable or in bin/
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            let p1 = parent.join("ffmpeg.exe");
            if p1.exists() { return Some(p1); }
            let p2 = parent.join("bin").join("ffmpeg.exe");
            if p2.exists() { return Some(p2); }
            let p3 = parent.join("../bin/ffmpeg.exe");
            if p3.exists() { return Some(p3); }
        }
    }

    // 2. Check local workspace bin folder
    let local_bin = PathBuf::from(r"src-tauri\bin\ffmpeg.exe");
    if local_bin.exists() {
        return Some(local_bin);
    }

    // 3. Check WinGet package location
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let winget_path = PathBuf::from(&local_app_data).join("Microsoft").join("WinGet").join("Packages");
        if winget_path.exists() {
            if let Ok(entries) = fs::read_dir(&winget_path) {
                for entry in entries.flatten() {
                    let name = entry.file_name().to_string_lossy().to_string();
                    if name.contains("FFmpeg") {
                        let potential_paths = [
                            entry.path().join("ffmpeg.exe"),
                            entry.path().join("bin").join("ffmpeg.exe"),
                        ];
                        for p in &potential_paths {
                            if p.exists() { return Some(p.clone()); }
                        }
                        if let Ok(sub_entries) = fs::read_dir(entry.path()) {
                            for sub in sub_entries.flatten() {
                                let sub_p = sub.path().join("bin").join("ffmpeg.exe");
                                if sub_p.exists() { return Some(sub_p); }
                            }
                        }
                    }
                }
            }
        }
    }

    // 4. Check system PATH
    #[cfg(target_os = "windows")]
    {
        let path_output = Command::new("where.exe")
            .arg("ffmpeg")
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        if let Ok(out) = path_output {
            if out.status.success() {
                let s = String::from_utf8_lossy(&out.stdout);
                if let Some(first_line) = s.lines().next() {
                    let p = PathBuf::from(first_line.trim());
                    if p.exists() { return Some(p); }
                }
            }
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        let mac_paths = [
            "/opt/homebrew/bin/ffmpeg",
            "/usr/local/bin/ffmpeg",
            "/usr/bin/ffmpeg",
        ];
        for p in mac_paths {
            let pb = PathBuf::from(p);
            if pb.exists() {
                return Some(pb);
            }
        }
        if let Ok(out) = Command::new("which").arg("ffmpeg").output() {
            if out.status.success() {
                let s = String::from_utf8_lossy(&out.stdout);
                if let Some(first_line) = s.lines().next() {
                    let p = PathBuf::from(first_line.trim());
                    if p.exists() { return Some(p); }
                }
            }
        }
    }

    None
}

// Subtitle conversion logic (Pure Rust)
fn convert_subtitles(input_path: &Path, output_path: &Path, src_ext: &str, target_ext: &str) -> Result<(), String> {
    let content = fs::read_to_string(input_path).map_err(|e| format!("Gagal membaca subtitle: {}", e))?;
    let result = match (src_ext, target_ext) {
        ("srt", "vtt") => {
            let mut out = String::from("WEBVTT\n\n");
            for line in content.lines() {
                if line.contains("-->") {
                    out.push_str(&line.replace(',', "."));
                } else {
                    out.push_str(line);
                }
                out.push('\n');
            }
            out
        }
        ("vtt", "srt") => {
            let mut out = String::new();
            let mut started = false;
            for line in content.lines() {
                if !started {
                    if line.contains("-->") {
                        started = true;
                    } else {
                        continue;
                    }
                }
                if line.contains("-->") {
                    out.push_str(&line.replace('.', ","));
                } else {
                    out.push_str(line);
                }
                out.push('\n');
            }
            out
        }
        (_, "txt") => {
            let mut out = String::new();
            for line in content.lines() {
                let trimmed = line.trim();
                if trimmed.is_empty() || trimmed.contains("-->") || trimmed.parse::<u32>().is_ok() || trimmed.starts_with("WEBVTT") {
                    continue;
                }
                out.push_str(trimmed);
                out.push('\n');
            }
            out
        }
        _ => content,
    };
    fs::write(output_path, result).map_err(|e| format!("Gagal menyimpan subtitle: {}", e))?;
    Ok(())
}

// Delimited data conversion (CSV <-> TSV)
fn convert_delimited(input_path: &Path, output_path: &Path, from_delim: char, to_delim: char) -> Result<(), String> {
    let content = fs::read_to_string(input_path).map_err(|e| format!("Gagal membaca data: {}", e))?;
    let mut out = String::with_capacity(content.len());
    let mut in_quotes = false;

    for c in content.chars() {
        if c == '"' {
            in_quotes = !in_quotes;
            out.push(c);
        } else if c == from_delim && !in_quotes {
            out.push(to_delim);
        } else {
            out.push(c);
        }
    }
    fs::write(output_path, out).map_err(|e| format!("Gagal menulis data: {}", e))?;
    Ok(())
}

// Archive conversion via tar.exe
fn convert_archive(input_path: &Path, output_path: &Path, target_ext: &str) -> Result<(), String> {
    let millis = std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap_or_default().as_millis();
    let temp_dir = std::env::temp_dir().join(format!("conz_arch_{}", millis));
    let _ = fs::create_dir_all(&temp_dir);

    #[cfg(target_os = "windows")]
    {
        // 1. Extract input archive
        let mut extract_cmd = Command::new("tar.exe");
        extract_cmd.creation_flags(CREATE_NO_WINDOW);
        extract_cmd.args(["-xf", input_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref()]);
        let extract_res = extract_cmd.output();
        if extract_res.is_err() || !extract_res.as_ref().unwrap().status.success() {
            let ps_script = format!("Expand-Archive -LiteralPath '{in_p}' -DestinationPath '{out_p}' -Force",
                in_p = input_path.to_string_lossy().replace("'", "''"),
                out_p = temp_dir.to_string_lossy().replace("'", "''")
            );
            let mut ps_cmd = Command::new("powershell");
            ps_cmd.creation_flags(CREATE_NO_WINDOW);
            ps_cmd.args(["-NoProfile", "-Command", &ps_script]);
            let _ = ps_cmd.output();
        }

        // 2. Compress to target archive
        let mut comp_cmd = Command::new("tar.exe");
        comp_cmd.creation_flags(CREATE_NO_WINDOW);
        match target_ext {
            "tar" => {
                comp_cmd.args(["-cf", output_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref(), "."]);
            }
            "gz" | "gzip" | "tgz" => {
                comp_cmd.args(["-czf", output_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref(), "."]);
            }
            _ => {
                comp_cmd.args(["-a", "-cf", output_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref(), "."]);
            }
        }
        let comp_res = comp_cmd.output().map_err(|e| format!("Gagal mengompresi arsip: {}", e))?;
        let _ = fs::remove_dir_all(&temp_dir);

        if !comp_res.status.success() {
            return Err("Gagal membuat arsip target".to_string());
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        // 1. Extract input archive via native tar / unzip
        let mut extract_cmd = Command::new("tar");
        extract_cmd.args(["-xf", input_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref()]);
        let extract_res = extract_cmd.output();
        if extract_res.is_err() || !extract_res.as_ref().unwrap().status.success() {
            let mut unzip_cmd = Command::new("unzip");
            unzip_cmd.args(["-q", input_path.to_string_lossy().as_ref(), "-d", temp_dir.to_string_lossy().as_ref()]);
            let _ = unzip_cmd.output();
        }

        // 2. Compress to target archive
        let mut comp_cmd = Command::new("tar");
        match target_ext {
            "tar" => {
                comp_cmd.args(["-cf", output_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref(), "."]);
            }
            "gz" | "gzip" | "tgz" => {
                comp_cmd.args(["-czf", output_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref(), "."]);
            }
            "zip" => {
                let mut zip_cmd = Command::new("zip");
                zip_cmd.current_dir(&temp_dir);
                zip_cmd.args(["-r", output_path.to_string_lossy().as_ref(), "."]);
                let zip_res = zip_cmd.output().map_err(|e| format!("Gagal mengompresi zip: {}", e))?;
                let _ = fs::remove_dir_all(&temp_dir);
                if !zip_res.status.success() {
                    return Err("Gagal membuat arsip zip".to_string());
                }
                return Ok(());
            }
            _ => {
                comp_cmd.args(["-cf", output_path.to_string_lossy().as_ref(), "-C", temp_dir.to_string_lossy().as_ref(), "."]);
            }
        }
        let comp_res = comp_cmd.output().map_err(|e| format!("Gagal mengompresi arsip: {}", e))?;
        let _ = fs::remove_dir_all(&temp_dir);

        if !comp_res.status.success() {
            return Err("Gagal membuat arsip target".to_string());
        }
    }

    Ok(())
}

/// Convert PDF document to PNG/JPG/WEBP/BMP images via native OS APIs (Windows.Data.Pdf on Windows, sips on macOS)
fn convert_pdf_to_images(
    input_path: &Path,
    _output_path: &Path,
    parent_dir: &Path,
    stem: &str,
    target_ext: &str,
) -> Result<(String, u64), String> {
    #[cfg(target_os = "windows")]
    {
        let base_name = format!("{}_converted", stem);
        let script = format!(
            r#"
            $ErrorActionPreference = 'Stop'
            try {{
                Add-Type -AssemblyName System.Runtime.WindowsRuntime
                $asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? {{ 
                    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
                }}
                function AwaitOp($op, $t) {{
                    $task = $asTaskGeneric.MakeGenericMethod($t).Invoke($null, @($op))
                    $task.Wait(-1) | Out-Null
                    return $task.Result
                }}
                $asTaskAction = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? {{ 
                    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncAction' 
                }}
                function AwaitAct($op) {{
                    $task = $asTaskAction.Invoke($null, @($op))
                    $task.Wait(-1) | Out-Null
                }}

                [Windows.Storage.StorageFile, Windows.Storage, ContentType=WindowsRuntime] | Out-Null
                [Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType=WindowsRuntime] | Out-Null

                $fullInPath = (Resolve-Path '{input}').Path
                $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($fullInPath)
                $storageFile = AwaitOp $fileOp ([Windows.Storage.StorageFile])

                $pdfOp = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($storageFile)
                $pdfDoc = AwaitOp $pdfOp ([Windows.Data.Pdf.PdfDocument])

                $pageCount = $pdfDoc.PageCount
                if ($pageCount -eq 0) {{
                    exit 1
                }}

                for ($i = 0; $i -lt $pageCount; $i++) {{
                    $page = $pdfDoc.GetPage($i)
                    $fileName = if ($i -eq 0) {{ "{base_name}.png" }} else {{ "{base_name}_page_$($i + 1).png" }}
                    $outPath = Join-Path '{out_dir}' $fileName
                    if (Test-Path $outPath) {{ Remove-Item $outPath -Force }}

                    $outFileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync((New-Item -ItemType File -Path $outPath -Force).FullName)
                    $outStorageFile = AwaitOp $outFileOp ([Windows.Storage.StorageFile])

                    $streamOp = $outStorageFile.OpenAsync([Windows.Storage.FileAccessMode]::ReadWrite)
                    $stream = AwaitOp $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

                    $renderOp = $page.RenderToStreamAsync($stream)
                    AwaitAct $renderOp

                    $stream.Dispose()
                    $page.Dispose()
                }}
                exit 0
            }} catch {{
                Write-Error $_.Exception.Message
                exit 1
            }}
            "#,
            input = input_path.to_string_lossy().replace("'", "''"),
            out_dir = parent_dir.to_string_lossy().replace("'", "''"),
            base_name = base_name
        );

        let mut cmd = Command::new("powershell");
        cmd.creation_flags(CREATE_NO_WINDOW);
        cmd.args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &script]);
        let res = cmd.output().map_err(|e| format!("Gagal menjalankan konversi PDF: {}", e))?;

        let first_png = parent_dir.join(format!("{}.png", base_name));
        if !res.status.success() || !first_png.exists() {
            let err_msg = String::from_utf8_lossy(&res.stderr);
            return Err(format!("Gagal merender PDF ke gambar: {}", err_msg.trim()));
        }

        // If target is PNG, output is already rendered!
        if target_ext == "png" {
            let size = fs::metadata(&first_png).map(|m| m.len()).unwrap_or(0);
            return Ok((first_png.to_string_lossy().to_string(), size));
        }

        // Convert generated PNG(s) to target format (JPG, WEBP, BMP, TIFF)
        let pattern_dir = parent_dir.to_path_buf();
        if let Ok(entries) = fs::read_dir(&pattern_dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if let Some(file_name) = p.file_name().and_then(|n| n.to_str()) {
                    if file_name.starts_with(&base_name) && file_name.ends_with(".png") {
                        let target_file_name = file_name.replace(".png", &format!(".{}", target_ext));
                        let target_path = pattern_dir.join(target_file_name);

                        // 1. Try Rust image crate
                        let mut ok = false;
                        if let Ok(img) = image::open(&p) {
                            if img.save(&target_path).is_ok() {
                                ok = true;
                            }
                        }

                        // 2. Fallback to FFmpeg
                        if !ok {
                            if let Some(ffmpeg) = find_ffmpeg() {
                                let mut ff_cmd = Command::new(ffmpeg);
                                ff_cmd.creation_flags(CREATE_NO_WINDOW);
                                ff_cmd.args(["-y", "-i", p.to_string_lossy().as_ref(), target_path.to_string_lossy().as_ref()]);
                                let _ = ff_cmd.output();
                            }
                        }

                        // Clean up temporary PNG if target is not PNG
                        let _ = fs::remove_file(&p);
                    }
                }
            }
        }

        let primary_output = parent_dir.join(format!("{}.{}", base_name, target_ext));
        let size = fs::metadata(&primary_output).map(|m| m.len()).unwrap_or(0);
        return Ok((primary_output.to_string_lossy().to_string(), size));
    }

    #[cfg(target_os = "macos")]
    {
        let _ = (parent_dir, stem);
        let fmt = if target_ext == "jpg" || target_ext == "jpeg" { "jpeg" } else { "png" };
        let mut cmd = Command::new("sips");
        cmd.args(["-s", "format", fmt, input_path.to_string_lossy().as_ref(), "--out", _output_path.to_string_lossy().as_ref()]);
        let res = cmd.output().map_err(|e| format!("Gagal memanggil sips di macOS: {}", e))?;
        if res.status.success() && _output_path.exists() {
            let size = fs::metadata(_output_path).map(|m| m.len()).unwrap_or(0);
            return Ok((_output_path.to_string_lossy().to_string(), size));
        }
        return Err("Gagal mengonversi PDF via sips di macOS".to_string());
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let _ = (input_path, _output_path, parent_dir, stem, target_ext);
        Err("Konversi PDF ke gambar tidak didukung di platform ini".to_string())
    }
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

    let audio_extensions = ["mp3", "wav", "m4a", "flac", "ogg", "opus", "aiff", "aif", "wma"];
    let video_extensions = ["mp4", "mov", "mkv", "webm", "avi", "wmv", "gif"];
    let native_images = ["png", "jpg", "jpeg", "webp", "bmp", "ico"];
    let extended_images = ["heic", "tiff", "tif", "avif", "svg"];
    let subtitle_extensions = ["srt", "vtt"];
    let archive_extensions = ["zip", "tar", "gz", "gzip", "tgz", "rar", "7z"];

    // ==========================================
    // 1. SUBTITLES (SRT <-> VTT <-> TXT)
    // ==========================================
    if subtitle_extensions.contains(&src_ext.as_str()) && (subtitle_extensions.contains(&target_ext.as_str()) || target_ext == "txt") {
        convert_subtitles(p, &output_path, &src_ext, &target_ext)?;
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

    // ==========================================
    // 2. DELIMITED SPREADSHEETS (CSV <-> TSV)
    // ==========================================
    if src_ext == "csv" && target_ext == "tsv" {
        convert_delimited(p, &output_path, ',', '\t')?;
        let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
        return Ok(ConvertResult {
            success: true,
            input_path: input_path.to_string(),
            output_path: output_path_str,
            output_filename,
            message: "Berhasil dikonversi ke TSV".to_string(),
            size_bytes: size,
        });
    }
    if src_ext == "tsv" && target_ext == "csv" {
        convert_delimited(p, &output_path, '\t', ',')?;
        let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
        return Ok(ConvertResult {
            success: true,
            input_path: input_path.to_string(),
            output_path: output_path_str,
            output_filename,
            message: "Berhasil dikonversi ke CSV".to_string(),
            size_bytes: size,
        });
    }

    // ==========================================
    // 3. ARCHIVES (ZIP, TAR, GZ, RAR)
    // ==========================================
    if archive_extensions.contains(&src_ext.as_str()) && ["zip", "tar", "gz"].contains(&target_ext.as_str()) {
        convert_archive(p, &output_path, &target_ext)?;
        let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
        return Ok(ConvertResult {
            success: true,
            input_path: input_path.to_string(),
            output_path: output_path_str,
            output_filename,
            message: format!("Berhasil dikonversi ke arsip {}", target_ext.to_uppercase()),
            size_bytes: size,
        });
    }

    // ==========================================
    // 4. PDF -> IMAGES (PNG, JPG, WEBP, BMP, TIFF)
    // ==========================================
    if src_ext == "pdf" && (native_images.contains(&target_ext.as_str()) || extended_images.contains(&target_ext.as_str())) {
        let (actual_out_path, size) = convert_pdf_to_images(p, &output_path, parent_dir, stem, &target_ext)?;
        return Ok(ConvertResult {
            success: true,
            input_path: input_path.to_string(),
            output_path: actual_out_path,
            output_filename,
            message: format!("Berhasil merender PDF ke {}", target_ext.to_uppercase()),
            size_bytes: size,
        });
    }

    // ==========================================
    // 5. IMAGE -> PDF (Pure Rust native)
    // ==========================================
    if (native_images.contains(&src_ext.as_str()) || extended_images.contains(&src_ext.as_str())) && target_ext == "pdf" {
        if native_images.contains(&src_ext.as_str()) {
            if image_to_pdf(p, &output_path).is_ok() {
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
        }
        // Fallback to FFmpeg for HEIC / AVIF / TIFF / SVG -> PDF
        if let Some(ffmpeg) = find_ffmpeg() {
            let mut cmd = Command::new(ffmpeg);
            #[cfg(target_os = "windows")]
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.args(["-y", "-i", input_path, output_path_str.as_str()]);
            if let Ok(res) = cmd.output() {
                if res.status.success() {
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
            }
        }
    }

    // ==========================================
    // 5. NATIVE IMAGE -> NATIVE IMAGE
    // ==========================================
    if native_images.contains(&src_ext.as_str()) && native_images.contains(&target_ext.as_str()) {
        if let Ok(img) = image::open(p) {
            if img.save(&output_path).is_ok() {
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
        }
    }

    // ==========================================
    // 6. AUDIO & VIDEO & EXTENDED IMAGES (via FFmpeg)
    // ==========================================
    let is_audio = audio_extensions.contains(&src_ext.as_str());
    let is_video = video_extensions.contains(&src_ext.as_str());
    let is_img = native_images.contains(&src_ext.as_str()) || extended_images.contains(&src_ext.as_str());

    let target_is_audio = audio_extensions.contains(&target_ext.as_str());
    let target_is_video = video_extensions.contains(&target_ext.as_str());
    let target_is_img = native_images.contains(&target_ext.as_str()) || extended_images.contains(&target_ext.as_str());

    if (is_audio || is_video || is_img) && (target_is_audio || target_is_video || target_is_img) {
        if let Some(ffmpeg) = find_ffmpeg() {
            let mut cmd = Command::new(ffmpeg);
            #[cfg(target_os = "windows")]
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.arg("-y");
            cmd.arg("-i");
            cmd.arg(input_path);

            // Audio extraction from video
            if is_video && target_ext == "mp3" {
                cmd.args(["-vn", "-c:a", "libmp3lame", "-q:a", "2"]);
            } else if is_video && target_ext == "gif" {
                cmd.args(["-vf", "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"]);
            } else if src_ext == "gif" && target_ext == "mp4" {
                cmd.args(["-movflags", "faststart", "-pix_fmt", "yuv420p"]);
            }

            cmd.arg(&output_path_str);

            let res = cmd.output().map_err(|e| format!("Gagal memanggil FFmpeg: {}", e))?;
            if res.status.success() {
                let size = fs::metadata(&output_path).map(|m| m.len()).unwrap_or(0);
                return Ok(ConvertResult {
                    success: true,
                    input_path: input_path.to_string(),
                    output_path: output_path_str,
                    output_filename,
                    message: format!("Berhasil dikonversi ke {}", target_ext.to_uppercase()),
                    size_bytes: size,
                });
            } else {
                let err_txt = String::from_utf8_lossy(&res.stderr);
                let snippet = err_txt.lines().rev().take(3).collect::<Vec<_>>().join(" ");
                return Err(format!("FFmpeg error: {}", snippet));
            }
        } else {
            return Err("FFmpeg tidak ditemukan. Pastikan FFmpeg terpasang untuk konversi media.".to_string());
        }
    }

    // ==========================================
    // 7. MICROSOFT OFFICE COM (WORD, EXCEL, PPT)
    // ==========================================
    #[cfg(target_os = "windows")]
    {
        // Word -> PDF / TXT / HTML / DOCX
        if (src_ext == "docx" || src_ext == "doc" || src_ext == "rtf") && ["pdf", "txt", "html", "docx"].contains(&target_ext.as_str()) {
            let format_code = match target_ext.as_str() {
                "pdf" => 17, // wdFormatPDF
                "txt" => 2,  // wdFormatText
                "html" => 8, // wdFormatHTML
                _ => 16,     // wdFormatXMLDocument (DOCX)
            };
            let script = format!(
                r#"
                $ErrorActionPreference = 'Stop'
                try {{
                    $word = New-Object -ComObject Word.Application
                    $word.Visible = $false
                    $doc = $word.Documents.Open('{input}')
                    $doc.SaveAs([ref]'{output}', [ref]{code})
                    $doc.Close([ref]0)
                    $word.Quit()
                    exit 0
                }} catch {{
                    Write-Error $_.Exception.Message
                    exit 1
                }}
                "#,
                input = p.to_string_lossy().replace("'", "''"),
                output = output_path.to_string_lossy().replace("'", "''"),
                code = format_code
            );
            let mut cmd = Command::new("powershell");
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &script]);
            if let Ok(res) = cmd.output() {
                if res.status.success() {
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
            }
        }

        // PowerPoint -> PDF / JPG / PNG
        if (src_ext == "pptx" || src_ext == "ppt") && ["pdf", "jpg", "png"].contains(&target_ext.as_str()) {
            let format_code = match target_ext.as_str() {
                "pdf" => 32, // ppSaveAsPDF
                "jpg" => 17, // ppSaveAsJPG
                _ => 18,     // ppSaveAsPNG
            };
            let script = format!(
                r#"
                $ErrorActionPreference = 'Stop'
                try {{
                    $ppt = New-Object -ComObject PowerPoint.Application
                    $pres = $ppt.Presentations.Open('{input}', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
                    $pres.SaveAs('{output}', {code})
                    $pres.Close()
                    $ppt.Quit()
                    exit 0
                }} catch {{
                    Write-Error $_.Exception.Message
                    exit 1
                }}
                "#,
                input = p.to_string_lossy().replace("'", "''"),
                output = output_path.to_string_lossy().replace("'", "''"),
                code = format_code
            );
            let mut cmd = Command::new("powershell");
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &script]);
            if let Ok(res) = cmd.output() {
                if res.status.success() {
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
            }
        }

        // Excel -> PDF / CSV / ODS / XLSX
        if (src_ext == "xlsx" || src_ext == "xls" || src_ext == "ods") && ["pdf", "csv", "xlsx"].contains(&target_ext.as_str()) {
            let script = if target_ext == "pdf" {
                format!(
                    r#"
                    $ErrorActionPreference = 'Stop'
                    try {{
                        $excel = New-Object -ComObject Excel.Application
                        $excel.Visible = $false
                        $wb = $excel.Workbooks.Open('{input}')
                        $wb.ExportAsFixedFormat(0, '{output}')
                        $wb.Close($false)
                        $excel.Quit()
                        exit 0
                    }} catch {{
                        Write-Error $_.Exception.Message
                        exit 1
                    }}
                    "#,
                    input = p.to_string_lossy().replace("'", "''"),
                    output = output_path.to_string_lossy().replace("'", "''")
                )
            } else {
                let code = if target_ext == "csv" { 6 } else { 51 };
                format!(
                    r#"
                    $ErrorActionPreference = 'Stop'
                    try {{
                        $excel = New-Object -ComObject Excel.Application
                        $excel.Visible = $false
                        $wb = $excel.Workbooks.Open('{input}')
                        $wb.SaveAs('{output}', {code})
                        $wb.Close($false)
                        $excel.Quit()
                        exit 0
                    }} catch {{
                        Write-Error $_.Exception.Message
                        exit 1
                    }}
                    "#,
                    input = p.to_string_lossy().replace("'", "''"),
                    output = output_path.to_string_lossy().replace("'", "''"),
                    code = code
                )
            };
            let mut cmd = Command::new("powershell");
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &script]);
            if let Ok(res) = cmd.output() {
                if res.status.success() {
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
            }
        }

        // PDF -> DOCX / TXT via Word
        if src_ext == "pdf" && ["docx", "txt"].contains(&target_ext.as_str()) {
            let code = if target_ext == "docx" { 16 } else { 2 };
            let script = format!(
                r#"
                $ErrorActionPreference = 'Stop'
                try {{
                    $word = New-Object -ComObject Word.Application
                    $word.Visible = $false
                    $doc = $word.Documents.Open('{input}', [ref]$false, [ref]$true)
                    $doc.SaveAs([ref]'{output}', [ref]{code})
                    $doc.Close([ref]0)
                    $word.Quit()
                    exit 0
                }} catch {{
                    Write-Error $_.Exception.Message
                    exit 1
                }}
                "#,
                input = p.to_string_lossy().replace("'", "''"),
                output = output_path.to_string_lossy().replace("'", "''"),
                code = code
            );
            let mut cmd = Command::new("powershell");
            cmd.creation_flags(CREATE_NO_WINDOW);
            cmd.args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &script]);
            if let Ok(res) = cmd.output() {
                if res.status.success() {
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
            }
        }

        #[cfg(target_os = "macos")]
        {
            // 1. Try Microsoft Word via AppleScript if installed
            if Path::new("/Applications/Microsoft Word.app").exists() {
                let script = format!(
                    r#"
                    tell application "Microsoft Word"
                        set isRunning to running
                        open POSIX file "{input}"
                        set activeDoc to active document
                        save as activeDoc file name "{output}" file format format PDF
                        close activeDoc saving no
                        if not isRunning then
                            quit
                        end if
                    end tell
                    "#,
                    input = p.to_string_lossy().replace("\"", "\\\""),
                    output = output_path.to_string_lossy().replace("\"", "\\\"")
                );

                if let Ok(res) = Command::new("osascript").args(["-e", &script]).output() {
                    if res.status.success() && output_path.exists() {
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
                }
            }

            // 2. Fallback to LibreOffice if installed
            let soffice_paths = [
                "/Applications/LibreOffice.app/Contents/MacOS/soffice",
                "/usr/local/bin/soffice",
                "/opt/homebrew/bin/soffice",
            ];
            for soffice in soffice_paths {
                if Path::new(soffice).exists() {
                    let mut lo_cmd = Command::new(soffice);
                    lo_cmd.args([
                        "--headless",
                        "--convert-to",
                        "pdf",
                        "--outdir",
                        parent_dir.to_string_lossy().as_ref(),
                        p.to_string_lossy().as_ref(),
                    ]);

                    if let Ok(lo_res) = lo_cmd.output() {
                        if lo_res.status.success() && output_path.exists() {
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

            return Err("Gagal mengonversi dokumen Word. Pastikan Microsoft Word atau LibreOffice terpasang.".to_string());
        }

        #[cfg(not(any(target_os = "windows", target_os = "macos")))]
        {
            let soffice_paths = [
                "/usr/bin/soffice",
                "/usr/bin/libreoffice",
                "/usr/local/bin/soffice",
            ];
            for soffice in soffice_paths {
                if Path::new(soffice).exists() {
                    let mut lo_cmd = Command::new(soffice);
                    lo_cmd.args([
                        "--headless",
                        "--convert-to",
                        "pdf",
                        "--outdir",
                        parent_dir.to_string_lossy().as_ref(),
                        p.to_string_lossy().as_ref(),
                    ]);

                    if let Ok(lo_res) = lo_cmd.output() {
                        if lo_res.status.success() && output_path.exists() {
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

            return Err("Gagal mengonversi dokumen Word. Pastikan LibreOffice terpasang.".to_string());
        }
    }

    Err(format!(
        "Format konversi dari .{} ke .{} belum didukung atau aplikasi pendukung belum terpasang.",
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

pub fn is_autostart_enabled() -> bool {
    #[cfg(target_os = "windows")]
    {
        let output = Command::new("reg")
            .args(&["query", r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run", "/v", "CONZ"])
            .creation_flags(CREATE_NO_WINDOW)
            .output();
        if let Ok(out) = output {
            return out.status.success();
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(home) = std::env::var("HOME") {
            let plist_path = Path::new(&home).join("Library/LaunchAgents/com.lenovo.conz.plist");
            return plist_path.exists();
        }
    }

    false
}

pub fn set_autostart(enable: bool) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        if enable {
            let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
            let exe_path = current_exe.to_string_lossy().to_string();
            let value = format!("\"{}\"", exe_path);
            let status = Command::new("reg")
                .args(&[
                    "add",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "CONZ",
                    "/t",
                    "REG_SZ",
                    "/d",
                    &value,
                    "/f",
                ])
                .creation_flags(CREATE_NO_WINDOW)
                .status()
                .map_err(|e| e.to_string())?;
            if status.success() {
                Ok(())
            } else {
                Err("Gagal mendaftarkan registry startup".to_string())
            }
        } else {
            let _ = Command::new("reg")
                .args(&[
                    "delete",
                    r"HKCU\Software\Microsoft\Windows\CurrentVersion\Run",
                    "/v",
                    "CONZ",
                    "/f",
                ])
                .creation_flags(CREATE_NO_WINDOW)
                .status();
            Ok(())
        }
    }

    #[cfg(target_os = "macos")]
    {
        let home = std::env::var("HOME").map_err(|e| e.to_string())?;
        let launch_agents_dir = Path::new(&home).join("Library/LaunchAgents");
        let plist_path = launch_agents_dir.join("com.lenovo.conz.plist");

        if enable {
            let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
            let exe_path = current_exe.to_string_lossy();

            let plist_content = format!(
                r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.lenovo.conz</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
</dict>
</plist>"#,
                exe_path
            );

            let _ = fs::create_dir_all(&launch_agents_dir);
            fs::write(&plist_path, plist_content).map_err(|e| e.to_string())?;
            Ok(())
        } else {
            if plist_path.exists() {
                let _ = fs::remove_file(&plist_path);
            }
            Ok(())
        }
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let _ = enable;
        Ok(())
    }
}

#[tauri::command]
fn get_autostart_status() -> bool {
    is_autostart_enabled()
}

#[tauri::command]
fn toggle_autostart_status() -> bool {
    let next = !is_autostart_enabled();
    let _ = set_autostart(next);
    next
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                // Set accessory activation policy to hide app from macOS Dock
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            // Otomatis aktifkan agar selalu jalan saat booting
            let _ = set_autostart(true);

            // Build Tray Icon with Menu
            let status_item = MenuItem::with_id(app, "status", "CONZ: Drag + Tahan Shift", false, None::<&str>)?;
            let autostart_item = MenuItem::with_id(app, "toggle_autostart", "Jalankan Otomatis saat Startup (Toggle)", true, None::<&str>)?;
            let test_item = MenuItem::with_id(app, "test", "Tes Radial Menu", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Keluar", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&status_item, &autostart_item, &test_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .tooltip("CONZ — File Converter (Drag + Shift)")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "toggle_autostart" => {
                        let new_state = !is_autostart_enabled();
                        let _ = set_autostart(new_state);
                        let msg = if new_state {
                            "CONZ diaktifkan: Akan otomatis berjalan saat laptop dinyalakan."
                        } else {
                            "CONZ dinonaktifkan dari startup."
                        };
                        let _ = app
                            .notification()
                            .builder()
                            .title("CONZ Startup Settings")
                            .body(msg)
                            .show();
                    }
                    "test" => {
                        if let Some(window) = app.get_webview_window("main") {
                            set_window_position_at_cursor(&window);
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
                            set_window_position_at_cursor(&window);
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

                    let is_active = is_drag_shift_active();
                    if is_active {
                        if let Some((x, y)) = get_current_mouse_pos() {
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
                                    set_window_position_at_cursor(&window);
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
            hide_radial_window,
            get_autostart_status,
            toggle_autostart_status
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
