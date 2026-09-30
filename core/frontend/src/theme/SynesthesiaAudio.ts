/**
 * RetroHub Living Organism - Synesthesia Dual-Bus Audio Engine
 * Stack: Web Audio API (Dual Stereo BGM Crossfader + Instant Sound Ducking)
 * Archivo: core/frontend/src/theme/SynesthesiaAudio.ts
 */

export interface SoundEffectDefinition {
  type: string;
  frequency?: number;
  frequencies?: number[];
  duration?: number;
  src?: string;
}

export class SynesthesiaAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  
  // Dual BGM Buses para Crossfade Impecable entre Consolas
  private bgmGainA: GainNode | null = null;
  private bgmGainB: GainNode | null = null;
  private activeBus: 'A' | 'B' = 'A';
  private audioA: HTMLAudioElement | null = null;
  private audioB: HTMLAudioElement | null = null;

  private isDucking: boolean = false;
  private targetBgmVolume: number = 0.5;
  private sfxMap: Map<string, SoundEffectDefinition> = new Map();

  constructor() {
    // Inicialización Lazy al primer input de usuario
  }

  private initAudio() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.bgmGainA = this.ctx.createGain();
      this.bgmGainB = this.ctx.createGain();

      this.sfxGain.connect(this.masterGain);
      this.bgmGainA.connect(this.masterGain);
      this.bgmGainB.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);

      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.bgmGainA.gain.setValueAtTime(this.targetBgmVolume, this.ctx.currentTime);
      this.bgmGainB.gain.setValueAtTime(0.0, this.ctx.currentTime);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public configureSoundMap(sfxConfig: Record<string, SoundEffectDefinition>, bgmVol: number = 0.5) {
    this.initAudio();
    this.targetBgmVolume = bgmVol;
    this.sfxMap.clear();
    for (const [key, val] of Object.entries(sfxConfig)) {
      this.sfxMap.set(key, val);
    }
  }

  /**
   * Crossfade BGM entre consolas: Se atenúa el bus saliente mientras se eleva el entrante
   */
  public crossfadeBGM(newSource: string, fadeDuration: number = 1.6) {
    this.initAudio();
    if (!this.ctx || !this.bgmGainA || !this.bgmGainB) return;

    const now = this.ctx.currentTime;
    const isBusAActive = this.activeBus === 'A';
    
    // El bus saliente baja a 0, el bus entrante sube a targetBgmVolume
    const outgoingGain = isBusAActive ? this.bgmGainA : this.bgmGainB;
    const incomingGain = isBusAActive ? this.bgmGainB : this.bgmGainA;

    outgoingGain.gain.linearRampToValueAtTime(0.001, now + fadeDuration);
    incomingGain.gain.linearRampToValueAtTime(this.targetBgmVolume, now + fadeDuration);

    try {
      const newAudio = new Audio(newSource);
      newAudio.loop = true;
      newAudio.volume = 1; // Volumen controlado por el GainNode
      newAudio.play().catch(() => {});

      if (isBusAActive) {
        if (this.audioA) {
          setTimeout(() => { this.audioA?.pause(); this.audioA = null; }, fadeDuration * 1000);
        }
        this.audioB = newAudio;
        this.activeBus = 'B';
      } else {
        if (this.audioB) {
          setTimeout(() => { this.audioB?.pause(); this.audioB = null; }, fadeDuration * 1000);
        }
        this.audioA = newAudio;
        this.activeBus = 'A';
      }
    } catch (e) {
      console.warn('[SynesthesiaAudio] Error en reproducción de BGM:', e);
    }
  }

  /**
   * Auto-Ducking: Reduce el volumen del BGM un 30% durante efectos de sonido o avisos sociales
   */
  public triggerDucking(duckPercent: number = 0.3, durationSeconds: number = 0.85) {
    if (!this.ctx || !this.bgmGainA || !this.bgmGainB || this.isDucking) return;
    this.isDucking = true;

    const now = this.ctx.currentTime;
    const currentBusGain = this.activeBus === 'A' ? this.bgmGainA : this.bgmGainB;
    const normalVol = this.targetBgmVolume;
    const duckedVol = normalVol * (1 - duckPercent);

    // Atenuación suave inmediata
    currentBusGain.gain.setTargetAtTime(duckedVol, now, 0.04);

    // Restauración después de que pase el efecto
    setTimeout(() => {
      if (this.ctx) {
        currentBusGain.gain.setTargetAtTime(normalVol, this.ctx.currentTime, 0.2);
        this.isDucking = false;
      }
    }, durationSeconds * 1000);
  }

  /**
   * Reproduce efectos de interfaz y gatilla ducking automático si es de alto impacto
   */
  public playSFX(name: 'hover' | 'click' | 'scroll' | 'launch' | 'socialPop') {
    this.initAudio();
    if (!this.ctx || !this.sfxGain) return;

    if (name === 'launch' || name === 'socialPop') {
      this.triggerDucking(0.35, 1.2);
    }

    const sfx = this.sfxMap.get(name);
    if (!sfx) {
      this.playDefaultSynth(name);
      return;
    }

    this.synthesizeEffect(sfx);
  }

  private synthesizeEffect(def: SoundEffectDefinition) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const dur = def.duration || 0.06;

    if (def.frequencies && def.frequencies.length > 0) {
      def.frequencies.forEach((f, idx) => {
        const osc = this.ctx!.createOscillator();
        const g = this.ctx!.createGain();
        const start = now + idx * 0.05;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, start);
        g.gain.setValueAtTime(0.2, start);
        g.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.connect(g);
        g.connect(this.sfxGain!);
        osc.start(start);
        osc.stop(start + dur);
      });
      return;
    }

    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = def.type.includes('bubble') ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(def.frequency || 880, now);
    g.gain.setValueAtTime(0.25, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + dur);
  }

  private playDefaultSynth(name: string) {
    if (!this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    const freq = name === 'launch' ? 1046.5 : name === 'hover' ? 1200 : 600;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0.2, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const synesthesiaAudio = new SynesthesiaAudioEngine();
