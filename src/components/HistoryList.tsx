import React from "react";
import { ConversionRecord } from "../types";
import { FolderOpen, CheckCircle, Clock, Trash2, ArrowRight } from "lucide-react";

interface HistoryListProps {
  history: ConversionRecord[];
  onOpenFolder: (path: string) => void;
  onClearHistory: () => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onOpenFolder,
  onClearHistory,
}) => {
  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 KB";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
  };

  if (history.length === 0) {
    return (
      <div className="glass-card history-empty">
        <Clock size={44} strokeWidth={1} className="empty-icon" />
        <h4>Belum Ada Riwayat</h4>
        <p>File yang telah dikonversi akan muncul di sini secara otomatis.</p>
      </div>
    );
  }

  return (
    <div className="glass-card">
      <div className="section-header">
        <div className="section-title-row">
          <h4>Riwayat Konversi</h4>
          <span className="counter-badge">{history.length}</span>
        </div>
        <button className="clear-btn" onClick={onClearHistory}>
          <Trash2 size={13} />
          <span>Hapus Semua</span>
        </button>
      </div>

      <div className="history-list">
        {history.map((record) => (
          <div key={record.id} className="history-item">
            <div className="hi-status">
              <CheckCircle size={18} className="text-green" />
            </div>

            <div className="hi-content">
              <div className="hi-name-row">
                <span className="hi-name" title={record.originalName}>
                  {record.originalName}
                </span>
                <div className="hi-flow">
                  <span className="flow-pill src">
                    {record.originalExt.toUpperCase()}
                  </span>
                  <ArrowRight size={11} className="flow-arrow" />
                  <span className="flow-pill dst">
                    {record.targetFormat.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="hi-meta">
                <span>📁 {record.outputFilename}</span>
                <span className="meta-dot">•</span>
                <span>{formatBytes(record.sizeBytes)}</span>
                <span className="meta-dot">•</span>
                <span>{record.timestamp}</span>
              </div>
            </div>

            <button
              className="hi-open-btn"
              onClick={() => onOpenFolder(record.outputPath)}
              title="Buka di Explorer"
            >
              <FolderOpen size={14} />
              <span>Buka</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
