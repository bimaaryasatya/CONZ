import React from "react";
import { FORMAT_MAP } from "../formatRegistry";
import { FileText, Image as ImageIcon, Database, ArrowRight } from "lucide-react";

export const FormatMatrix: React.FC = () => {
  const formats = Object.entries(FORMAT_MAP);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "document":
        return <FileText size={17} />;
      case "image":
        return <ImageIcon size={17} />;
      case "data":
        return <Database size={17} />;
      default:
        return <FileText size={17} />;
    }
  };

  return (
    <div className="glass-card">
      <div className="section-header" style={{ marginBottom: 20 }}>
        <div>
          <h4 style={{ marginBottom: 4 }}>Matriks Format yang Didukung</h4>
          <p className="section-desc">
            Tahan <kbd>Shift</kbd> + Drag file dengan ekstensi berikut untuk
            membuka Revolver Menu.
          </p>
        </div>
      </div>

      <div className="matrix-grid">
        {formats.map(([ext, def]) => (
          <div key={ext} className="matrix-card">
            <div className="mc-header">
              <div
                className="mc-icon"
                style={{ background: `${def.badgeColor}18`, color: def.badgeColor }}
              >
                {getCategoryIcon(def.category)}
              </div>
              <div>
                <div className="mc-ext">.{ext.toUpperCase()}</div>
                <div className="mc-name">{def.name}</div>
              </div>
            </div>
            <div className="mc-targets">
              {def.targetChambers.map((ch) => (
                <span
                  key={ch.format}
                  className="mc-chip"
                  style={{ color: ch.color, borderColor: `${ch.color}40` }}
                >
                  <ArrowRight size={9} />
                  {ch.label}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
