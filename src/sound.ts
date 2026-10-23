// Web Audio API Synthesizer for tactile micro-interactions (Zero dependencies, instant, offline)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioCtx) {
      audioCtx = new AudioCtx();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays an authentic tactile mechanical "tick" (like a camera dial or rotary gear notch).
 */
export function playWheelTick(freqBoost = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. High-frequency transient snap (mechanical edge)
    const bufferSize = Math.floor(ctx.sampleRate * 0.006); // 6ms
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const channelData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      channelData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.setValueAtTime(1800 + freqBoost * 20, now);
    noiseFilter.Q.setValueAtTime(3.5, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.007);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + 0.008);

    // 2. Low resonant click body (tactile mechanical notch)
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();

    osc.type = "sine";
    const baseFreq = 750 + freqBoost * 15;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.016);

    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.02);
  } catch {
    // Fail silently if audio isn't permitted by system
  }
}

/**
 * Plays a satisfying subtle "latch / confirm" sound when format is triggered.
 */
export function playSelectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.075);
  } catch {
    // Fail silently
  }
}
