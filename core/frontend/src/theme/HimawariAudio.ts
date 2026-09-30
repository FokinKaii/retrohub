/**
 * Himawari Cinematic Launcher - Spatial 3D Audio Engine
 * Stack: Web Audio API (StereoPannerNode + AudioBuffer Pre-cache + Low Latency)
 * Archivo: core/frontend/src/theme/HimawariAudio.ts
 */

export interface HimawariSFXConfig {
  src?: string;
  synthType?: string;
  frequency?: number;
  frequencies?: number[];
  duration?: number;
}

export class HimawariAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bufferCache: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;

  constructor() {
    // Lazy AudioContext initialization
  }

  private ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /**
   * Pre-carga y decodificación asíncrona de buffers en memoria para latencia determinista (< 5ms)
   */
  public async preloadSound(url: string): Promise<void> {
    this.ensureContext();
    if (this.bufferCache.has(url) || !this.ctx) return;

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(url, audioBuffer);
    } catch (err) {
      console.warn(`[HimawariAudio] No se pudo pre-cargar el audio ${url}, usando fallback sintético:`, err);
    }
  }

  /**
   * Reproduce un sonido espacializado en el panorama estéreo
   * @param direction 'left' (-0.65 pan) | 'right' (+0.65 pan) | 'center' (0.0 pan)
   */
  public playSpatialSFX(
    sfxType: 'ui_move' | 'ui_select' | 'social_notify' | 'ui_launch',
    direction: 'left' | 'right' | 'center' = 'center',
    config?: HimawariSFXConfig
  ) {
    this.ensureContext();
    if (!this.ctx || !this.masterGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Configurar nodo de paneo estéreo espacial
    let panner: StereoPannerNode | null = null;
    try {
      panner = this.ctx.createStereoPanner();
      const panValue = direction === 'left' ? -0.65 : direction === 'right' ? 0.65 : 0.0;
      panner.pan.setValueAtTime(panValue, now);
      panner.connect(this.masterGain);
    } catch (e) {
      // Fallback si StereoPannerNode no está soportado en browsers antiguos
      panner = null;
    }

    const outputNode: AudioNode = panner || this.masterGain;

    // 2. Si el audioBuffer está en caché, lo reproducimos directamente
    if (config?.src && this.bufferCache.has(config.src)) {
      const source = this.ctx.createBufferSource();
      source.buffer = this.bufferCache.get(config.src)!;
      source.connect(outputNode);
      source.start(now);
      return;
    }

    // 3. Síntesis procedural fallback de alta fidelidad
    this.synthesizeSpatialTone(sfxType, outputNode, now, config);
  }

  private synthesizeSpatialTone(
    sfxType: string,
    destination: AudioNode,
    now: number,
    config?: HimawariSFXConfig
  ) {
    if (!this.ctx) return;

    switch (sfxType) {
      case 'ui_move': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(config?.frequency || 1280, now);
        osc.frequency.exponentialRampToValueAtTime((config?.frequency || 1280) * 1.3, now + 0.03);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.035);
        break;
      }

      case 'ui_select': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(config?.frequency || 1760, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(destination);
        osc.start(now);
        osc.stop(now + 0.09);
        break;
      }

      case 'social_notify': {
        const freqs = config?.frequencies || [880, 1760];
        freqs.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const start = now + idx * 0.07;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.25, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);

          osc.connect(gain);
          gain.connect(destination);
          osc.start(start);
          osc.stop(start + 0.2);
        });
        break;
      }

      case 'ui_launch': {
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chord.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const start = now + idx * 0.05;
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, start);
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);

          osc.connect(gain);
          gain.connect(destination);
          osc.start(start);
          osc.stop(start + 0.5);
        });
        break;
      }
    }
  }
}

export const himawariAudio = new HimawariAudioEngine();
