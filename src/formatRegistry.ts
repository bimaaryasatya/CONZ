import { FormatChamber } from "./types";

export interface FileTypeDefinition {
  category: "document" | "image" | "data" | "media" | "other";
  name: string;
  badgeColor: string;
  targetChambers: FormatChamber[];
}

export const FORMAT_MAP: Record<string, FileTypeDefinition> = {
  // Documents
  docx: {
    category: "document",
    name: "Microsoft Word (DOCX)",
    badgeColor: "#2563eb",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Portable Document Format (Presisi Tinggi)" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstrak Teks Polos" },
      { format: "html", label: "HTML", color: "#f97316", description: "Format Web Halaman" },
      { format: "odt", label: "ODT", color: "#8b5cf6", description: "OpenDocument Text" },
    ],
  },
  doc: {
    category: "document",
    name: "Word Document (DOC)",
    badgeColor: "#2563eb",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Portable Document Format" },
      { format: "docx", label: "DOCX", color: "#3b82f6", description: "Modern Office Open XML" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstrak Teks Polos" },
    ],
  },
  pdf: {
    category: "document",
    name: "PDF Document",
    badgeColor: "#ef4444",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Render ke Gambar PNG" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Render ke Gambar JPG" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstraksi Teks PDF" },
    ],
  },
  txt: {
    category: "document",
    name: "Plain Text (TXT)",
    badgeColor: "#64748b",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Cetak Dokumen PDF" },
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Dokumen Word Formal" },
      { format: "html", label: "HTML", color: "#f97316", description: "Markup Web HTML" },
    ],
  },
  md: {
    category: "document",
    name: "Markdown Document",
    badgeColor: "#0284c7",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF Berformat" },
      { format: "html", label: "HTML", color: "#f97316", description: "Render HTML Halaman" },
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Dokumen Microsoft Word" },
    ],
  },

  // Images
  png: {
    category: "image",
    name: "PNG Image",
    badgeColor: "#06b6d4",
    targetChambers: [
      { format: "webp", label: "WEBP", color: "#10b981", description: "Format Web Modern Kompresi Tinggi" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Foto Standar JPEG Kompak" },
      { format: "ico", label: "ICO", color: "#8b5cf6", description: "Ikon Aplikasi Windows" },
      { format: "bmp", label: "BMP", color: "#6366f1", description: "Bitmap Tanpa Kompresi" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Bungkus ke Dokumen PDF" },
    ],
  },
  jpg: {
    category: "image",
    name: "JPEG Image",
    badgeColor: "#f59e0b",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Format Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#10b981", description: "Ukuran Ringan untuk Web" },
      { format: "ico", label: "ICO", color: "#8b5cf6", description: "Ikon Windows (16x16 - 256x256)" },
      { format: "bmp", label: "BMP", color: "#6366f1", description: "Bitmap Mentah" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF Halaman Penuh" },
    ],
  },
  jpeg: {
    category: "image",
    name: "JPEG Image",
    badgeColor: "#f59e0b",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Format Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#10b981", description: "Format Web Ringan" },
      { format: "ico", label: "ICO", color: "#8b5cf6", description: "Ikon Windows" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Bungkus Dokumen PDF" },
    ],
  },
  webp: {
    category: "image",
    name: "WebP Image",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Gambar Lossless Kompatibel" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Foto Standar JPEG" },
      { format: "ico", label: "ICO", color: "#8b5cf6", description: "Ikon Aplikasi" },
      { format: "bmp", label: "BMP", color: "#6366f1", description: "Bitmap Standar" },
    ],
  },
  bmp: {
    category: "image",
    name: "Bitmap Image",
    badgeColor: "#6366f1",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Kompresi Lossless Hemat Ruang" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Foto Kompak JPEG" },
      { format: "webp", label: "WEBP", color: "#10b981", description: "Ukuran Mini untuk Web" },
      { format: "ico", label: "ICO", color: "#8b5cf6", description: "Ikon Aplikasi" },
    ],
  },
  ico: {
    category: "image",
    name: "Icon File (ICO)",
    badgeColor: "#8b5cf6",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Ekstrak Gambar Transparan" },
      { format: "webp", label: "WEBP", color: "#10b981", description: "Format Web Ringan" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Foto Standar" },
    ],
  },

  // Data
  csv: {
    category: "data",
    name: "Comma Separated Values (CSV)",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "json", label: "JSON", color: "#f59e0b", description: "Array Objek JavaScript" },
      { format: "xlsx", label: "XLSX", color: "#22c55e", description: "Excel Spreadsheet" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Teks Tabulasi" },
    ],
  },
};

export const getFileTypeInfo = (filename: string): FileTypeDefinition => {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (FORMAT_MAP[ext]) {
    return FORMAT_MAP[ext];
  }
  // Default fallback
  return {
    category: "other",
    name: `File .${ext.toUpperCase() || "UNKNOWN"}`,
    badgeColor: "#6366f1",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Bungkus ke Dokumen PDF" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Teks / Dump Hex" },
      { format: "zip", label: "ZIP", color: "#eab308", description: "Kompresi Arsip" },
    ],
  };
};
