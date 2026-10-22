import React, { useState, useEffect, useRef } from "react";
import { FormatChamber } from "../types";
import { FileTypeDefinition } from "../formatRegistry";
import {
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
  FileArchive,
  File,
  X,
  Sparkles,
} from "lucide-react";

interface RevolverMenuProps {
  fileName: string;
  filePath?: string;
  fileInfo: FileTypeDefinition;
  onSelectFormat: (format: string) => void;
  onCancel: () => void;
  isSimulated?: boolean;
  externalActiveIndex?: number | null;
}

const FORMAT_ICONS: Record<string, React.ReactNode> = {
  pdf: <FileText size={22} strokeWidth={1.8} />,
  txt: <FileText size={22} strokeWidth={1.8} />,
  html: <FileCode size={22} strokeWidth={1.8} />,
  odt: <FileText size={22} strokeWidth={1.8} />,
  docx: <FileText size={22} strokeWidth={1.8} />,
  doc: <FileText size={22} strokeWidth={1.8} />,
  png: <Image size={22} strokeWidth={1.8} />,
  jpg: <Image size={22} strokeWidth={1.8} />,
  jpeg: <Image size={22} strokeWidth={1.8} />,
  webp: <Image size={22} strokeWidth={1.8} />,
  bmp: <Image size={22} strokeWidth={1.8} />,
  ico: <Image size={22} strokeWidth={1.8} />,
  csv: <FileSpreadsheet size={22} strokeWidth={1.8} />,
  json: <FileCode size={22} strokeWidth={1.8} />,
  xlsx: <FileSpreadsheet size={22} strokeWidth={1.8} />,
  zip: <FileArchive size={22} strokeWidth={1.8} />,
};

export const RevolverMenu: React.FC<RevolverMenuProps> = ({
  fileName,
  fileInfo,
  onSelectFormat,
  onCancel,
  isSimulated = false,
  externalActiveIndex,
}) => {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef<number>(0);

  const chambers = fileInfo.targetChambers;
  const count = chambers.length;
  const radius = 138;
  const ext = fileName.split(".").pop()?.toUpperCase() || "FILE";

  const activeIndex =
    externalActiveIndex !== undefined && externalActiveIndex !== null
      ? externalActiveIndex
      : internalHoveredIndex;

  // Shortest-path continuous rotation
  if (activeIndex !== null) {
    const targetDeg = (360 / count) * activeIndex;
    const currentDeg = rotationRef.current;
    const diff = ((((targetDeg - currentDeg) % 360) + 540) % 360) - 180;
    rotationRef.current = currentDeg + diff;
  }

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }

      // Check number keys 1..9 for direct shortcut
      const keyNum = parseInt(e.key, 10);
      if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= chambers.length) {
        onSelectFormat(chambers[keyNum - 1].format);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, chambers, onSelectFormat]);

  // Smooth circular tracking over the entire radial container
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Active detection zone between center hub (35px) and outer margin (230px)
    if (dist >= 35 && dist <= 230) {
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI; // -180 to 180
      const normalized = ((angle + 90) % 360 + 360) % 360; // 0 at 12 o'clock
      const slice = 360 / count;
      const idx = Math.floor((normalized + slice / 2) / slice) % count;
      setInternalHoveredIndex(idx);
    } else if (dist > 240) {
      setInternalHoveredIndex(null);
    }
  };

  const handleMouseLeave = () => {
    setInternalHoveredIndex(null);
  };

  // Determine pill position based on angle
  const getLabelPosition = (angleDeg: number): "left" | "right" | "top" | "bottom" => {
    const normalized = ((angleDeg % 360) + 360) % 360;
    if (normalized >= 315 || normalized < 45) return "right";
    if (normalized >= 45 && normalized < 135) return "bottom";
    if (normalized >= 135 && normalized < 225) return "left";
    return "top";
  };

  return (
    <div className={`revolver-overlay ${mounted ? "is-open" : ""}`}>
      <div className="revolver-backdrop" onClick={onCancel} />

      <div className="revolver-stage">
        {/* Subtle grid pattern container */}
        <div className="stage-grid-bg" />

        {/* Top Header Pill */}
        <div className="revolver-pill-header">
          <span className="pill-dot" />
          <span>CONZ Radial Converter</span>
          {isSimulated && <span className="pill-sim">Simulasi</span>}
          <button className="pill-close" onClick={onCancel} title="Tutup (Esc)">
            <X size={14} />
          </button>
        </div>

        {/* Radial Workspace with full-circle tracking */}
        <div
          ref={containerRef}
          className="radial-container"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Subtle Outer Track Ring */}
          <div className="radial-track" />

          {/* SVG Annular Sector Wedge: Always mounted for smooth CSS transition */}
          <svg
            className="radial-wedge-svg"
            viewBox="0 0 320 320"
            style={{
              transform: `rotate(${rotationRef.current}deg)`,
              opacity: activeIndex !== null ? 1 : 0,
            }}
          >
            <defs>
              <linearGradient id="wedgeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#0d99ff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#0d99ff" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <path
              d="M 146.3 122.4 L 111.4 26.5 A 142 142 0 0 1 208.6 26.5 L 173.7 122.4 A 40 40 0 0 0 146.3 122.4 Z"
              fill="url(#wedgeGrad)"
            />
          </svg>

          {/* Central Blue Hub Ring */}
          <div className="radial-hub">
            <div className="radial-hub-inner">
              <span className="hub-ext-label">{ext}</span>
            </div>
          </div>

          {/* Radial Chamber Items */}
          {chambers.map((chamber: FormatChamber, index: number) => {
            const angleDeg = (360 / count) * index - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
            const x = Math.round(radius * Math.cos(angleRad));
            const y = Math.round(radius * Math.sin(angleRad));

            const isActive = activeIndex === index;
            const labelPos = getLabelPosition(angleDeg);
            const shortcutKey = `${index + 1}`;

            return (
              <div
                key={chamber.format}
                className={`chamber-item ${isActive ? "is-active" : ""}`}
                style={{
                  transform: `translate(${x}px, ${y}px)`,
                }}
                onClick={() => onSelectFormat(chamber.format)}
              >
                {/* Rounded Square Button */}
                <div
                  className="chamber-icon-btn"
                  style={
                    {
                      "--ch-color": chamber.color,
                    } as React.CSSProperties
                  }
                >
                  {FORMAT_ICONS[chamber.format] || <File size={22} />}
                </div>

                {/* Figma-Style External Pill Capsule */}
                <div className={`chamber-pill-badge pill-pos-${labelPos} ${isActive ? "active-pill" : ""}`}>
                  {isActive ? (
                    <>
                      <span className="pill-name">{chamber.label}</span>
                      <span className="pill-key active-key">{shortcutKey}</span>
                    </>
                  ) : (
                    <>
                      <span className="pill-key">{shortcutKey}</span>
                      <span className="pill-name">{chamber.label}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Source file info bar */}
        <div className="revolver-source-tag">
          <Sparkles size={14} className="text-blue" />
          <span className="source-name" title={fileName}>
            {fileName}
          </span>
          <span className="source-divider">•</span>
          <span className="source-hint">
            Tekan angka <strong>[1-{count}]</strong> atau klik format
          </span>
        </div>
      </div>
    </div>
  );
};
