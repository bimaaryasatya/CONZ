import React from "react";
import { Laptop, Shield, Sparkles } from "lucide-react";

export const TrayGuide: React.FC = () => {
  return (
    <div className="tray-guide">
      <div className="glass-card guide-hero-card">
        <div className="guide-status">
          <span className="status-dot" />
          <span>System Tray: Aktif</span>
        </div>
        <h2>Berjalan Hening di Latar Belakang</h2>
        <p>
          Tutup jendela ini kapan saja — aplikasi tetap standby di System Tray
          (pojok kanan bawah taskbar Windows). Fitur{" "}
          <strong>Drag + Shift → Radial CONZ</strong> selalu siap sedia!
        </p>
      </div>

      <div className="guide-steps">
        {[
          {
            num: "01",
            title: "Tutup Jendela Bebas Khawatir",
            desc: "Tombol X hanya menyembunyikan jendela, aplikasi tetap aktif di belakang layar.",
          },
          {
            num: "02",
            title: "Tahan Shift & Drag File",
            desc: "Pilih file apa pun dari Explorer, tahan Shift, lalu tarik ke area drop zone.",
          },
          {
            num: "03",
            title: "Pilih Format di Menu Radial CONZ",
            desc: "Menu radial muncul otomatis, jatuhkan file ke ikon format tujuan Anda.",
          },
          {
            num: "04",
            title: "Tersimpan di Folder Asal",
            desc: "Hasil konversi langsung muncul berdampingan dengan file asli, rapi dan cepat.",
          },
        ].map((step) => (
          <div key={step.num} className="glass-card guide-step">
            <span className="step-num">{step.num}</span>
            <div>
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card specs-row">
        <div className="spec">
          <Laptop size={18} className="text-green" />
          <div>
            <strong>RAM Ultra Rendah</strong>
            <p>~25-35 MB berkat Tauri & WebView2</p>
          </div>
        </div>
        <div className="spec">
          <Shield size={18} className="text-blue" />
          <div>
            <strong>100% Offline & Privat</strong>
            <p>Semua diproses lokal tanpa upload</p>
          </div>
        </div>
        <div className="spec">
          <Sparkles size={18} className="text-purple" />
          <div>
            <strong>Notifikasi Otomatis</strong>
            <p>Buka folder hasil langsung via Explorer</p>
          </div>
        </div>
      </div>
    </div>
  );
};
