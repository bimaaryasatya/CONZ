# CONZ

> Instant, gesture-driven radial file converter for Windows.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)
[![Platform: Windows](https://img.shields.io/badge/Platform-Windows-0078D6.svg?style=flat-square&logo=windows&logoColor=white)](#)
[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB.svg?style=flat-square&logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-2024-DEA584.svg?style=flat-square&logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)

---

## Overview

**CONZ** is a lightweight Windows utility engineered to streamline everyday file conversions. Designed to operate unobtrusively in the background, CONZ eliminates traditional multi-step conversion workflows by integrating directly with native OS drag-and-drop interactions.

Holding <kbd>Shift</kbd> while dragging a file summons an always-on-top, hardware-accelerated radial HUD centered on the cursor. Releasing the file over a target format sector queues the conversion asynchronously in the background, writing the output directly to the source directory.

---

## Features

- **System Tray Operation**  
  Runs quietly in the background without persistent windows or command prompt instances. Accessible on demand via system tray or global gestures.

- **Gesture-Based Radial Trigger**  
  Low-level global mouse and keyboard monitoring detects `Shift + Left-Click Drag` across Windows Explorer and the Desktop, spawning the radial HUD directly at the cursor coordinates.

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

| Category | Source Formats | Target Formats | Processing Engine |
| :--- | :--- | :--- | :--- |
| **Documents** | `.docx`, `.doc` | `.pdf`, `.txt`, `.html`, `.odt` | COM Automation / Headless LibreOffice |
| **Images to PDF** | `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.ico` | `.pdf` | Native Rust PDF 1.4 Engine |
| **Image Conversion** | `.png`, `.jpg`, `.webp`, `.bmp`, `.ico` | `.png`, `.jpg`, `.webp`, `.bmp`, `.ico` | Native Image Encoder (`image` crate) |
| **Data** | `.csv` | `.json`, `.xlsx` | Rust Data Pipeline |

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
- [Rust](https://www.rust-lang.org/tools/install) (latest stable toolchain with MSVC target)
- Windows 10/11 with WebView2 Runtime (preinstalled on modern Windows)

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
