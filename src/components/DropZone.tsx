import React, { useState, useRef } from "react";
import { UploadCloud, FileType, Zap, ShieldCheck, Sparkles } from "lucide-react";

interface DropZoneProps {
  onFileDetected: (file: { name: string; path?: string }, withShift: boolean) => void;
  onSimulate: (filename: string) => void;
  isConverting: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFileDetected,
  onSimulate,
  isConverting,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [shiftPressed, setShiftPressed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setShiftPressed(e.shiftKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.shiftKey !== shiftPressed) {
      setShiftPressed(e.shiftKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setShiftPressed(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const filePath = (file as any).path || file.name;
      onFileDetected({ name: file.name, path: filePath }, e.shiftKey);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const filePath = (file as any).path || file.name;
      onFileDetected({ name: file.name, path: filePath }, true);
    }
  };

  return (
    <div className="dropzone-card">
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />

      <div
        className={`dropzone-area ${isDragging ? "is-dragover" : ""} ${
          shiftPressed ? "shift-active" : ""
        } ${isConverting ? "is-converting" : ""}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {/* Floating decorative orbs */}
        <div className="dz-orb dz-orb-1" />
        <div className="dz-orb dz-orb-2" />
        <div className="dz-orb dz-orb-3" />

        <div className="dropzone-content">
          <div className="dz-icon-wrapper">
            <UploadCloud size={36} strokeWidth={1.5} />
            <Sparkles size={14} className="dz-sparkle" />
          </div>

          <h3 className="dz-title">Tarik & Jatuhkan File ke Sini</h3>

          <p className="dz-subtitle">
            Tahan <kbd>Shift</kbd> + Drag untuk membuka{" "}
            <strong>CONZ Radial Menu</strong> secara instan
          </p>

          <div className="dz-features">
            <span className="dz-feature">
              <FileType size={13} /> Deteksi Otomatis
            </span>
            <span className="dz-feature">
              <Zap size={13} /> Konversi Instan
            </span>
            <span className="dz-feature">
              <ShieldCheck size={13} /> Simpan di Folder Asal
            </span>
          </div>

          <button
            type="button"
            className="dz-browse-btn"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Pilih File dari Komputer
          </button>
        </div>
      </div>

      {/* Simulator Quick Actions */}
      <div className="sim-bar">
        <span className="sim-label">Coba simulasi:</span>
        <div className="sim-chips">
          {[
            { name: "Laporan_Keuangan_2026.docx", emoji: "📄", cls: "docx" },
            { name: "Desain_Logo_Perusahaan.png", emoji: "🖼️", cls: "png" },
            { name: "Foto_Produk_HD.jpg", emoji: "📸", cls: "jpg" },
            { name: "Database_Pelanggan.csv", emoji: "📊", cls: "csv" },
          ].map((item) => (
            <button
              key={item.cls}
              className={`sim-chip sim-${item.cls}`}
              onClick={() => onSimulate(item.name)}
            >
              <span>{item.emoji}</span>
              <span>{item.name.split("_").slice(0, 2).join(" ")}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
