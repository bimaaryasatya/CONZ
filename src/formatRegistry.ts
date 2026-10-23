import { FormatChamber } from "./types";

export interface FileTypeDefinition {
  category: "document" | "image" | "data" | "media" | "audio" | "video" | "slide" | "subtitle" | "archive" | "other";
  name: string;
  badgeColor: string;
  targetChambers: FormatChamber[];
}

export const FORMAT_MAP: Record<string, FileTypeDefinition> = {
  // ==========================================
  // 1. IMAGES (JPG, PNG, WebP, HEIC, TIFF, AVIF, BMP, SVG)
  // ==========================================
  png: {
    category: "image",
    name: "PNG Image",
    badgeColor: "#06b6d4",
    targetChambers: [
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Kompak" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Standar Foto JPEG" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "tiff", label: "TIFF", color: "#6366f1", description: "Tagged Image File" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Bungkus Dokumen PDF" },
    ],
  },
  jpg: {
    category: "image",
    name: "JPEG Image",
    badgeColor: "#f59e0b",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "tiff", label: "TIFF", color: "#6366f1", description: "Tagged Image File" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  jpeg: {
    category: "image",
    name: "JPEG Image",
    badgeColor: "#f59e0b",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "tiff", label: "TIFF", color: "#6366f1", description: "Tagged Image File" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  webp: {
    category: "image",
    name: "WebP Image",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Standar Foto JPEG" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "tiff", label: "TIFF", color: "#6366f1", description: "Tagged Image File" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  heic: {
    category: "image",
    name: "HEIC Image",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Standar Foto JPEG" },
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "tiff", label: "TIFF", color: "#6366f1", description: "Tagged Image File" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  tiff: {
    category: "image",
    name: "TIFF Image",
    badgeColor: "#6366f1",
    targetChambers: [
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Standar Foto JPEG" },
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  tif: {
    category: "image",
    name: "TIFF Image",
    badgeColor: "#6366f1",
    targetChambers: [
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Standar Foto JPEG" },
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  avif: {
    category: "image",
    name: "AVIF Image",
    badgeColor: "#ec4899",
    targetChambers: [
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Standar Foto JPEG" },
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "tiff", label: "TIFF", color: "#6366f1", description: "Tagged Image File" },
      { format: "bmp", label: "BMP", color: "#8b5cf6", description: "Windows Bitmap" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  bmp: {
    category: "image",
    name: "Bitmap Image",
    badgeColor: "#8b5cf6",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Lossless Transparan" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Standar Foto JPEG" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "heic", label: "HEIC", color: "#10b981", description: "High Efficiency Image" },
      { format: "tiff", label: "TIFF", color: "#6366f1", description: "Tagged Image File" },
      { format: "avif", label: "AVIF", color: "#ec4899", description: "AV1 Image File" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
    ],
  },
  svg: {
    category: "image",
    name: "SVG Vector",
    badgeColor: "#f97316",
    targetChambers: [
      { format: "png", label: "PNG", color: "#06b6d4", description: "Rasterize ke PNG" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Rasterize ke JPEG" },
      { format: "webp", label: "WEBP", color: "#ff5500", description: "Format Web Ringan" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Vektor Dokumen PDF" },
    ],
  },

  // ==========================================
  // 2. AUDIO (MP3, M4A, WAV, FLAC, OGG, Opus, AIFF, WMA)
  // ==========================================
  mp3: {
    category: "audio",
    name: "MP3 Audio",
    badgeColor: "#3b82f6",
    targetChambers: [
      { format: "wav", label: "WAV", color: "#06b6d4", description: "PCM Audio Tak Terkompresi" },
      { format: "m4a", label: "M4A", color: "#10b981", description: "Apple AAC Audio" },
      { format: "flac", label: "FLAC", color: "#8b5cf6", description: "Lossless Audio" },
      { format: "ogg", label: "OGG", color: "#f59e0b", description: "Vorbis Audio" },
      { format: "opus", label: "OPUS", color: "#ec4899", description: "Opus Low Latency" },
      { format: "aiff", label: "AIFF", color: "#6366f1", description: "Audio Interchange Format" },
      { format: "wma", label: "WMA", color: "#64748b", description: "Windows Media Audio" },
    ],
  },
  wav: {
    category: "audio",
    name: "WAV Audio",
    badgeColor: "#06b6d4",
    targetChambers: [
      { format: "mp3", label: "MP3", color: "#3b82f6", description: "Kompresi Standar MP3" },
      { format: "m4a", label: "M4A", color: "#10b981", description: "Apple AAC Audio" },
      { format: "flac", label: "FLAC", color: "#8b5cf6", description: "Lossless Audio" },
      { format: "ogg", label: "OGG", color: "#f59e0b", description: "Vorbis Audio" },
      { format: "opus", label: "OPUS", color: "#ec4899", description: "Opus Low Latency" },
      { format: "aiff", label: "AIFF", color: "#6366f1", description: "Audio Interchange Format" },
      { format: "wma", label: "WMA", color: "#64748b", description: "Windows Media Audio" },
    ],
  },
  m4a: {
    category: "audio",
    name: "M4A Audio",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "mp3", label: "MP3", color: "#3b82f6", description: "Standar MP3" },
      { format: "wav", label: "WAV", color: "#06b6d4", description: "PCM Tak Terkompresi" },
      { format: "flac", label: "FLAC", color: "#8b5cf6", description: "Lossless Audio" },
      { format: "ogg", label: "OGG", color: "#f59e0b", description: "Vorbis Audio" },
      { format: "opus", label: "OPUS", color: "#ec4899", description: "Opus Low Latency" },
      { format: "aiff", label: "AIFF", color: "#6366f1", description: "Audio Interchange Format" },
      { format: "wma", label: "WMA", color: "#64748b", description: "Windows Media Audio" },
    ],
  },
  flac: {
    category: "audio",
    name: "FLAC Audio",
    badgeColor: "#8b5cf6",
    targetChambers: [
      { format: "mp3", label: "MP3", color: "#3b82f6", description: "Standar MP3" },
      { format: "wav", label: "WAV", color: "#06b6d4", description: "PCM Audio" },
      { format: "m4a", label: "M4A", color: "#10b981", description: "Apple AAC Audio" },
      { format: "ogg", label: "OGG", color: "#f59e0b", description: "Vorbis Audio" },
      { format: "opus", label: "OPUS", color: "#ec4899", description: "Opus Low Latency" },
      { format: "aiff", label: "AIFF", color: "#6366f1", description: "Audio Interchange Format" },
      { format: "wma", label: "WMA", color: "#64748b", description: "Windows Media Audio" },
    ],
  },
  ogg: {
    category: "audio",
    name: "OGG Audio",
    badgeColor: "#f59e0b",
    targetChambers: [
      { format: "mp3", label: "MP3", color: "#3b82f6", description: "Standar MP3" },
      { format: "wav", label: "WAV", color: "#06b6d4", description: "PCM Audio" },
      { format: "m4a", label: "M4A", color: "#10b981", description: "Apple AAC Audio" },
      { format: "flac", label: "FLAC", color: "#8b5cf6", description: "Lossless Audio" },
      { format: "opus", label: "OPUS", color: "#ec4899", description: "Opus Low Latency" },
      { format: "aiff", label: "AIFF", color: "#6366f1", description: "Audio Interchange Format" },
      { format: "wma", label: "WMA", color: "#64748b", description: "Windows Media Audio" },
    ],
  },
  opus: {
    category: "audio",
    name: "Opus Audio",
    badgeColor: "#ec4899",
    targetChambers: [
      { format: "mp3", label: "MP3", color: "#3b82f6", description: "Standar MP3" },
      { format: "wav", label: "WAV", color: "#06b6d4", description: "PCM Audio" },
      { format: "m4a", label: "M4A", color: "#10b981", description: "Apple AAC Audio" },
      { format: "flac", label: "FLAC", color: "#8b5cf6", description: "Lossless Audio" },
      { format: "ogg", label: "OGG", color: "#f59e0b", description: "Vorbis Audio" },
      { format: "aiff", label: "AIFF", color: "#6366f1", description: "Audio Interchange Format" },
      { format: "wma", label: "WMA", color: "#64748b", description: "Windows Media Audio" },
    ],
  },
  aiff: {
    category: "audio",
    name: "AIFF Audio",
    badgeColor: "#6366f1",
    targetChambers: [
      { format: "mp3", label: "MP3", color: "#3b82f6", description: "Standar MP3" },
      { format: "wav", label: "WAV", color: "#06b6d4", description: "PCM Audio" },
      { format: "m4a", label: "M4A", color: "#10b981", description: "Apple AAC Audio" },
      { format: "flac", label: "FLAC", color: "#8b5cf6", description: "Lossless Audio" },
      { format: "ogg", label: "OGG", color: "#f59e0b", description: "Vorbis Audio" },
      { format: "opus", label: "OPUS", color: "#ec4899", description: "Opus Low Latency" },
      { format: "wma", label: "WMA", color: "#64748b", description: "Windows Media Audio" },
    ],
  },
  wma: {
    category: "audio",
    name: "WMA Audio",
    badgeColor: "#64748b",
    targetChambers: [
      { format: "mp3", label: "MP3", color: "#3b82f6", description: "Standar MP3" },
      { format: "wav", label: "WAV", color: "#06b6d4", description: "PCM Audio" },
      { format: "m4a", label: "M4A", color: "#10b981", description: "Apple AAC Audio" },
      { format: "flac", label: "FLAC", color: "#8b5cf6", description: "Lossless Audio" },
      { format: "ogg", label: "OGG", color: "#f59e0b", description: "Vorbis Audio" },
      { format: "opus", label: "OPUS", color: "#ec4899", description: "Opus Low Latency" },
      { format: "aiff", label: "AIFF", color: "#6366f1", description: "Audio Interchange Format" },
    ],
  },

  // ==========================================
  // 3. VIDEO (MP4, MOV, MKV, WebM, AVI, WMV, GIF)
  // ==========================================
  mp4: {
    category: "video",
    name: "MP4 Video",
    badgeColor: "#3b82f6",
    targetChambers: [
      { format: "gif", label: "GIF", color: "#ff5500", description: "Animasi GIF" },
      { format: "mp3", label: "MP3", color: "#10b981", description: "Ekstrak Audio MP3" },
      { format: "mov", label: "MOV", color: "#6366f1", description: "Apple QuickTime" },
      { format: "mkv", label: "MKV", color: "#8b5cf6", description: "Matroska Video" },
      { format: "webm", label: "WEBM", color: "#06b6d4", description: "Web Video HTML5" },
      { format: "avi", label: "AVI", color: "#f59e0b", description: "Audio Video Interleave" },
      { format: "wmv", label: "WMV", color: "#64748b", description: "Windows Media Video" },
    ],
  },
  mov: {
    category: "video",
    name: "MOV Video",
    badgeColor: "#6366f1",
    targetChambers: [
      { format: "mp4", label: "MP4", color: "#3b82f6", description: "Standar H.264 MP4" },
      { format: "gif", label: "GIF", color: "#ff5500", description: "Animasi GIF" },
      { format: "mp3", label: "MP3", color: "#10b981", description: "Ekstrak Audio MP3" },
      { format: "mkv", label: "MKV", color: "#8b5cf6", description: "Matroska Video" },
      { format: "webm", label: "WEBM", color: "#06b6d4", description: "Web Video HTML5" },
      { format: "avi", label: "AVI", color: "#f59e0b", description: "Audio Video Interleave" },
      { format: "wmv", label: "WMV", color: "#64748b", description: "Windows Media Video" },
    ],
  },
  mkv: {
    category: "video",
    name: "MKV Video",
    badgeColor: "#8b5cf6",
    targetChambers: [
      { format: "mp4", label: "MP4", color: "#3b82f6", description: "Standar H.264 MP4" },
      { format: "gif", label: "GIF", color: "#ff5500", description: "Animasi GIF" },
      { format: "mp3", label: "MP3", color: "#10b981", description: "Ekstrak Audio MP3" },
      { format: "mov", label: "MOV", color: "#6366f1", description: "Apple QuickTime" },
      { format: "webm", label: "WEBM", color: "#06b6d4", description: "Web Video HTML5" },
      { format: "avi", label: "AVI", color: "#f59e0b", description: "Audio Video Interleave" },
      { format: "wmv", label: "WMV", color: "#64748b", description: "Windows Media Video" },
    ],
  },
  webm: {
    category: "video",
    name: "WebM Video",
    badgeColor: "#06b6d4",
    targetChambers: [
      { format: "mp4", label: "MP4", color: "#3b82f6", description: "Standar H.264 MP4" },
      { format: "gif", label: "GIF", color: "#ff5500", description: "Animasi GIF" },
      { format: "mp3", label: "MP3", color: "#10b981", description: "Ekstrak Audio MP3" },
      { format: "mov", label: "MOV", color: "#6366f1", description: "Apple QuickTime" },
      { format: "mkv", label: "MKV", color: "#8b5cf6", description: "Matroska Video" },
      { format: "avi", label: "AVI", color: "#f59e0b", description: "Audio Video Interleave" },
      { format: "wmv", label: "WMV", color: "#64748b", description: "Windows Media Video" },
    ],
  },
  avi: {
    category: "video",
    name: "AVI Video",
    badgeColor: "#f59e0b",
    targetChambers: [
      { format: "mp4", label: "MP4", color: "#3b82f6", description: "Standar H.264 MP4" },
      { format: "gif", label: "GIF", color: "#ff5500", description: "Animasi GIF" },
      { format: "mp3", label: "MP3", color: "#10b981", description: "Ekstrak Audio MP3" },
      { format: "mov", label: "MOV", color: "#6366f1", description: "Apple QuickTime" },
      { format: "mkv", label: "MKV", color: "#8b5cf6", description: "Matroska Video" },
      { format: "webm", label: "WEBM", color: "#06b6d4", description: "Web Video HTML5" },
      { format: "wmv", label: "WMV", color: "#64748b", description: "Windows Media Video" },
    ],
  },
  wmv: {
    category: "video",
    name: "WMV Video",
    badgeColor: "#64748b",
    targetChambers: [
      { format: "mp4", label: "MP4", color: "#3b82f6", description: "Standar H.264 MP4" },
      { format: "gif", label: "GIF", color: "#ff5500", description: "Animasi GIF" },
      { format: "mp3", label: "MP3", color: "#10b981", description: "Ekstrak Audio MP3" },
      { format: "mov", label: "MOV", color: "#6366f1", description: "Apple QuickTime" },
      { format: "mkv", label: "MKV", color: "#8b5cf6", description: "Matroska Video" },
      { format: "webm", label: "WEBM", color: "#06b6d4", description: "Web Video HTML5" },
      { format: "avi", label: "AVI", color: "#f59e0b", description: "Audio Video Interleave" },
    ],
  },
  gif: {
    category: "video",
    name: "GIF Animation",
    badgeColor: "#ff5500",
    targetChambers: [
      { format: "mp4", label: "MP4", color: "#3b82f6", description: "Video MP4 Ringan" },
      { format: "webm", label: "WEBM", color: "#06b6d4", description: "Web Video HTML5" },
      { format: "png", label: "PNG", color: "#10b981", description: "Frame Pertama Gambar PNG" },
    ],
  },

  // ==========================================
  // 4. PDF (PDF -> DOCX, PAGES, PPTX, XLSX, JPG, PNG, EPUB, TXT, MD)
  // ==========================================
  pdf: {
    category: "document",
    name: "PDF Document",
    badgeColor: "#ef4444",
    targetChambers: [
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Dokumen Microsoft Word" },
      { format: "pptx", label: "PPTX", color: "#f97316", description: "Presentasi PowerPoint" },
      { format: "xlsx", label: "XLSX", color: "#10b981", description: "Spreadsheet Excel" },
      { format: "png", label: "PNG", color: "#06b6d4", description: "Render Halaman Gambar PNG (300 DPI)" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Render Gambar JPG" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstraksi Teks Bersih" },
      { format: "md", label: "MD", color: "#0284c7", description: "Markdown Document" },
    ],
  },

  // ==========================================
  // 5. DOCUMENTS (DOCX, PAGES, Markdown, TXT, EPUB, RTF)
  // ==========================================
  docx: {
    category: "document",
    name: "Microsoft Word (DOCX)",
    badgeColor: "#2563eb",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Portable Document Format" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Teks Polos" },
      { format: "md", label: "MD", color: "#0284c7", description: "Markdown Document" },
      { format: "html", label: "HTML", color: "#f97316", description: "Halaman Web HTML" },
      { format: "epub", label: "EPUB", color: "#8b5cf6", description: "Electronic Publication Book" },
    ],
  },
  doc: {
    category: "document",
    name: "Word Document (DOC)",
    badgeColor: "#2563eb",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Portable Document Format" },
      { format: "docx", label: "DOCX", color: "#3b82f6", description: "Modern Office XML" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstrak Teks Polos" },
      { format: "md", label: "MD", color: "#0284c7", description: "Markdown Document" },
    ],
  },
  md: {
    category: "document",
    name: "Markdown Document",
    badgeColor: "#0284c7",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF Berformat" },
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Dokumen Word" },
      { format: "html", label: "HTML", color: "#f97316", description: "Render Halaman HTML" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Teks Polos" },
      { format: "epub", label: "EPUB", color: "#8b5cf6", description: "E-Book EPUB" },
    ],
  },
  markdown: {
    category: "document",
    name: "Markdown Document",
    badgeColor: "#0284c7",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF Berformat" },
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Dokumen Word" },
      { format: "html", label: "HTML", color: "#f97316", description: "Render Halaman HTML" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Teks Polos" },
      { format: "epub", label: "EPUB", color: "#8b5cf6", description: "E-Book EPUB" },
    ],
  },
  txt: {
    category: "document",
    name: "Plain Text (TXT)",
    badgeColor: "#64748b",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Cetak Dokumen PDF" },
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Dokumen Microsoft Word" },
      { format: "md", label: "MD", color: "#0284c7", description: "Markdown Format" },
      { format: "html", label: "HTML", color: "#f97316", description: "Markup Web HTML" },
      { format: "epub", label: "EPUB", color: "#8b5cf6", description: "E-Book EPUB" },
    ],
  },
  rtf: {
    category: "document",
    name: "Rich Text Format (RTF)",
    badgeColor: "#8b5cf6",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Microsoft Word DOCX" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstrak Teks Polos" },
      { format: "md", label: "MD", color: "#0284c7", description: "Markdown Document" },
    ],
  },
  epub: {
    category: "document",
    name: "EPUB E-Book",
    badgeColor: "#8b5cf6",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Dokumen PDF" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstrak Teks Buku" },
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Dokumen Word" },
    ],
  },
  pages: {
    category: "document",
    name: "Apple Pages Document",
    badgeColor: "#f97316",
    targetChambers: [
      { format: "docx", label: "DOCX", color: "#2563eb", description: "Microsoft Word DOCX" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Portable Document Format" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Teks Polos" },
    ],
  },

  // ==========================================
  // 6. SLIDES (PPT / PPTX -> PDF, JPG, PNG)
  // ==========================================
  pptx: {
    category: "slide",
    name: "PowerPoint Presentation (PPTX)",
    badgeColor: "#f97316",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Semua Slide ke PDF" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Ekstrak Slide ke Gambar JPG" },
      { format: "png", label: "PNG", color: "#06b6d4", description: "Ekstrak Slide ke Gambar PNG" },
    ],
  },
  ppt: {
    category: "slide",
    name: "PowerPoint Presentation (PPT)",
    badgeColor: "#f97316",
    targetChambers: [
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Semua Slide ke PDF" },
      { format: "pptx", label: "PPTX", color: "#f97316", description: "Modern XML Presentation" },
      { format: "jpg", label: "JPG", color: "#f59e0b", description: "Ekstrak Slide ke Gambar JPG" },
      { format: "png", label: "PNG", color: "#06b6d4", description: "Ekstrak Slide ke Gambar PNG" },
    ],
  },

  // ==========================================
  // 7. SPREADSHEETS (XLSX, ODS, CSV, TSV)
  // ==========================================
  xlsx: {
    category: "data",
    name: "Excel Spreadsheet (XLSX)",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "csv", label: "CSV", color: "#f59e0b", description: "Comma Separated Values" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Cetak Spreadsheet ke PDF" },
      { format: "ods", label: "ODS", color: "#3b82f6", description: "OpenDocument Spreadsheet" },
      { format: "tsv", label: "TSV", color: "#64748b", description: "Tab Separated Values" },
    ],
  },
  xls: {
    category: "data",
    name: "Excel Spreadsheet (XLS)",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "xlsx", label: "XLSX", color: "#10b981", description: "Modern Office XML" },
      { format: "csv", label: "CSV", color: "#f59e0b", description: "Comma Separated Values" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Cetak ke Dokumen PDF" },
    ],
  },
  ods: {
    category: "data",
    name: "OpenDocument Spreadsheet (ODS)",
    badgeColor: "#3b82f6",
    targetChambers: [
      { format: "xlsx", label: "XLSX", color: "#10b981", description: "Excel Spreadsheet" },
      { format: "csv", label: "CSV", color: "#f59e0b", description: "Comma Separated Values" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Cetak Dokumen PDF" },
      { format: "tsv", label: "TSV", color: "#64748b", description: "Tab Separated Values" },
    ],
  },
  csv: {
    category: "data",
    name: "Comma Separated Values (CSV)",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "xlsx", label: "XLSX", color: "#10b981", description: "Bungkus ke Tabel Excel" },
      { format: "tsv", label: "TSV", color: "#64748b", description: "Tab Separated Values" },
      { format: "ods", label: "ODS", color: "#3b82f6", description: "OpenDocument Spreadsheet" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Cetak Tabel ke PDF" },
    ],
  },
  tsv: {
    category: "data",
    name: "Tab Separated Values (TSV)",
    badgeColor: "#64748b",
    targetChambers: [
      { format: "csv", label: "CSV", color: "#10b981", description: "Comma Separated Values" },
      { format: "xlsx", label: "XLSX", color: "#10b981", description: "Excel Spreadsheet" },
      { format: "ods", label: "ODS", color: "#3b82f6", description: "OpenDocument Spreadsheet" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Cetak Tabel ke PDF" },
    ],
  },

  // ==========================================
  // 8. SUBTITLES (SRT, VTT)
  // ==========================================
  srt: {
    category: "subtitle",
    name: "SubRip Subtitle (SRT)",
    badgeColor: "#f59e0b",
    targetChambers: [
      { format: "vtt", label: "VTT", color: "#3b82f6", description: "WebVTT HTML5 Subtitle" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstrak Teks Transkrip Saja" },
    ],
  },
  vtt: {
    category: "subtitle",
    name: "WebVTT Subtitle (VTT)",
    badgeColor: "#3b82f6",
    targetChambers: [
      { format: "srt", label: "SRT", color: "#f59e0b", description: "SubRip Format Standar" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Ekstrak Teks Transkrip Saja" },
    ],
  },

  // ==========================================
  // 9. ARCHIVES (ZIP, TAR, GZIP, RAR)
  // ==========================================
  zip: {
    category: "archive",
    name: "ZIP Archive",
    badgeColor: "#eab308",
    targetChambers: [
      { format: "tar", label: "TAR", color: "#6366f1", description: "Unix Tarball" },
      { format: "gz", label: "GZ", color: "#10b981", description: "Gzip Archive (.tar.gz)" },
    ],
  },
  rar: {
    category: "archive",
    name: "RAR Archive (RAR Input Only)",
    badgeColor: "#eab308",
    targetChambers: [
      { format: "zip", label: "ZIP", color: "#eab308", description: "Standar Kompresi ZIP" },
      { format: "tar", label: "TAR", color: "#6366f1", description: "Unix Tarball" },
      { format: "gz", label: "GZ", color: "#10b981", description: "Gzip Archive (.tar.gz)" },
    ],
  },
  tar: {
    category: "archive",
    name: "TAR Archive",
    badgeColor: "#6366f1",
    targetChambers: [
      { format: "zip", label: "ZIP", color: "#eab308", description: "Standar Kompresi ZIP" },
      { format: "gz", label: "GZ", color: "#10b981", description: "Kompresi Gzip (.tar.gz)" },
    ],
  },
  gz: {
    category: "archive",
    name: "GZIP Archive",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "zip", label: "ZIP", color: "#eab308", description: "Standar Kompresi ZIP" },
      { format: "tar", label: "TAR", color: "#6366f1", description: "Ekstrak ke TAR" },
    ],
  },
  gzip: {
    category: "archive",
    name: "GZIP Archive",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "zip", label: "ZIP", color: "#eab308", description: "Standar Kompresi ZIP" },
      { format: "tar", label: "TAR", color: "#6366f1", description: "Ekstrak ke TAR" },
    ],
  },
  tgz: {
    category: "archive",
    name: "TGZ Archive",
    badgeColor: "#10b981",
    targetChambers: [
      { format: "zip", label: "ZIP", color: "#eab308", description: "Standar Kompresi ZIP" },
      { format: "tar", label: "TAR", color: "#6366f1", description: "Ekstrak ke TAR" },
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
      { format: "zip", label: "ZIP", color: "#eab308", description: "Kompresi Arsip ZIP" },
      { format: "tar", label: "TAR", color: "#6366f1", description: "Kompresi Arsip TAR" },
      { format: "pdf", label: "PDF", color: "#ef4444", description: "Bungkus ke Dokumen PDF" },
      { format: "txt", label: "TXT", color: "#64748b", description: "Teks / Dump Hex" },
    ],
  };
};
