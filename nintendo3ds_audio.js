/**
 * Nintendo 3DS x AYN Thor Handheld Sound Engine (Joyful & Fresh Edition)
 * Generates authentic 3DS chimes, crisp clicks, and relaxing music box background loops.
 */

class N3DSAudioEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.bgmEnabled = false;
        this.bgmTimer = null;
        this.volume = 0.35;
        this.initOnUserGesture();
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    initOnUserGesture() {
        const unlock = () => {
            this.init();
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
    }

    play(soundType) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;

        try {
            switch (soundType) {
                case 'move':
                case 'cursor':
                    // Crisp 3DS wooden tick / light chime
                    this.playMoveTick(now);
                    break;
                case 'launch':
                case 'open':
                    // 3DS Joyful ascending bell chime (C5 -> E5 -> G5 -> C6)
                    this.playLaunchChime(now);
                    break;
                case 'back':
                case 'cancel':
                    // Soft low double wood thud
                    this.playBackSound(now);
                    break;
                case 'theme':
                case 'folder':
                    // Mechanical 3DS snap
                    this.playThemeSnap(now);
                    break;
                case 'favorite':
                case 'star':
                    // Magical crystal chime arpeggio
                    this.playFavoritePing(now);
                    break;
                case 'zoom':
                    // Grid size toggle pop
                    this.playZoomPop(now);
                    break;
                default:
                    this.playMoveTick(now);
                    break;
            }
        } catch (e) {
            console.warn('Audio error:', e);
        }
    }

    playMoveTick(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(1500, t);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.035);

        gain.gain.setValueAtTime(this.volume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.045);
    }

    playLaunchChime(t) {
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, idx) => {
            const startTime = t + idx * 0.05;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0.001, startTime);
            gain.gain.linearRampToValueAtTime(this.volume * 0.45, startTime + 0.012);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.32);
        });
    }

    playBackSound(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(260, t + 0.07);

        gain.gain.setValueAtTime(this.volume * 0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.09);
    }

    playThemeSnap(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(1100, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);

        gain.gain.setValueAtTime(this.volume * 0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    playFavoritePing(t) {
        const freqs = [1046.50, 1318.51, 1567.98, 2093.00, 2637.02];
        freqs.forEach((f, i) => {
            const st = t + i * 0.035;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, st);

            gain.gain.setValueAtTime(this.volume * 0.35, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.22);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(st);
            osc.stop(st + 0.23);
        });
    }

    playZoomPop(t) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';

        osc.frequency.setValueAtTime(450, t);
        osc.frequency.exponentialRampToValueAtTime(1200, t + 0.045);

        gain.gain.setValueAtTime(this.volume * 0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.06);
    }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.bgmEnabled;
    }

    startBGM() {
        this.init();
        if (!this.ctx) return;
        this.stopBGM();

        // Relaxing Nintendo 3DS eShop / Mii Plaza Music Box Loop
        const chords = [
            [523.25, 659.25, 783.99], // C
            [587.33, 698.46, 880.00], // Dm
            [659.25, 783.99, 987.77], // Em
            [698.46, 880.00, 1046.50] // F
        ];

        let chordIdx = 0;
        const playBar = () => {
            if (!this.bgmEnabled || !this.ctx) return;
            const now = this.ctx.currentTime;
            const currentChord = chords[chordIdx % chords.length];

            currentChord.forEach((freq, i) => {
                const noteTime = now + i * 0.12;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.001, noteTime);
                gain.gain.linearRampToValueAtTime(0.03, noteTime + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 1.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(noteTime);
                osc.stop(noteTime + 1.3);
            });

            chordIdx++;
            this.bgmTimer = setTimeout(playBar, 1600);
        };

        playBar();
    }

    stopBGM() {
        if (this.bgmTimer) {
            clearTimeout(this.bgmTimer);
            this.bgmTimer = null;
        }
    }
}

window.N3DSAudio = new N3DSAudioEngine();
