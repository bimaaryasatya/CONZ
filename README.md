# CONZ

> Instant, gesture-driven radial file converter for Windows & macOS.

[![License: MIT](https://img.shields.io/badge/license-GNU/GPLv3-blue.svg?style=flat-square)](LICENSE)
[![Platform: Windows & macOS](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS-0078D6.svg?style=flat-square)](#)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB.svg?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-2024-DEA584.svg?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)

---

## Overview

**CONZ** is a lightweight utility engineered to streamline everyday file conversions. Designed to operate unobtrusively in the background, CONZ eliminates traditional multi-step conversion workflows by integrating directly with native OS drag-and-drop interactions.

Holding <kbd>Shift</kbd> while dragging a file summons an always-on-top, hardware-accelerated radial HUD centered on the cursor. Releasing the file over a target format sector queues the conversion asynchronously in the background, writing the output directly to the source directory.

---

## Features

- **System Tray / Menu Bar Operation**  
  Runs quietly in the background without persistent windows or command prompt instances. Accessible on demand via system tray / menu bar or global gestures.

- **Gesture-Based Radial Trigger**  
  Low-level global mouse and keyboard monitoring detects `Shift + Left-Click Drag` across Windows Explorer / macOS Finder and the Desktop, spawning the radial HUD directly at the cursor coordinates.

- **Dynamic Radial HUD**  
  Hardware-accelerated interface featuring continuous angular interpolation, glassmorphic sector highlights, and keyboard shortcuts (`1`, `2`, `3`, `4`) for rapid selection.

- **Native Image-to-PDF Engine**  
  In-memory Rust PDF 1.4 compiler supporting PNG, JPEG, WebP, BMP, and ICO formats. Generates clean, zero-loss PDF files in ~15 ms without external runtime dependencies.

- **Headless Document Conversion**  
  Converts DOCX and DOC to PDF via hidden Windows COM automation (Microsoft Word) with headless LibreOffice fallback. Runs under `CREATE_NO_WINDOW` flags to ensure no console or PowerShell windows appear.

- **Asynchronous Execution Queue**  
  File conversions execute in worker threads without blocking the user interface. Batch or successive conversions can be triggered back-to-back, with OS notifications dispatched upon completion.

---

## Supported Formats

CONZ supports over 50 file formats across 9 dedicated categories, powered by high-performance native engines, bundled portable FFmpeg, and headless document automation:

| Category | Source Formats | Target Formats | Processing Engine |
| :--- | :--- | :--- | :--- |
| **Images** | `.png`, `.jpg`, `.jpeg`, `.webp`, `.heic`, `.tiff`, `.tif`, `.avif`, `.bmp`, `.svg` | `.webp`, `.jpg`, `.png`, `.heic`, `.tiff`, `.avif`, `.bmp`, `.pdf` | Native Rust `image` encoder, in-memory PDF 1.4, FFmpeg |
| **Audio** | `.mp3`, `.wav`, `.m4a`, `.flac`, `.ogg`, `.opus`, `.aiff`, `.wma` | `.mp3`, `.wav`, `.m4a`, `.flac`, `.ogg`, `.opus`, `.aiff`, `.wma` | High-fidelity portable FFmpeg audio pipeline |
| **Video** | `.mp4`, `.mov`, `.mkv`, `.webm`, `.avi`, `.wmv`, `.gif` | `.mp4`, `.gif`, `.mp3` (audio rip), `.mov`, `.mkv`, `.webm`, `.avi`, `.wmv` | Bundled FFmpeg video transcoding & palette-optimized GIF encoder |
| **PDF** | `.pdf` | `.docx`, `.pptx`, `.xlsx`, `.png` (300 DPI), `.jpg`, `.txt`, `.md` | Multi-engine document parser & rasterizer |
| **Documents** | `.docx`, `.doc`, `.md`, `.markdown`, `.txt`, `.rtf`, `.epub`, `.pages` | `.pdf`, `.docx`, `.txt`, `.md`, `.html`, `.epub` | Hidden COM automation (Word) / macOS `textutil` / LibreOffice |
| **Slides** | `.pptx`, `.ppt` | `.pdf`, `.jpg`, `.png`, `.pptx` | Hidden PowerPoint COM automation / LibreOffice headless |
| **Spreadsheets** | `.xlsx`, `.xls`, `.csv`, `.tsv`, `.ods` | `.xlsx`, `.csv`, `.tsv`, `.pdf`, `.ods` | Native Rust delimiter parser & Excel COM automation |
| **Subtitles** | `.srt`, `.vtt` | `.vtt`, `.srt`, `.txt` (clean transcript) | Zero-dependency native Rust timestamp & cue parser |
| **Archives** | `.zip`, `.tar`, `.gz`, `.tgz`, `.rar` | `.zip`, `.tar`, `.tar.gz` | Native OS compression pipeline (`tar.exe` / macOS `tar`) |

---

## System Architecture

```text
CONZ/
├── src-tauri/                 # Rust Backend (Tauri v2)
│   ├── src/
│   │   ├── main.rs            # Windows subsystem configuration (no console window)
│   │   └── lib.rs             # Tray management, Win32 hooks, PDF engine, worker pool
│   └── tauri.conf.json        # Transparent, frameless window specification
└── src/                       # Frontend UI (React 19, TypeScript, Vite)
    ├── components/
    │   └── RevolverMenu.tsx   # 60 FPS GPU-accelerated radial interface
    ├── formatRegistry.ts      # Format compatibility matrix
    ├── api.ts                 # Tauri IPC bindings
    ├── App.tsx                # Drag-and-drop state coordinator
    └── App.css                # Visual tokens and animations
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0 or higher)
- [Rust](https://www.rust-lang.org/tools/install) (latest stable toolchain)
- Windows 10/11 with WebView2 Runtime, or macOS 10.15+ (Catalina or higher)

### Installation

```powershell
# Clone the repository
git clone https://github.com/bimaaryasatya/CONZ.git
cd CONZ

# Install frontend dependencies
npm install
```

### Development

To run the application with hot reloading:

```powershell
npm run tauri dev
```

### Production Build

To compile a production binary and installer:

```powershell
npm run tauri build
```

Build outputs are located in:

- **Portable Executable:** `src-tauri/target/release/conz.exe` (~5.7 MB)
- **NSIS Installer:** `src-tauri/target/release/bundle/nsis/CONZ_0.1.0_x64-setup.exe`

---

## Usage

1. Start `conz.exe`. The application minimizes to the system tray.
2. In Windows Explorer or on the Desktop, select any supported file.
3. Hold <kbd>Shift</kbd> and drag the file.
4. The radial wheel will appear around your cursor.
5. Move the cursor to hover over the desired format (or press the corresponding number key).
6. Release the mouse button to initiate conversion.
7. A Windows notification will alert you when conversion is complete.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
