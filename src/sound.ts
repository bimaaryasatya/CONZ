// Synthesized tactile audio feedback for rotary dial interactions (zero external assets, zero latency)
class SoundManager {
  private ctx: AudioContext | null = null;
  private lastTickTime: number = 0;

  private initCtx() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  // Subtle tactile rotary tick (like a mechanical dial / Apple Watch digital crown)
  playTick() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = performance.now();
      // Throttle rapid consecutive ticks (minimum 25ms interval)
      if (now - this.lastTickTime < 25) return;
      this.lastTickTime = now;

      const t = this.ctx.currentTime;

      // 1. High-frequency crisp snap
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(700, t + 0.009);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.012);

      // 2. Subtle low-end mechanical body tap
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();

      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(180, t);
      subOsc.frequency.exponentialRampToValueAtTime(60, t + 0.015);

      subGain.gain.setValueAtTime(0.12, t);
      subGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);

      subOsc.start(t);
      subOsc.stop(t + 0.015);
    } catch {
      // AudioContext muted or unsupported, fail silently
    }
  }

  // Crisp confirmation pop when a format is dropped or selected
  playDrop() {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.exponentialRampToValueAtTime(1100, t + 0.08);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Fail silently
    }
  }
}

export const sound = new SoundManager();
