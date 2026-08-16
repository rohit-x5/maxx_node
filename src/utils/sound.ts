// High-Tech Futuristic Audio Synthesizer (Apple / Tesla Inspired)

export type SoundPreset = 'SONAR_CHIME' | 'CYBER_PULSE' | 'HARMONIC_ALARM' | 'SOFT_BEACON';

class SoundFX {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  public volume: number = 0.75;
  public activePreset: SoundPreset = 'SONAR_CHIME';

  public initCtx() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  setPreset(preset: SoundPreset) {
    this.activePreset = preset;
  }

  // Futuristic Apple-style subtle telemetry packet click
  playPacketBlip() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now); // A6
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.03);

      const effectiveVol = 0.02 * this.volume;
      gain.gain.setValueAtTime(effectiveVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Audio safety catch
    }
  }

  // Futuristic, High-End Intrusion Alarm (Tesla / Sci-Fi Sonar & Multi-Tone Chime)
  playMotionAlarm() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (this.activePreset === 'SONAR_CHIME') {
        // Tesla / Apple Style Elegant 3-Tone Futuristic Chime (C6 -> E6 -> G6 harmonic cascade)
        const notes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
        notes.forEach((freq, index) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + index * 0.1);

          const vol = 0.12 * this.volume;
          gain.gain.setValueAtTime(0, now + index * 0.1);
          gain.gain.linearRampToValueAtTime(vol, now + index * 0.1 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.1 + 0.45);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + index * 0.1);
          osc.stop(now + index * 0.1 + 0.48);
        });
      } else if (this.activePreset === 'CYBER_PULSE') {
        // High-Tech Sci-Fi Double Ping
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(987.77, now); // B5
        osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6
        osc.frequency.setValueAtTime(987.77, now + 0.18);
        osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.28); // G6

        const vol = 0.14 * this.volume;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.46);
      } else {
        // Harmonic Alarm
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(880, now);
        osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25);
        osc2.frequency.setValueAtTime(440, now);
        osc2.frequency.exponentialRampToValueAtTime(587.33, now + 0.25);

        const vol = 0.12 * this.volume;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.42);
        osc2.stop(now + 0.42);
      }
    } catch (e) {
      console.warn('Audio alarm synthesis error:', e);
    }
  }

  // Calm confirmation chime
  playClearChime() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now); // E5
      osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.15); // A5

      const vol = 0.05 * this.volume;
      gain.gain.setValueAtTime(vol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.37);
    } catch {
      // ignore
    }
  }
}

export const soundFx = new SoundFX();
