/**
 * iiSu Frontend Interactive Mouse Cursor Engine (https://iisu.network/)
 * Features: Fluid Lerp Motion, Glowing Aura Ring, Magnet Hover & Click Ripple Pulse
 */

class IisuCursorEngine {
    constructor() {
        this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.isHovered = false;
        this.isMouseDown = false;
        this.init();
    }

    init() {
        if (document.getElementById('iisu-cursor-container')) return;

        const container = document.createElement('div');
        container.id = 'iisu-cursor-container';
        container.innerHTML = `
            <div id="iisu-cursor-ring"></div>
            <div id="iisu-cursor-dot"></div>
            <div id="iisu-cursor-ripple"></div>
        `;
        document.body.appendChild(container);

        this.ring = document.getElementById('iisu-cursor-ring');
        this.dot = document.getElementById('iisu-cursor-dot');
        this.ripple = document.getElementById('iisu-cursor-ripple');

        // Apply cursor: none to body and interactive elements
        const style = document.createElement('style');
        style.innerHTML = `
            body, button, a, input, select, textarea, .n3ds-tile, .n3ds-touch-btn {
                cursor: none !important;
            }
            #iisu-cursor-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 99999;
                overflow: hidden;
            }
            #iisu-cursor-ring {
                position: absolute;
                width: 32px;
                height: 32px;
                border: 2px solid var(--primary, #ff4757);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 15px var(--primary-glow, rgba(255, 71, 87, 0.4)), inset 0 0 10px rgba(255,255,255,0.5);
                transition: width 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                            height 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
                            border-color 0.2s, background-color 0.2s;
                backdrop-filter: blur(2px);
                background-color: rgba(255, 255, 255, 0.15);
            }
            #iisu-cursor-dot {
                position: absolute;
                width: 7px;
                height: 7px;
                background-color: var(--primary, #ff4757);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                box-shadow: 0 0 8px #fff;
                transition: transform 0.15s, background-color 0.2s;
            }
            #iisu-cursor-ripple {
                position: absolute;
                width: 48px;
                height: 48px;
                border: 2px solid var(--secondary, #00d2d3);
                border-radius: 50%;
                transform: translate(-50%, -50%) scale(0);
                opacity: 0;
                pointer-events: none;
            }
            .iisu-hovering #iisu-cursor-ring {
                width: 52px;
                height: 52px;
                border-color: var(--secondary, #00d2d3);
                background-color: rgba(0, 210, 211, 0.12);
                box-shadow: 0 0 25px rgba(0, 210, 211, 0.5);
            }
            .iisu-hovering #iisu-cursor-dot {
                background-color: var(--secondary, #00d2d3);
                transform: translate(-50%, -50%) scale(1.4);
            }
            .iisu-active #iisu-cursor-ring {
                transform: translate(-50%, -50%) scale(0.85);
            }
            @keyframes iisu-pulse-anim {
                0% { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(2.2); opacity: 0; }
            }
            .iisu-pulsing {
                animation: iisu-pulse-anim 0.45s ease-out forwards;
            }
        `;
        document.head.appendChild(style);

        window.addEventListener('mousemove', (e) => {
            this.target.x = e.clientX;
            this.target.y = e.clientY;
            this.checkHover(e.target);
        });

        window.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            document.body.classList.add('iisu-active');
            this.triggerRipple(e.clientX, e.clientY);
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            document.body.classList.remove('iisu-active');
        });

        this.render();
    }

    checkHover(target) {
        if (!target) return;
        const interactive = target.closest('button, a, input, select, textarea, .n3ds-tile, .n3ds-touch-btn, .btn-3ds-play, .cartucho-item-puro');
        if (interactive) {
            if (!this.isHovered) {
                this.isHovered = true;
                document.body.classList.add('iisu-hovering');
            }
        } else {
            if (this.isHovered) {
                this.isHovered = false;
                document.body.classList.remove('iisu-hovering');
            }
        }
    }

    triggerRipple(x, y) {
        if (!this.ripple) return;
        this.ripple.style.left = `${x}px`;
        this.ripple.style.top = `${y}px`;
        this.ripple.classList.remove('iisu-pulsing');
        void this.ripple.offsetWidth; // Trigger reflow
        this.ripple.classList.add('iisu-pulsing');
    }

    render() {
        // Smooth lerp motion
        this.pos.x += (this.target.x - this.pos.x) * 0.3;
        this.pos.y += (this.target.y - this.pos.y) * 0.3;

        if (this.ring) {
            this.ring.style.left = `${this.pos.x}px`;
            this.ring.style.top = `${this.pos.y}px`;
        }
        if (this.dot) {
            this.dot.style.left = `${this.target.x}px`;
            this.dot.style.top = `${this.target.y}px`;
        }

        requestAnimationFrame(() => this.render());
    }
}

// Global Cursor Instance
window.IisuCursorInstance = new IisuCursorEngine();
