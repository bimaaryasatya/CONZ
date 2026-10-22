import { useState, useEffect, useRef } from "react";
import { api, isTauri } from "./api";
import { getFileTypeInfo, FileTypeDefinition } from "./formatRegistry";
import { RevolverMenu } from "./components/RevolverMenu";
import { CheckCircle2, AlertCircle } from "lucide-react";
import "./App.css";

interface ActiveFile {
  name: string;
  path: string;
  isSimulated?: boolean;
}

function App() {
  const [activeFile, setActiveFile] = useState<ActiveFile | null>(null);
  const [statusToast, setStatusToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [dragActiveIndex, setDragActiveIndex] = useState<number | null>(null);

  const activeFileRef = useRef<ActiveFile | null>(null);
  activeFileRef.current = activeFile;

  // Setup Tauri listeners
  useEffect(() => {
    let unlistenDragDrop: (() => void) | null = null;
    let unlistenTest: (() => void) | null = null;
    let unlistenCheckHide: (() => void) | null = null;

    const setupListeners = async () => {
      if (!isTauri()) {
        // In browser mock mode, show a default test file
        setActiveFile({
          name: "Laporan_Keuangan_2026.docx",
          path: "C:\\Users\\LENOVO\\Documents\\Laporan_Keuangan_2026.docx",
          isSimulated: true,
        });
        return;
      }

      // 1. Listen for native OS drag and drop
      try {
        const webviewMod = await import("@tauri-apps/api/webview");
        const webview = webviewMod.getCurrentWebview();

        unlistenDragDrop = await webview.onDragDropEvent((event: any) => {
          const payload = event.payload;

          if (payload.type === "enter") {
            if (payload.paths && payload.paths.length > 0) {
              const fullPath = payload.paths[0];
              const fileName = fullPath.split(/[/\\]/).pop() || fullPath;

              setActiveFile({
                name: fileName,
                path: fullPath,
                isSimulated: false,
              });
            }
          } else if (payload.type === "over") {
            if (payload.position) {
              const dx = payload.position.x - 270;
              const dy = payload.position.y - 270;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist >= 35 && dist <= 230) {
                const count = activeFileRef.current
                  ? getFileTypeInfo(activeFileRef.current.name).targetChambers.length
                  : 4;
                const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                const normalized = ((angle + 90) % 360 + 360) % 360;
                const slice = 360 / count;
                const idx = Math.floor((normalized + slice / 2) / slice) % count;
                setDragActiveIndex(idx);
              } else {
                setDragActiveIndex(null);
              }
            }
          } else if (payload.type === "drop") {
            setDragActiveIndex(null);
            if (payload.paths && payload.paths.length > 0) {
              const fullPath = payload.paths[0];
              const fileName = fullPath.split(/[/\\]/).pop() || fullPath;

              // Calculate which chamber was dropped on using relative coordinates
              const fileInfo = getFileTypeInfo(fileName);
              const chambers = fileInfo.targetChambers;
              const count = chambers.length;

              // Center of 540x540 window is (270, 270)
              const posX = payload.position?.x ?? 270;
              const posY = payload.position?.y ?? 270;
              const dx = posX - 270;
              const dy = posY - 270;

              // Calculate angle from center (-90 is top)
              let angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
              let normalized = ((angleDeg + 90) % 360 + 360) % 360;
              let sliceSize = 360 / count;
              let chamberIndex = Math.floor((normalized + sliceSize / 2) / sliceSize) % count;

              const targetFormat = chambers[chamberIndex]?.format || chambers[0].format;
              handleExecuteConvert(fullPath, targetFormat);
            }
          } else if (payload.type === "leave") {
            setDragActiveIndex(null);
          }
        });
      } catch (err) {
        console.error("Error setting up dragdrop listener:", err);
      }

      // 2. Listen for tray test event
      try {
        const eventMod = await import("@tauri-apps/api/event");
        unlistenTest = await eventMod.listen("test-radial", () => {
          setActiveFile({
            name: "Laporan_Keuangan_2026.docx",
            path: "C:\\Users\\LENOVO\\Documents\\Laporan_Keuangan_2026.docx",
            isSimulated: true,
          });
        });

        // 3. Check hide event when mouse button is released outside
        unlistenCheckHide = await eventMod.listen("radial-check-hide", () => {
          handleClose();
        });
      } catch (err) {
        console.error("Error setting up event listeners:", err);
      }
    };

    setupListeners();

    return () => {
      if (unlistenDragDrop) unlistenDragDrop();
      if (unlistenTest) unlistenTest();
      if (unlistenCheckHide) unlistenCheckHide();
    };
  }, []);

  const handleClose = async () => {
    setActiveFile(null);
    setStatusToast(null);
    setDragActiveIndex(null);
    await api.hideRadialWindow();
  };

  const handleExecuteConvert = (filePath: string, targetFormat: string) => {
    // 1. Instantly close radial menu so the user can immediately convert more files!
    handleClose();

    // 2. Trigger asynchronous conversion in background without blocking
    api.convertFile(filePath, targetFormat).catch((err) => {
      console.error("Background conversion failed:", err);
    });
  };

  const fileInfo: FileTypeDefinition = activeFile
    ? getFileTypeInfo(activeFile.name)
    : getFileTypeInfo("file.docx");

  return (
    <div className="popup-app-root">
      {/* Radial Menu is displayed whenever activeFile is set or testing */}
      {activeFile && (
        <RevolverMenu
          fileName={activeFile.name}
          filePath={activeFile.path}
          fileInfo={fileInfo}
          onSelectFormat={(fmt) => handleExecuteConvert(activeFile.path, fmt)}
          onCancel={handleClose}
          isSimulated={activeFile.isSimulated}
          externalActiveIndex={dragActiveIndex}
        />
      )}

      {/* Result Toast */}
      {statusToast && (
        <div className={`popup-toast toast-${statusToast.type}`}>
          {statusToast.type === "success" ? (
            <CheckCircle2 size={16} className="text-green" />
          ) : (
            <AlertCircle size={16} className="text-red" />
          )}
          <span>{statusToast.message}</span>
        </div>
      )}
    </div>
  );
}

export default App;
