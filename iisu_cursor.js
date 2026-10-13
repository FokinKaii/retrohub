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
        if (!document.body) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.init(), { once: true });
            }
            return;
        }

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

        // Ensure standard system cursor is always visible and functional across the entire app
        const style = document.createElement('style');
        style.innerHTML = `
            html, body {
                cursor: default !important;
            }
            button, a, select, input[type="button"], input[type="submit"], [role="button"],
            .nintendo-tab-btn, .nintendo-avatar-thumb, .nintendo-emu-chip,
            .nintendo-btn-primary, .nintendo-btn-secondary, .nintendo-btn-text,
            .n3ds-tile, .n3ds-touch-btn, .user-profile-badge, .nav-btn, .clickable {
                cursor: pointer !important;
            }
            input[type="text"], input[type="email"], input[type="password"], textarea {
                cursor: text !important;
            }
            #iisu-cursor-container {
                display: none !important;
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
