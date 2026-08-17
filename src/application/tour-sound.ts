let volume = 1;
let lastVolume = 1;
let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let flightStop: (() => void) | null = null;

const clampVolume = (value: number): number => Math.min(1, Math.max(0, value));

const audioContext = (): AudioContext | null => {
  const Ctor =
    globalThis.AudioContext ??
    (globalThis as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) {
    return null;
  }
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new Ctor();
    masterGain = null;
  }
  return audioCtx;
};

const output = (ctx: AudioContext): GainNode => {
  if (!masterGain || masterGain.context !== ctx) {
    masterGain = ctx.createGain();
    masterGain.gain.value = volume;
    masterGain.connect(ctx.destination);
  }
  return masterGain;
};

const withAudio = (play: (ctx: AudioContext) => void): void => {
  const ctx = audioContext();
  if (!ctx) {
    return;
  }
  const run = () => play(ctx);
  if (ctx.state === 'suspended') {
    void ctx.resume().then(run);
    return;
  }
  run();
};

const noiseSource = (ctx: AudioContext, seconds: number, loop: boolean): AudioBufferSourceNode => {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = loop;
  return source;
};

export const getTourSoundVolume = (): number => volume;

export const isTourSoundMuted = (): boolean => volume === 0;

export const setTourSoundVolume = (value: number): void => {
  volume = clampVolume(value);
  if (volume > 0) {
    lastVolume = volume;
  }
  if (masterGain) {
    const now = masterGain.context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setTargetAtTime(volume, now, 0.03);
  }
};

export const setTourSoundMuted = (value: boolean): void => {
  setTourSoundVolume(value ? 0 : lastVolume || 1);
};

export const unlockTourSound = (): void => {
  const ctx = audioContext();
  if (ctx?.state === 'suspended') {
    void ctx.resume();
  }
};

export const stopFlightSound = (): void => {
  flightStop?.();
  flightStop = null;
};

export const playTakeoffSound = (): void => {
  withAudio((ctx) => {
    const now = ctx.currentTime;
    const dest = output(ctx);
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(620, now + 0.55);
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.16, now + 0.08);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.72);

    const noise = noiseSource(ctx, 0.7, false);
    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    filter.type = 'highpass';
    filter.frequency.value = 700;
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + 0.7);
  });
};

export const startFlightSound = (): void => {
  stopFlightSound();
  withAudio((ctx) => {
    const now = ctx.currentTime;
    const dest = output(ctx);
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(310, now + 0.8);
    oscGain.gain.setValueAtTime(0.0001, now);
    oscGain.gain.exponentialRampToValueAtTime(0.11, now + 0.2);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(now);

    const noise = noiseSource(ctx, 1.2, true);
    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    filter.type = 'bandpass';
    filter.frequency.value = 900;
    filter.Q.value = 0.7;
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.09, now + 0.25);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);

    flightStop = () => {
      try {
        const stopAt = ctx.currentTime;
        oscGain.gain.cancelScheduledValues(stopAt);
        noiseGain.gain.cancelScheduledValues(stopAt);
        oscGain.gain.setValueAtTime(Math.max(oscGain.gain.value, 0.0001), stopAt);
        noiseGain.gain.setValueAtTime(Math.max(noiseGain.gain.value, 0.0001), stopAt);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, stopAt + 0.2);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, stopAt + 0.2);
        osc.stop(stopAt + 0.22);
        noise.stop(stopAt + 0.22);
      } catch {
        osc.disconnect();
        noise.disconnect();
      }
    };
  });
};

export const playLandingSound = (): void => {
  stopFlightSound();
  withAudio((ctx) => {
    const now = ctx.currentTime;
    const dest = output(ctx);
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.45);
    oscGain.gain.setValueAtTime(0.14, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    osc.connect(oscGain);
    oscGain.connect(dest);
    osc.start(now);
    osc.stop(now + 0.52);

    const noise = noiseSource(ctx, 0.45, false);
    const filter = ctx.createBiquadFilter();
    const noiseGain = ctx.createGain();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    noiseGain.gain.setValueAtTime(0.1, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(dest);
    noise.start(now);
    noise.stop(now + 0.42);
  });
};

export const playCalendarTick = (): void => {
  withAudio((ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1240, now);
    osc.frequency.exponentialRampToValueAtTime(820, now + 0.07);
    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    osc.connect(gain);
    gain.connect(output(ctx));
    osc.start(now);
    osc.stop(now + 0.1);
  });
};
