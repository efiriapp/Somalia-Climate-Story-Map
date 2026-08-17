let muted = false;
let audioCtx: AudioContext | null = null;
let flightStop: (() => void) | null = null;

const audioContext = (): AudioContext | null => {
  const Ctor =
    globalThis.AudioContext ??
    (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new Ctor();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
};

export const isTourSoundMuted = (): boolean => muted;

export const setTourSoundMuted = (value: boolean): void => {
  muted = value;
  if (value) {
    stopFlightSound();
  }
};

export const stopFlightSound = (): void => {
  flightStop?.();
  flightStop = null;
};

export const startFlightSound = (): void => {
  stopFlightSound();
  if (muted) {
    return;
  }
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(86, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(118, ctx.currentTime + 1.2);
  filter.type = 'lowpass';
  filter.frequency.value = 420;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.35);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  flightStop = () => {
    try {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      osc.stop(now + 0.28);
    } catch {
      osc.disconnect();
    }
  };
};

export const playCalendarTick = (): void => {
  if (muted) {
    return;
  }
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(1240, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(820, ctx.currentTime + 0.07);
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
};
