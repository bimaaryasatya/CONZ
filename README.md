<div align="center">

# 🎯 CONZ — Instant Radial File Converter

**A lightweight, background desktop utility for Windows with Figma-inspired radial menus and instant Drag + Shift conversion.**

[![Tauri v2](https://img.shields.io/badge/Tauri-v2-24C8DB?logo=tauri&logoColor=white)](https://tauri.app)
[![Rust](https://img.shields.io/badge/Rust-2024-DEA584?logo=rust&logoColor=white)](https://www.rust-lang.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Platform](https://img.shields.io/badge/Platform-Windows-0078D6?logo=windows&logoColor=white)](#)

</div>

---

## ✨ Overview

**CONZ** is a modern Windows desktop utility designed for lightning-fast file conversions with zero friction. It lives quietly in your Windows **System Tray**, consuming minimal RAM (~25-35 MB).

Whenever you drag a file anywhere on your computer (File Explorer, Desktop) and hold the <kbd>Shift</kbd> key, CONZ instantly pops open a sleek, glassmorphic **Radial Revolver Menu** right under your mouse cursor. Drop the file onto your desired target format, and CONZ converts it asynchronously in the background, saving the converted file directly into the original folder!

---

## 🌟 Key Features

- **🔕 100% Background System Tray Utility**:
  - Runs silently without opening standard bulky app windows or flashing CMD console windows.
  - Stays standby in the Windows system tray until summoned.

- **⚡ Drag + Shift Instant Radial Trigger**:
  - Hold <kbd>Shift</kbd> while dragging any file from Explorer to summon the radial menu right at your cursor position.
  - Fast-trigger keyboard shortcuts `[1]`, `[2]`, `[3]`, `[4]` for rapid format selection.

- **🎨 Figma-Inspired Radial Revolver UI**:
  - Frosted glassmorphism aesthetic with subtle grid texture.
  - Active blue sector wedge highlight that glides with smooth `cubic-bezier` physics at 60+ FPS.
  - External pill capsules with shortcut keys and format labels.

- **🖼️ Native Image-to-PDF Engine**:
  - Built-in native Rust image-to-PDF converter (supports `PNG`, `JPG`, `JPEG`, `WEBP`, `BMP`, `ICO`).
  - Converts images to crisp, full-resolution PDF documents in under ~15 milliseconds with zero external dependencies.

- **📄 Silent Document Conversion (DOCX ➔ PDF)**:
  - Uses Windows background COM automation with `CREATE_NO_WINDOW` and hidden window styles — no PowerShell windows pop up on your screen.
  - Automatic fallback to headless LibreOffice if Microsoft Office is not present.

- **🚀 Non-Blocking Asynchronous Queue**:
  - Drop a file and the radial menu closes instantly (0 ms delay).
  - You can immediately drag and drop other files without waiting.
  - Native Windows toast notifications announce each completed conversion in the background.

---

## 🔄 Supported Conversions

| Source Type      | Source Formats                                   | Target Formats                          | Engine                                     |
| :--------------- | :----------------------------------------------- | :-------------------------------------- | :----------------------------------------- |
| **Documents**    | `.docx`, `.doc`                                  | `.pdf`, `.txt`, `.html`, `.odt`         | Word COM / Headless LibreOffice            |
| **Images**       | `.png`, `.jpg`, `.jpeg`, `.webp`, `.bmp`, `.ico` | `.pdf`                                  | Native Rust PDF 1.4 Encoder                |
| **Image Matrix** | `.png`, `.jpg`, `.webp`, `.bmp`, `.ico`          | `.png`, `.jpg`, `.webp`, `.bmp`, `.ico` | Native `image` crate (lossless/compressed) |
| **Data**         | `.csv`                                           | `.json`, `.xlsx`                        | Built-in Parsers                           |

---

## 🛠️ Architecture & Tech Stack

```text
CONZ/
├── src-tauri/                 # Rust Backend (Tauri v2)
│   ├── src/
│   │   ├── main.rs            # Windows subsystem entry (no CMD window)
│   │   └── lib.rs             # System Tray, Global Drag+Shift Hook, PDF Engine, Conversion Workers
│   └── tauri.conf.json        # Borderless, transparent, always-on-top window setup
└── src/                       # Frontend (React 19 + TypeScript + Vite)
    ├── components/
    │   └── RevolverMenu.tsx   # Figma-style radial revolver wheel with continuous circular tracking
    ├── formatRegistry.ts      # Multi-format capability mappings
    ├── api.ts                 # Tauri IPC Bridge
    ├── App.tsx                # Native OS drag-drop coordinator
    └── App.css                # Glassmorphism tokens and 60fps GPU-accelerated styling
```

---

## 💻 Getting Started

### Prerequisites

1. [Node.js](https://nodejs.org) (v18 or newer)
2. [Rust](https://www.rust-lang.org/tools/install) (`rustup` with `msvc` toolchain)

### Installation

```powershell
# Clone repository
git clone https://github.com/bimaaryasatya/CONZ.git
cd CONZ

# Install Node dependencies
npm install
```

### Development Mode

```powershell
npm run tauri dev
```

### Production Build

To create a standalone portable `.exe` and an NSIS installer:

```powershell
npm run tauri build
```

Output files will be generated in:

- **Standalone Executable:** `src-tauri/target/release/conz.exe` (~5.7 MB)
- **NSIS Installer:** `src-tauri/target/release/bundle/nsis/CONZ_0.1.0_x64-setup.exe`

---

## 🎮 How to Use

1. Launch `conz.exe`. The application docks into your **System Tray**.
2. Select any file in **File Explorer** or on your **Desktop**.
3. Hold <kbd>Shift</kbd> and start dragging the file.
4. The **CONZ Radial Menu** appears directly around your cursor.
5. Drop the file onto your desired target format chamber (e.g. `PDF`).
6. The menu closes instantly, the file is converted in the same folder, and Windows notifies you when it's done!

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
