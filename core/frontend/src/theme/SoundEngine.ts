/**
 * RetroHub - Reactive Sensory & Soundscape Engine
 * Stack: Web Audio API (Low-latency AudioContext)
 * Archivo: SoundEngine.ts
 */

export interface SoundConfig {
  type?: 'synth-blip' | 'synth-click' | 'synth-fanfare' | 'synth-chime' | 'synth-pop' | 'synth-soft' | 'synth-bell' | 'synth-warp';
  frequency?: number;
  frequencies?: number[];
  duration?: number;
  src?: string;
}

export interface ThemeAudioConfig {
  enabled: boolean;
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  backgroundMusic?: {
    src: string;
    loop: boolean;
    fadeInDuration: number;
    duckingOnLaunch?: boolean;
  };
  sfx: Record<string, SoundConfig>;
}

export class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxBufferCache: Map<string, AudioBuffer> = new Map();
  private config: ThemeAudioConfig | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Inicialización perezosa (lazy) para cumplir con políticas de autoplay del navegador
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.bgmGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public configure(config: ThemeAudioConfig) {
    this.config = config;
    this.initContext();

    if (this.masterGain && this.sfxGain && this.bgmGain) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : config.masterVolume, this.ctx!.currentTime);
      this.sfxGain.gain.setValueAtTime(config.sfxVolume, this.ctx!.currentTime);
      this.bgmGain.gain.setValueAtTime(config.bgmVolume, this.ctx!.currentTime);
    }

    if (config.backgroundMusic && config.enabled && !this.isMuted) {
      this.playBGM(config.backgroundMusic.src, config.backgroundMusic.fadeInDuration);
    } else {
      this.stopBGM();
    }
  }

  public playSFX(eventName: 'onHover' | 'onClick' | 'onLaunchGame' | 'onNotification' | 'onThemeSwitch') {
    if (!this.config || !this.config.enabled || this.isMuted) return;
    this.initContext();

    const sfxDef = this.config.sfx[eventName];
    if (!sfxDef) return;

    if (sfxDef.src) {
      this.playCachedBuffer(sfxDef.src);
    } else {
      this.synthesizeEffect(sfxDef);
    }
  }

  private synthesizeEffect(def: SoundConfig) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const dur = def.duration || 0.08;

    switch (def.type) {
      case 'synth-blip': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(def.frequency || 880, now);
        osc.frequency.exponentialRampToValueAtTime((def.frequency || 880) * 1.5, now + dur);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + dur);
        break;
      }

      case 'synth-click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(def.frequency || 440, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + dur);

        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + dur);
        break;
      }

      case 'synth-fanfare': {
        const chord = [523.25, 659.25, 783.99, 1046.50];
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const startTime = now + idx * 0.08;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.2, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(startTime);
          osc.stop(startTime + 0.4);
        });
        break;
      }

      case 'synth-chime': {
        const freqs = def.frequencies || [440, 554.37, 659.25];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const startTime = now + idx * 0.06;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.3, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

          osc.connect(gain);
          gain.connect(this.sfxGain!);
          osc.start(startTime);
          osc.stop(startTime + dur);
        });
        break;
      }

      case 'synth-pop':
      case 'synth-soft':
      default: {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(def.frequency || 600, now);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + dur);
        break;
      }
    }
  }

  public playBGM(src: string, fadeIn: number = 2.0) {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }

    try {
      this.bgmAudio = new Audio(src);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = 0;
      this.bgmAudio.play().then(() => {
        const targetVol = this.config?.bgmVolume || 0.5;
        let elapsed = 0;
        const interval = setInterval(() => {
          elapsed += 0.1;
          if (this.bgmAudio) {
            this.bgmAudio.volume = Math.min(targetVol, (elapsed / fadeIn) * targetVol);
          }
          if (elapsed >= fadeIn) clearInterval(interval);
        }, 100);
      }).catch(err => {
        console.warn("[SoundEngine] Autoplay bloqueado hasta interacción de usuario:", err);
      });
    } catch (e) {
      console.warn("[SoundEngine] Error cargando BGM:", e);
    }
  }

  public stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio = null;
    }
  }

  public duckAudio(durationMs: number = 1500) {
    if (!this.bgmGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const currentGain = this.bgmGain.gain.value;
    this.bgmGain.gain.setTargetAtTime(currentGain * 0.2, now, 0.1);
    setTimeout(() => {
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setTargetAtTime(currentGain, this.ctx.currentTime, 0.3);
      }
    }, durationMs);
  }

  private async playCachedBuffer(url: string) {
    if (!this.ctx || !this.sfxGain) return;
    try {
      let buffer = this.sfxBufferCache.get(url);
      if (!buffer) {
        const res = await fetch(url);
        const arrayBuf = await res.arrayBuffer();
        buffer = await this.ctx.decodeAudioData(arrayBuf);
        this.sfxBufferCache.set(url, buffer);
      }
      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(this.sfxGain);
      source.start();
    } catch (err) {
      console.warn(`[SoundEngine] No se pudo reproducir sample ${url}:`, err);
    }
  }
}

export const soundEngine = new SoundscapeEngine();
