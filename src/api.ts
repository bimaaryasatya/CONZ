import { invoke } from "@tauri-apps/api/core";
import { ConvertResult, FileMetadata } from "./types";

// Helper to detect if running inside Tauri runtime
export const isTauri = (): boolean => {
  return typeof window !== "undefined" && ("__TAURI_INTERNALS__" in window || "__TAURI__" in window);
};

export const api = {
  async getFileMetadata(filePath: string): Promise<FileMetadata> {
    if (isTauri()) {
      return await invoke<FileMetadata>("get_file_metadata", { filePath });
    }
    // Browser mock
    const filename = filePath.split(/[/\\]/).pop() || "sample.docx";
    const ext = filename.split(".").pop()?.toLowerCase() || "docx";
    return {
      name: filename,
      extension: ext,
      dir: "C:\\Users\\LENOVO\\Documents",
      size_bytes: 142500,
    };
  },

  async convertFile(inputPath: string, targetFormat: string): Promise<ConvertResult> {
    if (isTauri()) {
      return await invoke<ConvertResult>("convert_file", {
        inputPath,
        targetFormat,
      });
    }

    // Browser simulation fallback for testing UI
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const filename = inputPath.split(/[/\\]/).pop() || "sample.docx";
    const stem = filename.substring(0, filename.lastIndexOf(".")) || filename;
    const outputFilename = `${stem}_converted.${targetFormat.toLowerCase()}`;
    const parentDir = "C:\\Users\\LENOVO\\Documents";
    const outputPath = `${parentDir}\\${outputFilename}`;

    return {
      success: true,
      input_path: inputPath,
      output_path: outputPath,
      output_filename: outputFilename,
      message: `Berhasil dikonversi ke ${targetFormat.toUpperCase()} (Simulasi Browser)`,
      size_bytes: 89400,
    };
  },

  async openInFolder(filePath: string): Promise<boolean> {
    if (isTauri()) {
      return await invoke<boolean>("open_in_folder", { filePath });
    }
    console.log("[Simulasi] Buka folder untuk file:", filePath);
    alert(`[Simulasi Browser] Membuka lokasi file di folder:\n${filePath}`);
    return true;
  },

  async hideRadialWindow(): Promise<void> {
    if (isTauri()) {
      await invoke("hide_radial_window");
    }
  },
};
