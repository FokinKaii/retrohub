/**
 * Nintendo 3DS Spatial Navigation & Gamepad Controller Engine
 */

class N3DSController {
    constructor() {
        this.focusedIndex = 0;
        this.gamepadIndex = null;
        this.lastGamepadAxes = { x: 0, y: 0 };
        this.lastGamepadTime = 0;
        this.initKeyboard();
        this.initGamepad();
    }

    initKeyboard() {
        document.addEventListener('keydown', (e) => {
            // Ignore key events inside search or input fields
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
                return;
            }

            const tiles = Array.from(document.querySelectorAll('.n3ds-tile'));
            if (!tiles.length) return;

            const grid = document.querySelector('.n3ds-grid');
            const cols = parseInt(grid?.getAttribute('data-cols') || '3', 10);

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.navigate(-1, tiles);
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.navigate(1, tiles);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigate(-cols, tiles);
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigate(cols, tiles);
                    break;
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (tiles[this.focusedIndex]) {
                        tiles[this.focusedIndex].click();
                        if (window.N3DSAudio) window.N3DSAudio.play('launch');
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (typeof cerrarModalActual === 'function') {
                        cerrarModalActual();
                    }
                    if (window.N3DSAudio) window.N3DSAudio.play('back');
                    break;
                case 'f':
                case 'F':
                    e.preventDefault();
                    if (tiles[this.focusedIndex]) {
                        const starBtn = tiles[this.focusedIndex].querySelector('.n3ds-tile-star');
                        if (starBtn) {
                            starBtn.click();
                            if (window.N3DSAudio) window.N3DSAudio.play('favorite');
                        }
                    }
                    break;
                case 't':
                case 'T':
                    e.preventDefault();
                    if (typeof abrirModalTemas === 'function') {
                        abrirModalTemas();
                    }
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    if (typeof alternarSonido === 'function') {
                        alternarSonido();
                    }
                    break;
            }
        });
    }

    navigate(delta, tiles) {
        if (!tiles.length) return;
        let nextIndex = this.focusedIndex + delta;
        if (nextIndex < 0) nextIndex = 0;
        if (nextIndex >= tiles.length) nextIndex = tiles.length - 1;

        if (nextIndex !== this.focusedIndex) {
            this.focusedIndex = nextIndex;
            tiles[this.focusedIndex].focus();
            tiles[this.focusedIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            if (window.N3DSAudio) window.N3DSAudio.play('move');

            // Trigger mouseover logic to update 3D screen preview
            const event = new MouseEvent('mouseover', { bubbles: true, cancelable: true });
            tiles[this.focusedIndex].dispatchEvent(event);
        }
    }

    initGamepad() {
        window.addEventListener('gamepadconnected', (e) => {
            console.log('3DS Gamepad connected:', e.gamepad.id);
            this.gamepadIndex = e.gamepad.index;
            this.pollGamepad();
        });

        window.addEventListener('gamepaddisconnected', () => {
            this.gamepadIndex = null;
        });
    }

    pollGamepad() {
        if (this.gamepadIndex === null) return;
        const gp = navigator.getGamepads()[this.gamepadIndex];
        if (!gp) return;

        const now = Date.now();
        if (now - this.lastGamepadTime > 165) {
            const tiles = Array.from(document.querySelectorAll('.n3ds-tile'));
            const grid = document.querySelector('.n3ds-grid');
            const cols = parseInt(grid?.getAttribute('data-cols') || '3', 10);

            // D-Pad or Left Stick
            const axisX = gp.axes[0];
            const axisY = gp.axes[1];
            const dpadLeft = gp.buttons[14]?.pressed;
            const dpadRight = gp.buttons[15]?.pressed;
            const dpadUp = gp.buttons[12]?.pressed;
            const dpadDown = gp.buttons[13]?.pressed;

            if (dpadLeft || axisX < -0.5) {
                this.navigate(-1, tiles);
                this.lastGamepadTime = now;
            } else if (dpadRight || axisX > 0.5) {
                this.navigate(1, tiles);
                this.lastGamepadTime = now;
            } else if (dpadUp || axisY < -0.5) {
                this.navigate(-cols, tiles);
                this.lastGamepadTime = now;
            } else if (dpadDown || axisY > 0.5) {
                this.navigate(cols, tiles);
                this.lastGamepadTime = now;
            }

            // Button A (0): Click
            if (gp.buttons[0]?.pressed) {
                if (tiles[this.focusedIndex]) {
                    tiles[this.focusedIndex].click();
                    if (window.N3DSAudio) window.N3DSAudio.play('launch');
                }
                this.lastGamepadTime = now + 100;
            }

            // Button B (1): Back
            if (gp.buttons[1]?.pressed) {
                if (typeof cerrarModalActual === 'function') cerrarModalActual();
                if (window.N3DSAudio) window.N3DSAudio.play('back');
                this.lastGamepadTime = now + 100;
            }

            // Button X (2): Favorite
            if (gp.buttons[2]?.pressed) {
                if (tiles[this.focusedIndex]) {
                    const starBtn = tiles[this.focusedIndex].querySelector('.n3ds-tile-star');
                    if (starBtn) starBtn.click();
                }
                this.lastGamepadTime = now + 100;
            }

            // Button Y (3): Themes
            if (gp.buttons[3]?.pressed) {
                if (typeof abrirModalTemas === 'function') abrirModalTemas();
                this.lastGamepadTime = now + 100;
            }
        }

        requestAnimationFrame(() => this.pollGamepad());
    }
}

window.N3DSControllerInstance = new N3DSController();
