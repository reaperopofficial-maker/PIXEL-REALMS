import { getStoredSettings, subscribeSettings, GameSettings } from '../settings';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private settings: GameSettings;
  private windNode: AudioNode | null = null;
  private windGain: GainNode | null = null;
  private isWindPlaying: boolean = false;

  constructor() {
    this.settings = getStoredSettings();
    subscribeSettings((newSettings) => {
      const prevMusic = this.settings.musicEnabled;
      this.settings = newSettings;
      if (!this.settings.musicEnabled && this.isWindPlaying) {
        this.stopWindAmbiance();
      } else if (this.settings.musicEnabled && !this.isWindPlaying && prevMusic !== newSettings.musicEnabled) {
        this.startWindAmbiance();
      }
    });
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlockAudio(): void {
    this.initContext();
  }

  public playClick(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.04); // A5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {
      // Audio playback fails gracefully if browser restricts
    }
  }

  public playConfirm(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.12, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.14);
      });
    } catch {
      // Graceful fallback
    }
  }

  public playBack(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Graceful fallback
    }
  }

  public playToggle(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(310, now + 0.05);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // Graceful fallback
    }
  }

  public playSwordShimmer(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(1760, now + 0.15);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Graceful fallback
    }
  }

  public playSwordSlash(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // White noise burst for blade whoosh
      const bufferSize = Math.floor(ctx.sampleRate * 0.12);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.12);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      // Metal ring tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.15);
      oscGain.gain.setValueAtTime(0.08, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // Graceful fallback
    }
  }

  public playEnemyHit(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Graceful fallback
    }
  }

  public playPowerStrike(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(280, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // Graceful fallback
    }
  }

  public playFireballCast(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.35);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Graceful fallback
    }
  }

  public playHealSpell(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [392, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.08, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.22);
      });
    } catch {
      // Graceful fallback
    }
  }

  public playCoinPickup(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Graceful fallback
    }
  }

  public playLevelUp(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      melody.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.32);
      });
    } catch {
      // Graceful fallback
    }
  }

  public playVictory(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const chords = [
        { f: 523.25, t: 0 },
        { f: 659.25, t: 0.1 },
        { f: 783.99, t: 0.2 },
        { f: 1046.5, t: 0.3 },
      ];
      chords.forEach((c) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(c.f, now + c.t);
        gain.gain.setValueAtTime(0.12, now + c.t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + c.t + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + c.t);
        osc.stop(now + c.t + 0.38);
      });
    } catch {
      // Graceful fallback
    }
  }

  public playGameOver(): void {
    if (!this.settings.sfxEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.12, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.28);
      });
    } catch {
      // Graceful fallback
    }
  }

  public startWindAmbiance(): void {
    if (!this.settings.musicEnabled || this.isWindPlaying) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.05;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      filter.Q.setValueAtTime(3.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.02, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.windNode = whiteNoise;
      this.windGain = gain;
      this.isWindPlaying = true;
    } catch {
      // Graceful fallback
    }
  }

  public stopWindAmbiance(): void {
    if (!this.isWindPlaying) return;
    try {
      if (this.windNode && 'stop' in this.windNode) {
        (this.windNode as AudioScheduledSourceNode).stop();
      }
      this.windNode = null;
      this.windGain = null;
      this.isWindPlaying = false;
    } catch {
      this.isWindPlaying = false;
    }
  }
}

export const soundSynth = new SoundSynthesizer();
