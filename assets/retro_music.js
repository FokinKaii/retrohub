/**
 * RetroHub Music Synthesizer Engine (Web Audio API)
 * Plays authentic iconic game themes for each console when passing through the carousel.
 * Zero external audio dependencies - 100% reliable, zero latency.
 */

class RetroConsoleMusicEngine {
    constructor() {
        this.ctx = null;
        this.currentConsole = null;
        this.isPlaying = false;
        this.isMuted = false;
        this.volume = 0.28;
        this.masterGain = null;
        this.loopTimer = null;
        this.activeOscillators = [];

        // Metadatos de canciones icónicas por consola
        this.themeTracks = {
            'n64': {
                game: 'Super Mario 64',
                title: 'Bob-omb Battlefield',
                bpm: 130,
                waveform: 'triangle',
                notes: [
                    { n: 'C4', d: 0.25 }, { n: 'E4', d: 0.25 }, { n: 'G4', d: 0.25 }, { n: 'A4', d: 0.5 },
                    { n: 'G4', d: 0.25 }, { n: 'E4', d: 0.25 }, { n: 'C4', d: 0.5 },
                    { n: 'D4', d: 0.25 }, { n: 'F4', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'G4', d: 0.75 },
                    { n: 'C4', d: 0.25 }, { n: 'E4', d: 0.25 }, { n: 'G4', d: 0.25 }, { n: 'A4', d: 0.5 },
                    { n: 'C5', d: 0.5 }, { n: 'B4', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'G4', d: 0.75 }
                ]
            },
            'gba': {
                game: 'Pokémon Rubí / Zafiro',
                title: 'Littleroot Town Theme',
                bpm: 110,
                waveform: 'sine',
                notes: [
                    { n: 'G4', d: 0.5 }, { n: 'A4', d: 0.25 }, { n: 'B4', d: 0.5 }, { n: 'D5', d: 0.5 },
                    { n: 'C5', d: 0.25 }, { n: 'B4', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'G4', d: 0.5 },
                    { n: 'F#4', d: 0.25 }, { n: 'G4', d: 0.25 }, { n: 'A4', d: 0.5 }, { n: 'D4', d: 0.75 },
                    { n: 'B4', d: 0.5 }, { n: 'C5', d: 0.25 }, { n: 'D5', d: 0.5 }, { n: 'G5', d: 0.75 }
                ]
            },
            'snes': {
                game: 'Super Mario World',
                title: 'Overworld 1-1 Theme',
                bpm: 140,
                waveform: 'triangle',
                notes: [
                    { n: 'C4', d: 0.2 }, { n: 'G4', d: 0.2 }, { n: 'E4', d: 0.2 }, { n: 'A4', d: 0.3 },
                    { n: 'B4', d: 0.2 }, { n: 'Bb4', d: 0.2 }, { n: 'A4', d: 0.3 }, { n: 'G4', d: 0.4 },
                    { n: 'E5', d: 0.3 }, { n: 'G5', d: 0.3 }, { n: 'A5', d: 0.3 }, { n: 'F5', d: 0.2 },
                    { n: 'G5', d: 0.2 }, { n: 'E5', d: 0.3 }, { n: 'C5', d: 0.2 }, { n: 'D5', d: 0.2 }, { n: 'B4', d: 0.4 }
                ]
            },
            'nes': {
                game: 'Super Mario Bros.',
                title: 'Ground Theme (Overworld 1-1)',
                bpm: 150,
                waveform: 'square',
                notes: [
                    { n: 'E5', d: 0.18 }, { n: 'E5', d: 0.18 }, { n: 'R', d: 0.18 }, { n: 'E5', d: 0.18 },
                    { n: 'R', d: 0.18 }, { n: 'C5', d: 0.18 }, { n: 'E5', d: 0.36 },
                    { n: 'G5', d: 0.36 }, { n: 'R', d: 0.36 }, { n: 'G4', d: 0.36 }, { n: 'R', d: 0.36 },
                    { n: 'C5', d: 0.28 }, { n: 'R', d: 0.18 }, { n: 'G4', d: 0.28 }, { n: 'R', d: 0.18 }, { n: 'E4', d: 0.28 }
                ]
            },
            'genesis': {
                game: 'Sonic The Hedgehog',
                title: 'Green Hill Zone Theme',
                bpm: 135,
                waveform: 'sawtooth',
                notes: [
                    { n: 'C5', d: 0.25 }, { n: 'Bb4', d: 0.25 }, { n: 'Ab4', d: 0.25 }, { n: 'Bb4', d: 0.25 },
                    { n: 'C5', d: 0.5 }, { n: 'Eb5', d: 0.35 }, { n: 'Db5', d: 0.25 }, { n: 'C5', d: 0.25 },
                    { n: 'Bb4', d: 0.5 }, { n: 'Ab4', d: 0.25 }, { n: 'Bb4', d: 0.5 }, { n: 'C5', d: 0.5 },
                    { n: 'Db5', d: 0.25 }, { n: 'C5', d: 0.25 }, { n: 'Bb4', d: 0.5 }, { n: 'Ab4', d: 0.75 }
                ]
            },
            'ps1': {
                game: 'Crash Bandicoot',
                title: 'N. Sanity Beach Main Theme',
                bpm: 125,
                waveform: 'triangle',
                notes: [
                    { n: 'C4', d: 0.25 }, { n: 'Eb4', d: 0.25 }, { n: 'F4', d: 0.25 }, { n: 'F#4', d: 0.25 },
                    { n: 'G4', d: 0.5 }, { n: 'C5', d: 0.25 }, { n: 'Bb4', d: 0.25 }, { n: 'G4', d: 0.5 },
                    { n: 'F4', d: 0.25 }, { n: 'Eb4', d: 0.25 }, { n: 'C4', d: 0.5 }, { n: 'G4', d: 0.75 }
                ]
            },
            'psp': {
                game: 'Persona 3 Portable',
                title: 'Velvet Room (Aria of the Soul)',
                bpm: 95,
                waveform: 'sine',
                notes: [
                    { n: 'E4', d: 0.6 }, { n: 'G4', d: 0.4 }, { n: 'B4', d: 0.6 }, { n: 'E5', d: 0.8 },
                    { n: 'D5', d: 0.4 }, { n: 'B4', d: 0.4 }, { n: 'C5', d: 0.6 }, { n: 'A4', d: 0.8 },
                    { n: 'F#4', d: 0.5 }, { n: 'A4', d: 0.5 }, { n: 'D5', d: 0.6 }, { n: 'E5', d: 1.0 }
                ]
            },
            'arcade': {
                game: 'Street Fighter II',
                title: "Guile's Theme",
                bpm: 140,
                waveform: 'sawtooth',
                notes: [
                    { n: 'Eb4', d: 0.2 }, { n: 'F4', d: 0.2 }, { n: 'G4', d: 0.3 }, { n: 'Bb4', d: 0.4 },
                    { n: 'Ab4', d: 0.2 }, { n: 'G4', d: 0.2 }, { n: 'F4', d: 0.4 }, { n: 'Eb4', d: 0.3 },
                    { n: 'G4', d: 0.3 }, { n: 'Bb4', d: 0.3 }, { n: 'C5', d: 0.5 }, { n: 'Bb4', d: 0.6 }
                ]
            },
            'gbc': {
                game: 'Tetris / Game Boy',
                title: 'Theme A (Korobeiniki)',
                bpm: 140,
                waveform: 'square',
                notes: [
                    { n: 'E5', d: 0.4 }, { n: 'B4', d: 0.2 }, { n: 'C5', d: 0.2 }, { n: 'D5', d: 0.4 },
                    { n: 'C5', d: 0.2 }, { n: 'B4', d: 0.2 }, { n: 'A4', d: 0.4 }, { n: 'A4', d: 0.2 },
                    { n: 'C5', d: 0.2 }, { n: 'E5', d: 0.4 }, { n: 'D5', d: 0.2 }, { n: 'C5', d: 0.2 },
                    { n: 'B4', d: 0.6 }, { n: 'C5', d: 0.2 }, { n: 'D5', d: 0.4 }, { n: 'E5', d: 0.4 },
                    { n: 'C5', d: 0.4 }, { n: 'A4', d: 0.4 }, { n: 'A4', d: 0.6 }
                ]
            },
            'sms': {
                game: 'Alex Kidd in Miracle World',
                title: 'Main Adventure Theme',
                bpm: 130,
                waveform: 'square',
                notes: [
                    { n: 'C4', d: 0.25 }, { n: 'E4', d: 0.25 }, { n: 'G4', d: 0.25 }, { n: 'C5', d: 0.5 },
                    { n: 'B4', d: 0.25 }, { n: 'A4', d: 0.25 }, { n: 'G4', d: 0.5 },
                    { n: 'A4', d: 0.25 }, { n: 'B4', d: 0.25 }, { n: 'C5', d: 0.5 }, { n: 'G4', d: 0.5 }
                ]
            },
            'atari': {
                game: 'Space Invaders',
                title: 'Arcade Pulse March',
                bpm: 100,
                waveform: 'square',
                notes: [
                    { n: 'A2', d: 0.3 }, { n: 'G2', d: 0.3 }, { n: 'F2', d: 0.3 }, { n: 'E2', d: 0.3 }
                ]
            },
            'pce': {
                game: 'Castlevania: Rondo of Blood',
                title: 'Bloodlines Theme',
                bpm: 135,
                waveform: 'sawtooth',
                notes: [
                    { n: 'D4', d: 0.3 }, { n: 'F4', d: 0.2 }, { n: 'G4', d: 0.3 }, { n: 'A4', d: 0.5 },
                    { n: 'Bb4', d: 0.3 }, { n: 'A4', d: 0.2 }, { n: 'G4', d: 0.3 }, { n: 'F4', d: 0.5 },
                    { n: 'E4', d: 0.3 }, { n: 'G4', d: 0.3 }, { n: 'A4', d: 0.6 }
                ]
            },
            'nds': {
                game: 'Mario Kart DS',
                title: 'Title Screen Theme',
                bpm: 130,
                waveform: 'triangle',
                notes: [
                    { n: 'G4', d: 0.2 }, { n: 'C5', d: 0.3 }, { n: 'E5', d: 0.2 }, { n: 'G5', d: 0.4 },
                    { n: 'E5', d: 0.2 }, { n: 'C5', d: 0.3 }, { n: 'D5', d: 0.5 },
                    { n: 'F5', d: 0.2 }, { n: 'E5', d: 0.2 }, { n: 'D5', d: 0.3 }, { n: 'C5', d: 0.6 }
                ]
            },
            'virtualboy': {
                game: 'Virtual Boy Wario Land',
                title: 'Underground Level Theme',
                bpm: 120,
                waveform: 'triangle',
                notes: [
                    { n: 'C3', d: 0.3 }, { n: 'Eb3', d: 0.3 }, { n: 'G3', d: 0.3 }, { n: 'Ab3', d: 0.4 },
                    { n: 'G3', d: 0.3 }, { n: 'Eb3', d: 0.3 }, { n: 'C3', d: 0.6 }
                ]
            }
        };

        // Frecuencias exactas de notas
        this.noteFreqs = {
            'A2': 110.00, 'G2': 98.00, 'F2': 87.31, 'E2': 82.41,
            'C3': 130.81, 'Eb3': 155.56, 'G3': 196.00, 'Ab3': 207.65,
            'G4': 392.00, 'F#4': 369.99, 'F4': 349.23, 'E4': 329.63, 'Eb4': 311.13,
            'D4': 293.66, 'Db4': 277.18, 'C4': 261.63, 'B4': 493.88, 'Bb4': 466.16,
            'A4': 440.00, 'Ab4': 415.30,
            'C5': 523.25, 'Db5': 554.37, 'D5': 587.33, 'Eb5': 622.25, 'E5': 659.25,
            'F5': 698.46, 'F#5': 739.99, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
            'R': 0
        };

        this.initOnUserGesture();
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
                this.masterGain = this.ctx.createGain();
                this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
                this.masterGain.connect(this.ctx.destination);
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

    getTrackInfo(consoleId) {
        return this.themeTracks[consoleId] || {
            game: 'RetroHub Classic',
            title: 'Chiptune Ambient',
            bpm: 120,
            waveform: 'sine',
            notes: []
        };
    }

    playConsoleTheme(consoleId) {
        this.init();
        if (!this.ctx || this.isMuted) return;

        // Si ya está sonando la misma consola, continuar
        if (this.currentConsole === consoleId && this.isPlaying) return;

        this.stopCurrentTheme();
        this.currentConsole = consoleId;
        const track = this.themeTracks[consoleId];
        if (!track || track.notes.length === 0) return;

        this.isPlaying = true;
        this.playSequence(track, 0);
    }

    playSequence(track, noteIndex) {
        if (!this.isPlaying || this.isMuted || !this.ctx) return;

        const note = track.notes[noteIndex];
        const freq = this.noteFreqs[note.n] || 0;
        const duration = note.d * (60 / track.bpm) * 1.5;

        if (freq > 0) {
            try {
                // Oscilador Principal de la Melodía
                const osc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();

                osc.type = track.waveform || 'triangle';
                osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

                // Envolvente de sonido tipo Chiptune/Retro
                const now = this.ctx.currentTime;
                noteGain.gain.setValueAtTime(0, now);
                noteGain.gain.linearRampToValueAtTime(0.22, now + 0.03);
                noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

                osc.connect(noteGain);
                noteGain.connect(this.masterGain);

                osc.start(now);
                osc.stop(now + duration);
                this.activeOscillators.push(osc);

                // Bajo sutil en consonancia
                if (track.waveform !== 'sine') {
                    const subOsc = this.ctx.createOscillator();
                    const subGain = this.ctx.createGain();
                    subOsc.type = 'sine';
                    subOsc.frequency.setValueAtTime(freq / 2, now);
                    subGain.gain.setValueAtTime(0.12, now);
                    subGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.9);
                    subOsc.connect(subGain);
                    subGain.connect(this.masterGain);
                    subOsc.start(now);
                    subOsc.stop(now + duration * 0.9);
                    this.activeOscillators.push(subOsc);
                }
            } catch (e) {}
        }

        const nextIndex = (noteIndex + 1) % track.notes.length;
        this.loopTimer = setTimeout(() => {
            this.playSequence(track, nextIndex);
        }, duration * 1000);
    }

    stopCurrentTheme() {
        this.isPlaying = false;
        clearTimeout(this.loopTimer);
        this.activeOscillators.forEach(osc => {
            try { osc.stop(); } catch (e) {}
        });
        this.activeOscillators = [];
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.isMuted) {
            this.stopCurrentTheme();
        } else if (this.currentConsole) {
            this.playConsoleTheme(this.currentConsole);
        }
        return this.isMuted;
    }

    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
        }
    }
}

window.retroConsoleMusic = new RetroConsoleMusicEngine();
