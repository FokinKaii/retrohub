import os

html_code = """<!DOCTYPE html>
<html lang="es" data-theme="iisu_pearl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RetroHub • iiSU Windows Experience</title>
    <script src="coi-serviceworker.js"></script>
    <script src="https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js"></script>
    <script src="nintendo3ds_audio.js"></script>
    <script src="nintendo3ds_controls.js"></script>
    <script src="iisu_cursor.js"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&display=swap" rel="stylesheet">
    <style>
        /* ========================================================
           1. SISTEMA DE VARIABLES DE TEMA (4 PRESETS + BALANCEO AAA)
           ======================================================== */
        :root, [data-theme="iisu_pearl"] {
            --bg-color: #eef2f7;
            --card-bg: rgba(255, 255, 255, 0.88);
            --card-border: rgba(255, 255, 255, 0.95);
            --card-shadow: 0 16px 36px rgba(15, 23, 42, 0.08), 0 4px 12px rgba(15, 23, 42, 0.04);
            --primary: #ff4757;
            --primary-glow: rgba(255, 71, 87, 0.35);
            --secondary: #00d2d3;
            --secondary-glow: rgba(0, 210, 211, 0.35);
            --text-main: #0f172a;
            --text-muted: #475569;
            --radius-xl: 26px;
            --radius-lg: 18px;
            --radius-md: 14px;
            --glass-blur: 16px;
            --system-accent: #ff4757;
            --system-glow: rgba(255, 71, 87, 0.4);
            --system-secondary: #00d2d3;
            --hero-glass-bg: rgba(255, 255, 255, 0.85);
            --hero-glass-border: rgba(255, 255, 255, 0.95);
            --iisu-pill-bg: rgba(255, 255, 255, 0.92);
            --iisu-pill-border: rgba(15, 23, 42, 0.14);
            --iisu-hud-bg: rgba(255, 255, 255, 0.75);
            --iisu-hud-border: rgba(255, 255, 255, 0.9);
        }

        [data-theme="esde_dark"] {
            --bg-color: #0b0f19;
            --card-bg: rgba(24, 33, 53, 0.88);
            --card-border: rgba(51, 65, 85, 0.8);
            --card-shadow: 0 20px 40px rgba(0, 0, 0, 0.55);
            --primary: #38bdf8;
            --primary-glow: rgba(56, 189, 248, 0.35);
            --secondary: #818cf8;
            --secondary-glow: rgba(129, 140, 248, 0.35);
            --text-main: #f8fafc;
            --text-muted: #94a3b8;
            --system-accent: #38bdf8;
            --system-glow: rgba(56, 189, 248, 0.45);
            --system-secondary: #818cf8;
            --hero-glass-bg: rgba(15, 23, 42, 0.82);
            --hero-glass-border: rgba(255, 255, 255, 0.16);
            --iisu-pill-bg: rgba(30, 41, 59, 0.92);
            --iisu-pill-border: rgba(255, 255, 255, 0.18);
            --iisu-hud-bg: rgba(15, 23, 42, 0.82);
            --iisu-hud-border: rgba(255, 255, 255, 0.15);
        }

        [data-theme="cyberia_y2k"] {
            --bg-color: #0d0221;
            --card-bg: rgba(26, 11, 46, 0.88);
            --card-border: rgba(138, 43, 226, 0.65);
            --card-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 30px rgba(138, 43, 226, 0.25);
            --primary: #00f0ff;
            --primary-glow: rgba(0, 240, 255, 0.45);
            --secondary: #ff007f;
            --secondary-glow: rgba(255, 0, 127, 0.45);
            --text-main: #ffffff;
            --text-muted: #c4b5fd;
            --system-accent: #00f0ff;
            --system-glow: rgba(0, 240, 255, 0.5);
            --system-secondary: #ff007f;
            --hero-glass-bg: rgba(20, 10, 40, 0.85);
            --hero-glass-border: rgba(0, 240, 255, 0.35);
            --iisu-pill-bg: rgba(45, 15, 75, 0.92);
            --iisu-pill-border: rgba(0, 240, 255, 0.35);
            --iisu-hud-bg: rgba(26, 11, 46, 0.85);
            --iisu-hud-border: rgba(138, 43, 226, 0.4);
        }

        [data-theme="frutiger_aero"] {
            --bg-color: #dff6ff;
            --card-bg: rgba(255, 255, 255, 0.88);
            --card-border: rgba(130, 220, 255, 0.85);
            --card-shadow: 0 18px 40px rgba(10, 90, 150, 0.12), 0 4px 14px rgba(10, 90, 150, 0.06);
            --primary: #0984e3;
            --primary-glow: rgba(9, 132, 227, 0.35);
            --secondary: #00cec9;
            --secondary-glow: rgba(0, 206, 201, 0.35);
            --text-main: #132743;
            --text-muted: #4b6584;
            --system-accent: #0984e3;
            --system-glow: rgba(9, 132, 227, 0.4);
            --system-secondary: #00cec9;
            --hero-glass-bg: rgba(255, 255, 255, 0.85);
            --hero-glass-border: rgba(255, 255, 255, 0.95);
            --iisu-pill-bg: rgba(255, 255, 255, 0.95);
            --iisu-pill-border: rgba(9, 132, 227, 0.25);
            --iisu-hud-bg: rgba(255, 255, 255, 0.82);
            --iisu-hud-border: rgba(130, 220, 255, 0.7);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Outfit', system-ui, -apple-system, sans-serif;
            user-select: none;
            -webkit-user-drag: none;
        }

        body {
            min-height: 100vh;
            background-color: transparent;
            color: var(--text-main);
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            transition: color 0.3s ease;
            position: relative;
        }

        /* --- 2. FONDOS DINÁMICOS CON CROSSFADE SUAVE --- */
        .bg-crossfade-stage {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -3;
            overflow: hidden;
            background-color: var(--bg-color);
            transition: background-color 0.6s ease;
        }

        .bg-layer {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            opacity: 0;
            transform: scale(1.04);
            transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            filter: blur(var(--glass-blur)) brightness(0.85) saturate(1.15);
        }

        .bg-layer.active {
            opacity: 0.65;
            transform: scale(1);
        }

        .bg-vignette-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -2;
            background: radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.45) 100%),
                        linear-gradient(to bottom, rgba(0, 0, 0, 0.15) 0%, transparent 20%, transparent 80%, rgba(0, 0, 0, 0.35) 100%);
            pointer-events: none;
        }

        /* CRT SCANLINES OVERLAY (OPCIONAL DESDE ESTUDIO) */
        .crt-scanlines-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: 99998;
            pointer-events: none;
            display: none;
            background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.32) 50%);
            background-size: 100% 4px;
            opacity: 0.55;
        }
        .crt-scanlines-overlay.active {
            display: block;
        }

        /* --- 3. BARRA SUPERIOR: BLINKIES & NAVBAR --- */
        .top-zone {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            background: var(--iisu-hud-bg);
            backdrop-filter: blur(var(--glass-blur));
            border-bottom: 1px solid var(--iisu-hud-border);
            position: sticky;
            top: 0;
            z-index: 1000;
            transition: all 0.3s ease;
        }

        .blinkies-bar {
            width: 100%;
            height: 36px;
            background: rgba(15, 23, 42, 0.92);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            gap: 14px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .blinkies-container {
            display: flex;
            align-items: center;
            gap: 10px;
            overflow-x: auto;
            scrollbar-width: none;
        }
        .blinkies-container::-webkit-scrollbar { display: none; }

        .blinky-badge {
            height: 22px;
            border-radius: 3px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.35);
            transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            cursor: pointer;
            object-fit: contain;
        }
        .blinky-badge:hover {
            transform: scale(1.15) translateY(-1px);
        }

        .add-blinky-btn {
            background: rgba(255, 255, 255, 0.16);
            color: #fff;
            border: 1px dashed rgba(255, 255, 255, 0.45);
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s ease;
        }
        .add-blinky-btn:hover {
            background: var(--primary);
            border-color: transparent;
        }

        .iisu-navbar {
            width: 100%;
            max-width: 1380px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
        }

        .brand-logo {
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 800;
            font-size: 20px;
            letter-spacing: -0.5px;
            color: var(--text-main);
            text-decoration: none;
            cursor: pointer;
        }

        .brand-badge {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 9px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            box-shadow: 0 4px 12px var(--primary-glow);
        }

        .nav-tabs {
            display: flex;
            align-items: center;
            gap: 6px;
            background: var(--iisu-pill-bg);
            padding: 4px;
            border-radius: 40px;
            border: 1px solid var(--iisu-pill-border);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
        }

        .nav-tab-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 7px 16px;
            border-radius: 30px;
            border: none;
            background: transparent;
            color: var(--text-muted);
            font-weight: 600;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .nav-tab-btn:hover {
            color: var(--text-main);
            background: rgba(255, 255, 255, 0.85);
        }
        .nav-tab-btn.active {
            background: var(--card-bg);
            color: var(--primary);
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
            transform: scale(1.02);
            font-weight: 700;
        }

        .user-quick-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            background: var(--iisu-pill-bg);
            padding: 4px 14px 4px 6px;
            border-radius: 30px;
            border: 1px solid var(--iisu-pill-border);
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .user-quick-profile:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
        }

        .avatar-img-small {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            object-fit: cover;
            border: 2px solid var(--primary);
        }

        .username-small {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
        }

        .sys-clock-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            padding: 5px 14px;
            border-radius: 20px;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.5px;
            color: var(--text-main);
        }

        .btn-theme-studio-toggle {
            background: linear-gradient(135deg, var(--secondary), var(--primary));
            color: white;
            border: none;
            padding: 7px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 12px var(--primary-glow);
            transition: all 0.2s ease;
        }
        .btn-theme-studio-toggle:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 18px var(--primary-glow);
        }

        /* --- 4. CONTENEDOR PRINCIPAL Y TABS --- */
        .main-container {
            width: 100%;
            max-width: 1380px;
            margin: 0 auto;
            padding: 24px;
            flex: 1;
            display: flex;
            flex-direction: column;
            position: relative;
        }

        .tab-content {
            display: none;
            width: 100%;
            flex-direction: column;
            gap: 24px;
            animation: fadeInTab 0.3s ease forwards;
        }
        .tab-content.active {
            display: flex;
        }

        @keyframes fadeInTab {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        /* ========================================================
           5. PASO 1: SELECTOR DE EMULADORES / CONSOLAS (HERO + RIBBON)
           ======================================================== */
        #view-systems {
            display: flex;
            flex-direction: column;
            gap: 26px;
            width: 100%;
        }

        .hero-showcase-container {
            width: 100%;
            min-height: 380px;
            background: var(--hero-glass-bg);
            border: 1px solid var(--hero-glass-border);
            border-radius: var(--radius-xl);
            box-shadow: var(--card-shadow);
            backdrop-filter: blur(var(--glass-blur));
            position: relative;
            display: flex;
            align-items: center;
            padding: 36px 44px;
            gap: 40px;
            overflow: visible;
            transition: all 0.3s ease;
        }

        .hero-ambient-glow {
            position: absolute;
            top: 50%;
            left: 20%;
            width: 320px;
            height: 320px;
            background: radial-gradient(circle, var(--system-glow) 0%, transparent 70%);
            transform: translate(-50%, -50%);
            pointer-events: none;
            opacity: 0.65;
            transition: background 0.5s ease;
        }

        .hero-hardware-anchor {
            flex: 0 0 380px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            z-index: 5;
        }

        .hero-hardware-img {
            max-width: 100%;
            max-height: 290px;
            object-fit: contain;
            filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.45));
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: hardwareBreathe 6s ease-in-out infinite;
        }
        .hero-hardware-img:hover {
            transform: scale(1.06) rotate(-2deg);
        }

        @keyframes hardwareBreathe {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-8px) rotate(1deg); }
        }

        .hardware-pop-in {
            animation: hardwarePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes hardwarePop {
            0% { opacity: 0; transform: scale(0.85) translateY(20px); }
            100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .hero-content-wrapper {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 16px;
            z-index: 6;
        }

        .hero-tag-row {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
        }

        .hero-system-badge {
            background: var(--system-accent);
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            padding: 5px 14px;
            border-radius: 20px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            box-shadow: 0 4px 14px var(--system-glow);
        }

        .hero-library-badge {
            background: rgba(0, 210, 211, 0.15);
            color: var(--secondary);
            border: 1px solid var(--secondary);
            font-size: 11px;
            font-weight: 800;
            padding: 4px 12px;
            border-radius: 20px;
            letter-spacing: 0.5px;
        }

        .hero-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 42px;
            font-weight: 800;
            line-height: 1.1;
            letter-spacing: -1px;
            color: var(--text-main);
        }

        .hero-metadata-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .meta-pill {
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            padding: 6px 14px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        }
        .meta-label {
            font-size: 11px;
            font-weight: 800;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .meta-value {
            font-size: 12px;
            font-weight: 700;
            color: var(--text-main);
        }

        .hero-desc {
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-muted);
            max-width: 680px;
        }

        .hero-actions {
            display: flex;
            align-items: center;
            gap: 16px;
            margin-top: 6px;
            flex-wrap: wrap;
        }

        .btn-enter-games {
            background: linear-gradient(135deg, var(--system-accent), var(--system-secondary));
            color: white;
            border: none;
            padding: 14px 34px;
            border-radius: var(--radius-lg);
            font-size: 15px;
            font-weight: 800;
            font-family: 'Space Grotesk', sans-serif;
            letter-spacing: 0.5px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            box-shadow: 0 8px 24px var(--system-glow);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .btn-enter-games:hover {
            transform: translateY(-3px) scale(1.02);
            box-shadow: 0 12px 30px var(--system-glow);
        }

        .btn-hero-favorite {
            background: var(--iisu-pill-bg);
            color: var(--text-main);
            border: 1px solid var(--iisu-pill-border);
            padding: 13px 22px;
            border-radius: var(--radius-lg);
            font-size: 14px;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.25s ease;
        }
        .btn-hero-favorite:hover {
            background: rgba(255, 255, 255, 0.95);
            transform: translateY(-2px);
        }
        .btn-hero-favorite.active {
            border-color: #f1c40f;
            color: #d4ac0d;
            background: rgba(241, 196, 15, 0.12);
        }

        /* CONSOLE RIBBON & GRID */
        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 8px;
        }

        .section-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 22px;
            font-weight: 800;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .console-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
            gap: 18px;
            width: 100%;
        }

        .console-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-lg);
            padding: 16px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            cursor: pointer;
            backdrop-filter: blur(var(--glass-blur));
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            position: relative;
            overflow: hidden;
        }
        .console-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--console-color, var(--primary));
            opacity: 0;
            transition: opacity 0.2s ease;
        }
        .console-card:hover {
            transform: translateY(-6px) scale(1.03);
            border-color: var(--console-color, var(--primary));
            box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12), 0 0 16px var(--console-glow, rgba(0,0,0,0.1));
        }
        .console-card.active {
            border-color: var(--console-color, var(--primary));
            background: rgba(255, 255, 255, 0.95);
            box-shadow: 0 12px 30px var(--console-glow, var(--primary-glow));
            transform: translateY(-4px);
        }
        [data-theme="esde_dark"] .console-card.active {
            background: rgba(30, 41, 59, 0.95);
        }
        .console-card.active::before {
            opacity: 1;
        }

        .card-img-wrap {
            width: 100%;
            height: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
        }

        .card-console-img {
            max-width: 85%;
            max-height: 85px;
            object-fit: contain;
            filter: drop-shadow(0 8px 12px rgba(0,0,0,0.25));
            transition: transform 0.3s ease;
        }
        .console-card:hover .card-console-img {
            transform: scale(1.1);
        }

        .console-name {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 4px;
        }

        .console-sub {
            font-size: 11px;
            color: var(--text-muted);
            font-weight: 500;
        }

        .console-badge-count {
            display: inline-block;
            margin-top: 8px;
            padding: 2px 8px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
            font-size: 10px;
            font-weight: 700;
            color: var(--text-muted);
        }
        .console-card.active .console-badge-count {
            background: var(--console-color, var(--primary));
            color: white;
        }

        /* ========================================================
           6. PASO 2: LA EXPERIENCIA IISU WINDOWS DE JUEGOS (EL VIDEO)
           ======================================================== */
        #view-games {
            display: none;
            flex-direction: column;
            gap: 20px;
            width: 100%;
            animation: fadeInTab 0.35s ease forwards;
        }

        /* Barra Superior del Catálogo iiSU con Botón Volver */
        .iisu-gameview-topbar {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--hero-glass-bg);
            border: 1px solid var(--hero-glass-border);
            border-radius: var(--radius-lg);
            padding: 12px 24px;
            backdrop-filter: blur(var(--glass-blur));
            box-shadow: var(--card-shadow);
        }

        .btn-back-to-systems {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            padding: 8px 18px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 800;
            color: var(--text-main);
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .btn-back-to-systems:hover {
            transform: translateX(-4px);
            background: var(--primary);
            color: white;
            border-color: transparent;
        }

        .gameview-system-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 18px;
            font-weight: 800;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .gameview-counter-badge {
            background: var(--system-accent);
            color: white;
            font-size: 11px;
            font-weight: 800;
            padding: 3px 10px;
            border-radius: 20px;
        }

        /* ESCENARIO PRINCIPAL IISU (4 COLUMNAS SEGÚN EL VIDEO REDDIT) */
        .iisu-stage-layout {
            display: grid;
            grid-template-columns: 140px 240px 1fr 280px;
            gap: 24px;
            width: 100%;
            min-height: 520px;
            align-items: center;
            background: var(--hero-glass-bg);
            border: 1px solid var(--hero-glass-border);
            border-radius: var(--radius-xl);
            padding: 30px;
            box-shadow: var(--card-shadow);
            backdrop-filter: blur(var(--glass-blur));
            position: relative;
            overflow: hidden;
        }

        /* Columna 1: Tarjeta de la Consola con Flecha Selectora (Estilo Steam/iiSU) */
        .iisu-system-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            position: relative;
        }

        .iisu-system-squircle {
            width: 115px;
            height: 115px;
            background: var(--iisu-pill-bg);
            border: 2px solid var(--system-accent);
            border-radius: 28px;
            box-shadow: 0 10px 25px var(--system-glow);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 12px;
            position: relative;
            transition: all 0.3s ease;
        }
        .iisu-system-squircle img {
            max-width: 90%;
            max-height: 75px;
            object-fit: contain;
            filter: drop-shadow(0 6px 12px rgba(0,0,0,0.3));
        }

        .iisu-system-arrow-indicator {
            position: absolute;
            right: -20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 20px;
            color: var(--system-accent);
            animation: arrowPulse 1.5s infinite;
        }
        @keyframes arrowPulse {
            0%, 100% { transform: translateY(-50%) translateX(0); }
            50% { transform: translateY(-50%) translateX(6px); }
        }

        /* Columna 2: Carrusel Vertical de Carátulas (Vertical Cover Stack) */
        .iisu-covers-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 18px;
            height: 480px;
            overflow-y: auto;
            padding: 20px 10px;
            scrollbar-width: none;
            position: relative;
        }
        .iisu-covers-column::-webkit-scrollbar { display: none; }

        .iisu-game-tile {
            width: 180px;
            height: 180px;
            border-radius: var(--radius-lg);
            overflow: hidden;
            position: relative;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.4);
            transform: scale(0.88);
            opacity: 0.65;
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            background: #000;
            flex-shrink: 0;
        }
        .iisu-game-tile:hover {
            opacity: 0.9;
            transform: scale(0.95);
        }
        .iisu-game-tile.active {
            transform: scale(1.12);
            opacity: 1;
            border-color: var(--system-accent);
            box-shadow: 0 16px 36px rgba(0, 0, 0, 0.3), 0 0 25px var(--system-glow);
            z-index: 10;
        }

        .iisu-game-tile-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
        }

        .iisu-tile-platform-badge {
            position: absolute;
            top: 8px;
            left: 8px;
            background: rgba(15, 23, 42, 0.82);
            backdrop-filter: blur(8px);
            color: white;
            font-size: 9px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 6px;
            text-transform: uppercase;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        /* Columna 3: Información y Metadatos Exactos del Video */
        .iisu-details-column {
            display: flex;
            flex-direction: column;
            gap: 18px;
            padding: 0 10px;
        }

        .iisu-game-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 38px;
            font-weight: 800;
            line-height: 1.15;
            letter-spacing: -0.5px;
            color: var(--text-main);
        }

        /* Pastillas de Metadatos con el estilo exacto de la captura */
        .iisu-pills-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            max-width: 360px;
        }

        .iisu-meta-pill-bar {
            display: flex;
            align-items: center;
            background: var(--iisu-pill-bg);
            border: 1.5px solid var(--iisu-pill-border);
            border-radius: 30px;
            padding: 5px 14px;
            gap: 12px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.03);
        }
        .iisu-meta-icon {
            font-size: 14px;
            color: var(--system-accent);
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
        }
        .iisu-meta-text {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
            letter-spacing: 0.2px;
        }

        .iisu-game-desc {
            font-size: 14px;
            line-height: 1.6;
            color: var(--text-muted);
            max-width: 540px;
            margin-top: 4px;
        }

        .iisu-action-row {
            display: flex;
            align-items: center;
            gap: 14px;
            margin-top: 8px;
            flex-wrap: wrap;
        }

        .btn-iisu-play {
            background: linear-gradient(135deg, var(--system-accent), var(--system-secondary));
            color: white;
            border: none;
            padding: 14px 34px;
            border-radius: var(--radius-lg);
            font-size: 15px;
            font-weight: 800;
            font-family: 'Space Grotesk', sans-serif;
            letter-spacing: 0.5px;
            display: inline-flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
            box-shadow: 0 8px 24px var(--system-glow);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .btn-iisu-play:hover {
            transform: scale(1.04) translateY(-2px);
            box-shadow: 0 14px 32px var(--system-glow);
        }

        .btn-iisu-secondary {
            background: var(--iisu-pill-bg);
            color: var(--text-main);
            border: 1px solid var(--iisu-pill-border);
            padding: 13px 20px;
            border-radius: var(--radius-lg);
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s ease;
        }
        .btn-iisu-secondary:hover {
            background: rgba(255, 255, 255, 0.95);
            transform: translateY(-2px);
        }

        /* Columna 4: Vitrina del Cartucho 3D / Media Box */
        .iisu-media-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 10px;
            position: relative;
        }

        .iisu-cartridge-stage {
            width: 100%;
            height: 320px;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            perspective: 800px;
        }

        .iisu-cartridge-img {
            max-width: 95%;
            max-height: 260px;
            object-fit: contain;
            filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.5));
            transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: cartHover 5s ease-in-out infinite;
        }
        .iisu-cartridge-img:hover {
            transform: scale(1.08) rotate(3deg);
        }

        @keyframes cartHover {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(-2deg); }
        }

        /* Barra Inferior con Prompts de Mando estilo Consola */
        .iisu-controller-bar {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--hero-glass-bg);
            border: 1px solid var(--hero-glass-border);
            border-radius: var(--radius-lg);
            padding: 12px 24px;
            backdrop-filter: blur(var(--glass-blur));
            box-shadow: var(--card-shadow);
        }

        .controller-hints-left {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .controller-hints-right {
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .btn-prompt-pill {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            padding: 6px 14px;
            border-radius: 20px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .btn-prompt-pill:hover {
            background: var(--system-accent);
            color: white;
            border-color: transparent;
        }

        .btn-key-icon {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--system-accent);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 800;
        }
        .btn-prompt-pill:hover .btn-key-icon {
            background: white;
            color: var(--system-accent);
        }

        /* ========================================================
           7. REPRODUCTOR EMULATORJS IN-APP MODAL A PANTALLA COMPLETA
           ======================================================== */
        .game-player-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #000000;
            z-index: 999999;
            display: none;
            flex-direction: column;
            animation: fadeInTab 0.3s ease forwards;
        }

        .player-top-hud {
            width: 100%;
            height: 52px;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.15);
            z-index: 10;
        }

        .player-game-info {
            display: flex;
            align-items: center;
            gap: 12px;
            color: white;
            font-size: 14px;
            font-weight: 700;
        }

        .player-badge-core {
            background: var(--primary);
            color: white;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 800;
        }

        .player-hud-actions {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .btn-exit-player {
            background: #e74c3c;
            color: white;
            border: none;
            padding: 6px 16px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 800;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
        }
        .btn-exit-player:hover {
            background: #c0392b;
            transform: scale(1.04);
        }

        .emulator-iframe-wrap {
            flex: 1;
            width: 100%;
            height: calc(100vh - 52px);
            position: relative;
            background: #000;
        }

        .emulator-iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
        }

        /* ========================================================
           8. CAJÓN DE PERSONALIZACIÓN Y ESTUDIO DE TEMAS FLOTANTE
           ======================================================== */
        .personalization-drawer {
            position: fixed;
            top: 0;
            right: -420px;
            width: 400px;
            height: 100vh;
            background: var(--card-bg);
            border-left: 1px solid var(--card-border);
            backdrop-filter: blur(28px);
            box-shadow: -15px 0 40px rgba(0, 0, 0, 0.25);
            z-index: 99999;
            padding: 30px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            transition: right 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            overflow-y: auto;
        }
        .personalization-drawer.open {
            right: 0;
        }

        .drawer-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 16px;
            border-bottom: 1px solid var(--card-border);
        }
        .drawer-title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 20px;
            font-weight: 800;
            color: var(--text-main);
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .drawer-close-btn {
            background: none;
            border: none;
            font-size: 22px;
            color: var(--text-muted);
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        .drawer-close-btn:hover {
            transform: scale(1.2);
            color: var(--text-main);
        }

        .drawer-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .drawer-section-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: var(--text-muted);
        }

        .theme-preset-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .theme-preset-btn {
            padding: 12px 14px;
            border-radius: var(--radius-md);
            border: 2px solid var(--card-border);
            background: var(--iisu-pill-bg);
            color: var(--text-main);
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 4px;
            transition: all 0.2s ease;
        }
        .theme-preset-btn:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
        }
        .theme-preset-btn.active {
            border-color: var(--primary);
            background: var(--primary);
            color: white;
            box-shadow: 0 4px 12px var(--primary-glow);
        }

        .slider-control-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .slider-label-row {
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
        }
        .slider-range-input {
            width: 100%;
            accent-color: var(--primary);
            height: 6px;
            border-radius: 4px;
            cursor: pointer;
        }

        .toggle-switch-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            padding: 12px 16px;
            border-radius: var(--radius-md);
        }
        .toggle-switch-label {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
        }
        .toggle-checkbox {
            width: 20px;
            height: 20px;
            accent-color: var(--primary);
            cursor: pointer;
        }

        /* ========================================================
           9. PERFIL DE USUARIO Y CROPPING CANVAS
           ======================================================== */
        .profile-editor-modal {
            width: 100%;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-xl);
            box-shadow: var(--card-shadow);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            backdrop-filter: blur(var(--glass-blur));
        }

        .banner-container {
            width: 100%;
            height: 240px;
            background: linear-gradient(135deg, #1e293b, #0f172a);
            position: relative;
            overflow: hidden;
        }
        .banner-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .banner-overlay-gradient {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 70%;
            background: linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0) 100%);
            pointer-events: none;
        }
        .banner-upload-badge {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(12px);
            color: white;
            padding: 8px 18px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 700;
            cursor: pointer;
            border: 1px solid rgba(255, 255, 255, 0.25);
            transition: all 0.2s ease;
            z-index: 10;
        }
        .banner-upload-badge:hover {
            background: var(--primary);
            transform: scale(1.04);
        }

        .profile-identity-bar {
            padding: 0 40px;
            display: flex;
            align-items: flex-end;
            gap: 24px;
            margin-top: -65px;
            position: relative;
            z-index: 20;
        }

        .avatar-wrapper {
            width: 130px;
            height: 130px;
            border-radius: 50%;
            border: 5px solid #ffffff;
            box-shadow: 0 12px 32px rgba(0,0,0,0.22);
            position: relative;
            overflow: hidden;
            background: #ffffff;
            cursor: pointer;
            flex-shrink: 0;
        }
        .avatar-img-circle {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .avatar-fallback-initials {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            font-weight: 800;
            color: white;
            background: linear-gradient(135deg, var(--primary), var(--secondary));
        }
        .avatar-hover-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(15, 23, 42, 0.7);
            backdrop-filter: blur(4px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 6px;
            color: white;
            font-size: 11px;
            font-weight: 700;
            opacity: 0;
            transition: opacity 0.25s ease;
        }
        .avatar-wrapper:hover .avatar-hover-overlay {
            opacity: 1;
        }

        .preview-display-name {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            font-weight: 800;
            color: var(--text-main);
        }
        .preview-handle {
            font-size: 15px;
            color: var(--text-muted);
            font-weight: 600;
        }

        .editor-grid {
            padding: 30px 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 36px;
        }
        .section-subtitle {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 18px;
            font-weight: 700;
            color: var(--text-main);
            margin-bottom: 16px;
        }
        .input-field-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 18px;
        }
        .input-field-group label {
            font-size: 13px;
            font-weight: 700;
            color: var(--text-main);
        }
        .input-field-group input, .input-field-group textarea {
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            border-radius: 12px;
            padding: 12px 16px;
            color: var(--text-main);
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s ease;
        }
        .input-field-group input:focus, .input-field-group textarea:focus {
            border-color: var(--primary);
        }
        .handle-input-box {
            display: flex;
            align-items: center;
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            border-radius: 12px;
            padding-left: 14px;
        }
        .handle-input-box input {
            border: none;
            background: transparent;
            width: 100%;
        }

        /* 5 Slots de Vitrina */
        .favorites-showcase {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            margin-top: 14px;
        }
        .showcase-slot {
            aspect-ratio: 3/4;
            background: var(--iisu-pill-bg);
            border: 2px dashed var(--iisu-pill-border);
            border-radius: 14px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .showcase-slot:hover {
            border-color: var(--primary);
            transform: translateY(-2px);
        }
        .slot-cover-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .slot-remove-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            background: rgba(231, 76, 60, 0.85);
            color: white;
            border: none;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            font-size: 11px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .editor-footer-actions {
            padding: 20px 40px;
            border-top: 1px solid var(--card-border);
            display: flex;
            justify-content: flex-end;
            gap: 14px;
        }
        .btn-cancel {
            background: var(--iisu-pill-bg);
            border: 1px solid var(--iisu-pill-border);
            color: var(--text-main);
            padding: 12px 24px;
            border-radius: 14px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
        }
        .btn-save {
            background: var(--primary);
            color: white;
            border: none;
            padding: 12px 28px;
            border-radius: 14px;
            font-weight: 800;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 6px 18px var(--primary-glow);
            transition: all 0.2s ease;
        }
        .btn-save:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 24px var(--primary-glow);
        }

        /* CROP MODAL OVERLAY */
        .crop-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            z-index: 999999;
            display: none;
            align-items: center;
            justify-content: center;
        }
        .crop-modal-card {
            background: var(--card-bg);
            width: 90%;
            max-width: 620px;
            border-radius: 24px;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 18px;
            box-shadow: 0 24px 60px rgba(0,0,0,0.4);
            border: 1px solid var(--card-border);
        }
        .crop-header { display: flex; justify-content: space-between; align-items: center; }
        .crop-canvas-wrapper {
            width: 100%;
            height: 330px;
            background: #0f172a;
            border-radius: 16px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .crop-controls { display: flex; align-items: center; gap: 14px; font-weight: 700; font-size: 13px; }
        .crop-controls input[type="range"] { flex: 1; }
        .crop-footer { display: flex; justify-content: flex-end; gap: 12px; }

        /* --- 10. RED DE AMIGOS P2P --- */
        .friends-container {
            display: grid;
            grid-template-columns: 320px 1fr;
            gap: 24px;
            height: 520px;
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: var(--radius-xl);
            padding: 24px;
            box-shadow: var(--card-shadow);
            backdrop-filter: blur(var(--glass-blur));
        }
        .friends-sidebar {
            display: flex;
            flex-direction: column;
            gap: 14px;
            border-right: 1px solid var(--card-border);
            padding-right: 20px;
        }
        .chat-main {
            display: flex;
            flex-direction: column;
            height: 100%;
        }
    </style>
</head>
<body>

    <!-- FONDO DINÁMICO CROSSFADE & VIGNETTE -->
    <div class="bg-crossfade-stage" id="bgCrossfadeStage">
        <div class="bg-layer active" id="bgLayerA"></div>
        <div class="bg-layer" id="bgLayerB"></div>
    </div>
    <div class="bg-vignette-overlay" id="bgVignette"></div>
    <div class="crt-scanlines-overlay" id="crtOverlay"></div>

    <!-- ZONA SUPERIOR: BLINKIES & NAVBAR CON PERFIL Y RELOJ -->
    <header class="top-zone">
        <!-- BARRA DE BLINKIES PIXEL GIF -->
        <div class="blinkies-bar">
            <div class="blinkies-container" id="blinkiesContainer">
                <img src="https://cyber.dabamos.de/blinkies/retro.gif" class="blinky-badge" title="Retro Gamer" onerror="this.src='https://web.archive.org/web/20091027063618/http://geocities.com/petsburgh/zoo/1879/blinkie.gif'">
                <img src="https://cyber.dabamos.de/blinkies/nintendo.gif" class="blinky-badge" title="Nintendo Fan" onerror="this.style.display='none'">
                <img src="https://cyber.dabamos.de/blinkies/gamer.gif" class="blinky-badge" title="Pro Gamer" onerror="this.style.display='none'">
                <img src="https://cyber.dabamos.de/blinkies/music.gif" class="blinky-badge" title="Music Lover" onerror="this.style.display='none'">
            </div>
            <button class="add-blinky-btn" onclick="addNewBlinky()">+ Añadir Blinky GIF</button>
        </div>

        <!-- NAVBAR II SU -->
        <nav class="iisu-navbar">
            <a class="brand-logo" onclick="goToSystemsView()">
                <span>🎮</span> RETROHUB <span class="brand-badge">iiSU EXPERIENCE</span>
            </a>

            <!-- Pestañas de Navegación -->
            <div class="nav-tabs">
                <button class="nav-tab-btn active" id="tab-btn-emulators" onclick="switchTab('emulators')">
                    <span>🎮</span> Emuladores
                </button>
                <button class="nav-tab-btn" id="tab-btn-profile" onclick="switchTab('profile')">
                    <span>👤</span> Mi Perfil
                </button>
                <button class="nav-tab-btn" id="tab-btn-friends" onclick="switchTab('friends')">
                    <span>🤝</span> Amigos P2P
                </button>
                <button class="nav-tab-btn" id="tab-btn-settings" onclick="switchTab('settings')">
                    <span>⚙️</span> Ajustes
                </button>
            </div>

            <!-- Botón de Personalización, Perfil Rápido y Reloj -->
            <div style="display: flex; align-items: center; gap: 14px;">
                <button class="btn-theme-studio-toggle" onclick="togglePersonalizationDrawer()">
                    <span>🎨</span> Personalizar
                </button>

                <div class="user-quick-profile" onclick="switchTab('profile')">
                    <img id="headerAvatar" src="https://api.dicebear.com/7.x/bottts/svg?seed=SaraHimawari" class="avatar-img-small" alt="Avatar">
                    <span id="headerUsername" class="username-small">Sara</span>
                </div>

                <div class="sys-clock-pill" id="liveClock">
                    <span>🕒</span> <span id="clockTimeText">13:06</span>
                </div>
            </div>
        </nav>
    </header>

    <!-- CONTENIDO PRINCIPAL -->
    <main class="main-container">

        <!-- ========================================================
             TAB 1: ZONA DE EMULADORES Y JUEGOS (2 SUB-VISTAS FLUIDAS)
             ======================================================== -->
        <section class="tab-content active" id="tab-emulators">

            <!-- SUB-VISTA 1: SELECTOR DE EMULADORES / CONSOLAS (PASO 1) -->
            <div id="view-systems">
                <!-- HERO SHOWCASE CON HARDWARE REAL -->
                <div class="hero-showcase-container" id="heroShowcase">
                    <div class="hero-ambient-glow" id="heroAmbientGlow"></div>

                    <!-- FOTO DE HARDWARE 3D PROTAGONISTA -->
                    <div class="hero-hardware-anchor">
                        <img id="stageRealImg" src="assets/consoles/n64.png" class="hero-hardware-img hardware-pop-in" alt="Consola">
                    </div>

                    <!-- METADATOS Y ACCIONES -->
                    <div class="hero-content-wrapper">
                        <div class="hero-tag-row">
                            <span class="hero-system-badge" id="stageTag">EMULADOR SELECCIONADO</span>
                            <span class="hero-library-badge" id="heroBadgeLibrary">⚡ EMULACIÓN NATIVA 60 FPS</span>
                        </div>

                        <h1 class="hero-title" id="stageHeader">Nintendo 64</h1>

                        <div class="hero-metadata-badges" id="heroMetadata">
                            <div class="meta-pill">
                                <span class="meta-label">📅 LANZAMIENTO</span>
                                <span class="meta-value" id="metaYear">1996</span>
                            </div>
                            <div class="meta-pill">
                                <span class="meta-label">🏢 FABRICANTE</span>
                                <span class="meta-value" id="metaMaker">Nintendo</span>
                            </div>
                            <div class="meta-pill">
                                <span class="meta-label">⚡ ARQUITECTURA</span>
                                <span class="meta-value" id="metaArch">64-Bit MIPS VR4300</span>
                            </div>
                            <div class="meta-pill">
                                <span class="meta-label">📚 BIBLIOTECA</span>
                                <span class="meta-value" id="metaGames">1 Juego Instalado</span>
                            </div>
                            <div class="meta-pill">
                                <span class="meta-label">🎮 MANDOS</span>
                                <span class="meta-value" id="metaControllers">4 Puertos</span>
                            </div>
                        </div>

                        <p class="hero-desc" id="stageDesc">
                            La legendaria consola de 64 bits de Nintendo que revolucionó los mundos 3D con Super Mario 64, The Legend of Zelda: Ocarina of Time y Paper Mario.
                        </p>

                        <div class="hero-actions">
                            <button class="btn-enter-games" onclick="enterGamesView()" id="btnHeroEnter">
                                <span>▶</span>
                                <span>ABRIR CATÁLOGO DE JUEGOS (A)</span>
                            </button>
                            <button class="btn-hero-favorite" onclick="toggleFavoriteCurrent()" id="btnHeroFavorite">
                                <span id="favStarIcon">⭐</span>
                                <span id="favStarText">Añadir a Favoritos</span>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- SELECTOR DE CONSOLAS CON HARDWARE REAL (14 CONSOLAS) -->
                <div class="section-header">
                    <h2 class="section-title">
                        <span>🕹️</span> Elige tu Emulador / Consola
                    </h2>
                    <span style="font-size: 13px; color: var(--text-muted); font-weight: 600;">Pulsa una consola o usa las flechas [ ◄ ► ] y pulsa ENTER</span>
                </div>

                <div class="console-grid" id="consoleGrid">
                    <!-- Generado dinámicamente -->
                </div>
            </div>

            <!-- SUB-VISTA 2: LA EXPERIENCIA IISU WINDOWS DE JUEGOS (PASO 2 - EXACTO AL VIDEO) -->
            <div id="view-games">
                <!-- BARRA SUPERIOR DE NAVEGACIÓN DENTRO DEL EMULADOR -->
                <div class="iisu-gameview-topbar">
                    <button class="btn-back-to-systems" onclick="goToSystemsView()">
                        <span>Ⓑ</span> <span>← Volver a Consolas (ESC)</span>
                    </button>

                    <div class="gameview-system-title">
                        <span id="gameviewConsoleLogo">🎮</span>
                        <span id="gameviewConsoleName">Nintendo 64</span>
                        <span class="gameview-counter-badge" id="gameviewGamesCount">1 Juego</span>
                    </div>

                    <div class="sys-clock-pill">
                        <span>🕒</span> <span id="gameviewClockText">13:06</span>
                    </div>
                </div>

                <!-- ESCENARIO PRINCIPAL IISU (4 COLUMNAS SEGÚN EL VIDEO REDDIT) -->
                <div class="iisu-stage-layout">
                    <!-- Columna 1: Icono del Sistema en Squircle de Cristal con Flecha -->
                    <div class="iisu-system-column">
                        <div class="iisu-system-squircle" id="iisuSquircleBox">
                            <img id="iisuSquircleImg" src="assets/consoles/n64.png" alt="Sistema">
                        </div>
                        <div class="iisu-system-arrow-indicator">▶</div>
                    </div>

                    <!-- Columna 2: Carrusel Vertical de Carátulas (Vertical Cover Stack) -->
                    <div class="iisu-covers-column" id="iisuCoversColumn">
                        <!-- Las carátulas cuadradas se inyectan dinámicamente -->
                    </div>

                    <!-- Columna 3: Información y Metadatos Exactos del Video -->
                    <div class="iisu-details-column">
                        <h1 class="iisu-game-title" id="iisuGameTitle">Paper Mario (Europe)</h1>

                        <!-- Pastillas de Metadatos con borde redondeado estilo iiSU -->
                        <div class="iisu-pills-list">
                            <div class="iisu-meta-pill-bar">
                                <span class="iisu-meta-icon">📅</span>
                                <span class="iisu-meta-text" id="iisuMetaYear">2001-10-05</span>
                            </div>
                            <div class="iisu-meta-pill-bar">
                                <span class="iisu-meta-icon">👥</span>
                                <span class="iisu-meta-text" id="iisuMetaPlayers">1 Jugador</span>
                            </div>
                            <div class="iisu-meta-pill-bar">
                                <span class="iisu-meta-icon">🏢</span>
                                <span class="iisu-meta-text" id="iisuMetaDev">Intelligent Systems / Nintendo</span>
                            </div>
                            <div class="iisu-meta-pill-bar">
                                <span class="iisu-meta-icon">⏱️</span>
                                <span class="iisu-meta-text" id="iisuMetaEngine">ParaLLEl N64 60FPS</span>
                            </div>
                            <div class="iisu-meta-pill-bar">
                                <span class="iisu-meta-icon">🏷️</span>
                                <span class="iisu-meta-text" id="iisuMetaGenre">RPG / Aventura</span>
                            </div>
                        </div>

                        <p class="iisu-game-desc" id="iisuGameDesc">
                            Acompaña a Mario en una mágica aventura con estética de papel recortado y combates dinámicos por turnos para rescatar a los Espíritus Estelares.
                        </p>

                        <!-- Botones de Acción -->
                        <div class="iisu-action-row">
                            <button class="btn-iisu-play" onclick="launchActiveGame()" id="btnIisuPlay">
                                <span>▶</span>
                                <span>JUGAR AHORA (A)</span>
                            </button>
                            <button class="btn-iisu-secondary" onclick="toggleActiveGameFavorite()">
                                <span id="gameFavStar">⭐</span>
                                <span>Favorito</span>
                            </button>
                            <button class="btn-iisu-secondary" onclick="document.getElementById('customRomInput').click()">
                                <span>📂</span>
                                <span>Cargar ROM Externa</span>
                            </button>
                            <input type="file" id="customRomInput" style="display: none;" onchange="handleCustomRomFile(event)">
                        </div>
                    </div>

                    <!-- Columna 4: Vitrina del Cartucho 3D / Media Frame -->
                    <div class="iisu-media-column">
                        <div class="iisu-cartridge-stage">
                            <img id="iisuCartridgeImg" src="ROMS/cartridges/cart_papermario.png" class="iisu-cartridge-img" alt="Cartucho 3D">
                        </div>
                    </div>
                </div>

                <!-- BARRA INFERIOR DE PROMPTS DE MANDO (ESTILO CONSOLA DEL VIDEO) -->
                <div class="iisu-controller-bar">
                    <div class="controller-hints-left">
                        <div class="btn-prompt-pill" onclick="goToSystemsView()">
                            <span class="btn-key-icon">B</span>
                            <span>Volver a Consolas (ESC)</span>
                        </div>
                        <div class="btn-prompt-pill" onclick="launchActiveGame()">
                            <span class="btn-key-icon">A</span>
                            <span>Jugar Ahora (ENTER)</span>
                        </div>
                    </div>

                    <div class="controller-hints-right">
                        <div class="btn-prompt-pill" onclick="toggleActiveGameFavorite()">
                            <span class="btn-key-icon">Y</span>
                            <span>Añadir a Favoritos (F)</span>
                        </div>
                        <div class="btn-prompt-pill" onclick="document.getElementById('customRomInput').click()">
                            <span class="btn-key-icon">X</span>
                            <span>Cargar ROM</span>
                        </div>
                        <div class="btn-prompt-pill" onclick="togglePersonalizationDrawer()">
                            <span class="btn-key-icon">T</span>
                            <span>Temas (T)</span>
                        </div>
                    </div>
                </div>
            </div>

        </section>

        <!-- ========================================================
             TAB 2: ZONA DE PERFIL DE USUARIO (AAA CROPPER Y VITRINA)
             ======================================================== -->
        <section class="tab-content" id="tab-profile">
            <div class="profile-editor-modal">
                <!-- 1. BANNER CON DEGRADADO INFERIOR -->
                <div class="banner-container">
                    <div class="banner-overlay-gradient"></div>
                    <img id="bannerImage" src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80" class="banner-img" alt="Banner">
                    <label class="banner-upload-badge" for="bannerFileInput">
                        <span>📷</span> <span>Cambiar Banner</span>
                    </label>
                    <input type="file" id="bannerFileInput" accept="image/png, image/jpeg, image/webp" style="display: none;" onchange="openCropModal(event, 'banner')">
                </div>

                <!-- 2. IDENTIDAD & AVATAR SUPERPUESTO -->
                <div class="profile-identity-bar">
                    <div class="avatar-wrapper">
                        <div class="avatar-hover-overlay" onclick="document.getElementById('avatarFileInput').click()">
                            <span>📷</span>
                            <span>Cambiar</span>
                        </div>
                        <img id="avatarImage" src="" class="avatar-img-circle" alt="Avatar" onerror="generateDynamicInitials()">
                        <div id="avatarFallback" class="avatar-fallback-initials">SA</div>
                        <input type="file" id="avatarFileInput" accept="image/png, image/jpeg, image/webp" style="display: none;" onchange="openCropModal(event, 'avatar')">
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 2px;">
                        <div class="preview-display-name" id="previewDisplayName">Sara</div>
                        <div class="preview-handle" id="previewHandle">@saragamer</div>
                    </div>
                </div>

                <!-- 3. CAMPOS DE EDICIÓN Y VITRINA -->
                <div class="editor-grid">
                    <div>
                        <h3 class="section-subtitle">Identidad del Jugador</h3>
                        <div class="input-field-group">
                            <label>Nombre a Mostrar</label>
                            <input type="text" id="inputDisplayName" maxlength="32" placeholder="Tu nombre..." oninput="updateIdentityPreview()">
                        </div>
                        <div class="input-field-group">
                            <label>Nombre de Usuario (@handle)</label>
                            <div class="handle-input-box">
                                <span style="font-weight: 700; color: var(--text-muted);">@</span>
                                <input type="text" id="inputHandle" maxlength="20" placeholder="usuario" oninput="validateHandle(this)">
                            </div>
                        </div>
                        <div class="input-field-group">
                            <div style="display: flex; justify-content: space-between;">
                                <label>Biografía / Presentación</label>
                                <span style="font-size: 11px; color: var(--text-muted);" id="bioCounter">0 / 300</span>
                            </div>
                            <textarea id="inputBio" rows="4" maxlength="300" placeholder="Escribe algo sobre ti..." oninput="updateBioCounter(this)"></textarea>
                        </div>
                    </div>

                    <div>
                        <h3 class="section-subtitle">Vitrina de Juegos Favoritos (Top 5)</h3>
                        <div class="input-field-group">
                            <label>Buscar y Añadir Juego</label>
                            <input type="text" id="gameSearchInput" placeholder="Buscar juego (ej. Paper Mario, Zelda, Sonic)..." oninput="handleGameSearch(this.value)">
                        </div>
                        <div class="favorites-showcase" id="favoritesShowcase">
                            <!-- 5 Slots -->
                        </div>
                    </div>
                </div>

                <div class="editor-footer-actions">
                    <button class="btn-cancel" onclick="loadProfile()">Descartar Cambios</button>
                    <button class="btn-save" id="btnSaveProfile" onclick="saveCompleteProfile()">Guardar Perfil</button>
                </div>
            </div>
        </section>

        <!-- ========================================================
             TAB 3: RED DE AMIGOS P2P WEBRTC
             ======================================================== -->
        <section class="tab-content" id="tab-friends">
            <div class="friends-container">
                <div class="friends-sidebar">
                    <div style="background: rgba(0, 210, 211, 0.1); border: 1px solid rgba(0, 210, 211, 0.3); border-radius: 14px; padding: 12px;">
                        <div style="font-size: 11px; font-weight: 800; color: var(--secondary); text-transform: uppercase;">Tu ID P2P Online</div>
                        <div style="font-family: monospace; font-size: 13px; font-weight: 700;" id="myPeerId">Conectando...</div>
                    </div>
                    <button class="btn-enter-games" style="padding: 10px 18px; font-size: 13px;" onclick="connectToPeerPrompt()">+ Conectar con Amigo</button>
                    <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-top: 10px;">Amigos Conectados</div>
                    <div id="friendsList" style="display: flex; flex-direction: column; gap: 8px;">
                        <div style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--iisu-pill-bg); border-radius: 10px;">
                            <div style="width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></div>
                            <span style="font-size: 13px; font-weight: 700;">Abel_Fox (N64)</span>
                        </div>
                    </div>
                </div>

                <div class="chat-main">
                    <div style="padding: 14px 20px; border-bottom: 1px solid var(--card-border); display: flex; justify-content: space-between;">
                        <span style="font-weight: 800;" id="chatActiveFriend">Chat P2P Directo</span>
                        <span style="font-size: 12px; color: #10b981; font-weight: 700;">🟢 Online</span>
                    </div>
                    <div style="flex: 1; padding: 20px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px;" id="chatMessages">
                        <div style="align-self: flex-start; background: var(--iisu-pill-bg); padding: 10px 16px; border-radius: 16px; font-size: 13px;">
                            ¡Hola! Escribe un mensaje o introduce el ID de tu amigo para chatear en tiempo real.
                        </div>
                    </div>
                    <div style="padding: 14px 20px; border-top: 1px solid var(--card-border); display: flex; gap: 10px;">
                        <input type="text" id="chatInput" placeholder="Escribe un mensaje..." style="flex: 1; background: var(--iisu-pill-bg); border: 1px solid var(--iisu-pill-border); border-radius: 12px; padding: 10px 16px; color: var(--text-main);" onkeypress="if(event.key==='Enter') sendChatMessage()">
                        <button class="btn-save" style="padding: 10px 20px;" onclick="sendChatMessage()">Enviar</button>
                    </div>
                </div>
            </div>
        </section>

        <!-- ========================================================
             TAB 4: AJUSTES GENERALES
             ======================================================== -->
        <section class="tab-content" id="tab-settings">
            <div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--radius-xl); padding: 36px; max-width: 600px;">
                <h2 style="font-family: 'Space Grotesk'; font-size: 24px; margin-bottom: 20px;">⚙️ Ajustes del Sistema RetroHub</h2>
                
                <div class="slider-control-group" style="margin-bottom: 20px;">
                    <label style="font-weight: 700;">Tema Visual Predeterminado</label>
                    <select id="settingThemeSelect" style="background: var(--iisu-pill-bg); border: 1px solid var(--iisu-pill-border); padding: 10px; border-radius: 10px; color: var(--text-main);" onchange="applyThemePreset(this.value)">
                        <option value="iisu_pearl">iiSU Pearl Mint (Soft Frosted Glass)</option>
                        <option value="esde_dark">ES-DE Obsidian Dark</option>
                        <option value="cyberia_y2k">Cyberia Y2K Neon</option>
                        <option value="frutiger_aero">Frutiger Aero Aqua</option>
                    </select>
                </div>

                <div style="display: flex; gap: 14px; margin-top: 24px;">
                    <button class="btn-enter-games" style="padding: 10px 20px; font-size: 13px;" onclick="window.n3dsAudio.play('launch')">🔊 Probar Sonido</button>
                    <button class="btn-hero-favorite" onclick="window.n3dsAudio.toggleBGM()">🎵 Música BGM Caja de Música</button>
                </div>
            </div>
        </section>

    </main>

    <!-- ========================================================
         REPRODUCTOR IN-APP MODAL A PANTALLA COMPLETA
         ======================================================== -->
    <div class="game-player-overlay" id="gamePlayerOverlay">
        <div class="player-top-hud">
            <div class="player-game-info">
                <span style="font-size: 18px;">🎮</span>
                <span id="playerGameTitle">Emulando Juego...</span>
                <span class="player-badge-core" id="playerCoreBadge">N64</span>
            </div>
            <div class="player-hud-actions">
                <button class="btn-exit-player" onclick="togglePlayerFullscreen()" style="background: rgba(255,255,255,0.15);">
                    <span>⛶</span> <span>Pantalla Completa</span>
                </button>
                <button class="btn-exit-player" onclick="closeGamePlayer()">
                    <span>✕</span> <span>Salir al Launcher (ESC)</span>
                </button>
            </div>
        </div>
        <div class="emulator-iframe-wrap">
            <iframe id="emulatorIframe" class="emulator-iframe" src="about:blank" allow="autoplay; fullscreen; gamepad"></iframe>
        </div>
    </div>

    <!-- ========================================================
         CAJÓN FLOTANTE DE PERSONALIZACIÓN Y ESTUDIO DE TEMAS
         ======================================================== -->
    <div class="personalization-drawer" id="personalizationDrawer">
        <div class="drawer-header">
            <div class="drawer-title">
                <span>🎨</span> <span>Estudio de Personalización</span>
            </div>
            <button class="drawer-close-btn" onclick="togglePersonalizationDrawer()">✕</button>
        </div>

        <!-- 1. Presets de Temas -->
        <div class="drawer-section">
            <div class="drawer-section-title">Presets de Diseño Visual</div>
            <div class="theme-preset-grid">
                <button class="theme-preset-btn active" id="btnPreset-iisu_pearl" onclick="applyThemePreset('iisu_pearl')">
                    <span>✨ iiSU Pearl</span>
                    <small style="opacity: 0.8; font-weight: 500;">Soft Glass Mint</small>
                </button>
                <button class="theme-preset-btn" id="btnPreset-esde_dark" onclick="applyThemePreset('esde_dark')">
                    <span>🌙 ES-DE Dark</span>
                    <small style="opacity: 0.8; font-weight: 500;">Obsidian Night</small>
                </button>
                <button class="theme-preset-btn" id="btnPreset-cyberia_y2k" onclick="applyThemePreset('cyberia_y2k')">
                    <span>⚡ Cyberia Y2K</span>
                    <small style="opacity: 0.8; font-weight: 500;">Neon Violet</small>
                </button>
                <button class="theme-preset-btn" id="btnPreset-frutiger_aero" onclick="applyThemePreset('frutiger_aero')">
                    <span>🫧 Frutiger Aero</span>
                    <small style="opacity: 0.8; font-weight: 500;">Aqua Glossy</small>
                </button>
            </div>
        </div>

        <!-- 2. Controles de Cristal y Geometría -->
        <div class="drawer-section">
            <div class="drawer-section-title">Geometría y Cristal (Glassmorphism)</div>
            
            <div class="slider-control-group">
                <div class="slider-label-row">
                    <span>Desenfoque (Blur)</span>
                    <span id="labelBlurVal">16px</span>
                </div>
                <input type="range" class="slider-range-input" min="0" max="30" value="16" id="inputBlurSlider" oninput="updateBlur(this.value)">
            </div>

            <div class="slider-control-group">
                <div class="slider-label-row">
                    <span>Redondeo de Bordes</span>
                    <span id="labelRadiusVal">26px</span>
                </div>
                <input type="range" class="slider-range-input" min="6" max="36" value="26" id="inputRadiusSlider" oninput="updateBorderRadius(this.value)">
            </div>
        </div>

        <!-- 3. Efectos Visuales y Sonido -->
        <div class="drawer-section">
            <div class="drawer-section-title">Efectos y Shaders</div>

            <div class="toggle-switch-row">
                <span class="toggle-switch-label">📺 Scanlines CRT Retro</span>
                <input type="checkbox" class="toggle-checkbox" id="checkCrt" onchange="toggleCrtScanlines(this.checked)">
            </div>

            <div class="toggle-switch-row">
                <span class="toggle-switch-label">🎵 Música BGM Caja de Música</span>
                <input type="checkbox" class="toggle-checkbox" id="checkBgm" onchange="toggleBgmMusic(this.checked)">
            </div>

            <div class="toggle-switch-row">
                <span class="toggle-switch-label">🔊 Efectos de Sonido 3DS</span>
                <input type="checkbox" class="toggle-checkbox" id="checkSfx" checked onchange="toggleSfxAudio(this.checked)">
            </div>
        </div>
    </div>

    <!-- MODAL DE CROPPING EN CANVAS (AVATAR & BANNER) -->
    <div class="crop-modal-overlay" id="cropModal">
        <div class="crop-modal-card">
            <div class="crop-header">
                <h3 id="cropModalTitle" style="font-family: 'Space Grotesk'; font-size: 20px; font-weight: 800;">Ajustar Imagen</h3>
                <button style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted);" onclick="closeCropModal()">✕</button>
            </div>
            <div class="crop-canvas-wrapper">
                <canvas id="cropCanvas"></canvas>
            </div>
            <div class="crop-controls">
                <span>🔍 Zoom</span>
                <input type="range" id="cropZoomSlider" min="1" max="3" step="0.05" value="1" oninput="renderCropCanvas()">
            </div>
            <div class="crop-footer">
                <button class="btn-cancel" onclick="closeCropModal()">Cancelar</button>
                <button class="btn-save" onclick="applyCroppedImage()">Aplicar Recorte</button>
            </div>
        </div>
    </div>

    <!-- ========================================================
         SCRIPT PRINCIPAL RETROHUB: ARQUITECTURA II SU WINDOWS
         ======================================================== -->
    <script>
        // 1. BASE DE DATOS DE CONSOLAS (14 SISTEMAS OFICIALES)
        const CONSOLES_DATA = [
            {
                id: 'n64',
                name: 'Nintendo 64',
                img: 'n64.png',
                wallpaper: 'assets/wallpapers/n64.svg',
                sub: '64-Bit Reality Immersion (1996)',
                year: '1996',
                maker: 'Nintendo',
                arch: '64-Bit MIPS VR4300 @ 93.75MHz',
                gamesCount: '1 Juego Instalado',
                controllers: '4 Puertos de Mando',
                desc: 'La legendaria consola de 64 bits de Nintendo que revolucionó los mundos 3D con Super Mario 64, The Legend of Zelda: Ocarina of Time y Paper Mario.',
                color: '#ff4757',
                glow: 'rgba(255, 71, 87, 0.45)',
                secondary: '#00d2d3'
            },
            {
                id: 'gba',
                name: 'Game Boy Advance',
                img: 'gba.png',
                wallpaper: 'assets/wallpapers/gba.svg',
                sub: '32-Bit Handheld Powerhouse (2001)',
                year: '2001',
                maker: 'Nintendo',
                arch: '32-Bit ARM7TDMI @ 16.78MHz',
                gamesCount: '2 Juegos Instalados',
                controllers: 'Botones L/R Ergonómicos',
                desc: 'La consola portátil de 32 bits por excelencia. Cuna del pixel art moderno con joyas como Pokémon Esmeralda, Golden Sun, Metroid Fusion y Anguna.',
                color: '#5352ed',
                glow: 'rgba(83, 82, 237, 0.45)',
                secondary: '#ff4757'
            },
            {
                id: 'nes',
                name: 'Nintendo NES',
                img: 'nes.png',
                wallpaper: 'assets/wallpapers/nes.svg',
                sub: '8-Bit Living Room Icon (1983)',
                year: '1983',
                maker: 'Nintendo',
                arch: '8-Bit Ricoh 2A03 (MOS 6502)',
                gamesCount: '2 Juegos Instalados',
                controllers: '2 Mandos D-Pad Clásicos',
                desc: 'La consola que rescató a la industria con Super Mario Bros, The Legend of Zelda y Metroid, estableciendo las bases del videojuego moderno.',
                color: '#e74c3c',
                glow: 'rgba(231, 76, 60, 0.45)',
                secondary: '#c0392b'
            },
            {
                id: 'snes',
                name: 'Super Nintendo (SNES)',
                img: 'snes.png',
                wallpaper: 'assets/wallpapers/snes.svg',
                sub: '16-Bit Perfection & Mode 7 (1990)',
                year: '1990',
                maker: 'Nintendo',
                arch: '16-Bit Ricoh 5A22 + Chip S-SMP',
                gamesCount: 'Listo para ROMs',
                controllers: 'Mando de 4 Botones + L/R',
                desc: 'El pináculo del pixel art y el sonido orquestal con Super Mario World, Chrono Trigger, Super Metroid y Donkey Kong Country.',
                color: '#6c5ce7',
                glow: 'rgba(108, 92, 231, 0.45)',
                secondary: '#a29bfe'
            },
            {
                id: 'ps1',
                name: 'PlayStation 1',
                img: 'ps1.png',
                wallpaper: 'assets/wallpapers/ps1.svg',
                sub: '32-Bit CD-ROM Revolution (1994)',
                year: '1994',
                maker: 'Sony Computer Ent.',
                arch: '32-Bit MIPS R3000A + GTE',
                gamesCount: 'Listo para ROMs',
                controllers: '2 Mandos DualShock',
                desc: 'El terremoto cinematográfico de Sony que cambió los videojuegos para siempre con Metal Gear Solid, Final Fantasy VII y Resident Evil.',
                color: '#0984e3',
                glow: 'rgba(9, 132, 227, 0.45)',
                secondary: '#74b9ff'
            },
            {
                id: 'psp',
                name: 'PlayStation Portable (PSP)',
                img: 'psp.png',
                wallpaper: 'assets/wallpapers/psp.svg',
                sub: '3D High-End Widescreen (2004)',
                year: '2004',
                maker: 'Sony Computer Ent.',
                arch: '32-Bit MIPS R4000 @ 333MHz',
                gamesCount: 'Listo para ROMs',
                controllers: 'Pantalla Panorámica 16:9',
                desc: 'Gráficos de nivel PS2 en tu bolsillo. Obras maestras como God of War: Ghost of Sparta, Peace Walker y Persona 3 Portable.',
                color: '#00cec9',
                glow: 'rgba(0, 206, 201, 0.45)',
                secondary: '#0984e3'
            },
            {
                id: 'genesis',
                name: 'Sega Genesis / Mega Drive',
                img: 'genesis.png',
                wallpaper: 'assets/wallpapers/genesis.svg',
                sub: '16-Bit Blast Processing (1988)',
                year: '1988',
                maker: 'SEGA',
                arch: 'Motorola 68000 + Z80',
                gamesCount: 'Listo para ROMs',
                controllers: '2 Mandos 6 Botones',
                desc: 'Pura adrenalina de 16 bits y velocidad vertiginosa. El hogar de Sonic the Hedgehog, Streets of Rage 2 y Shinobi III.',
                color: '#3742fa',
                glow: 'rgba(55, 66, 250, 0.45)',
                secondary: '#5f27cd'
            },
            {
                id: 'sms',
                name: 'Sega Master System',
                img: 'sms.png',
                wallpaper: 'assets/wallpapers/sms.svg',
                sub: '8-Bit Arcade Powerhouse (1985)',
                year: '1985',
                maker: 'SEGA',
                arch: 'Zilog Z80A @ 3.58MHz',
                gamesCount: 'Listo para ROMs',
                controllers: '2 Mandos Cuadrados',
                desc: 'La potencia arcade de 8 bits de Sega con Alex Kidd, Wonder Boy III y Phantasy Star.',
                color: '#ffa502',
                glow: 'rgba(255, 165, 2, 0.45)',
                secondary: '#ff6348'
            },
            {
                id: 'arcade',
                name: 'Arcade MAME',
                img: 'arcade.png',
                wallpaper: 'assets/wallpapers/arcade.svg',
                sub: 'Coin-Op Masterworks',
                year: '1980-99',
                maker: 'Varios Fabricantes',
                arch: 'Hardware Custom Arcade Coin-Op',
                gamesCount: 'Listo para ROMs',
                controllers: 'Arcade Sticks / Botoneras',
                desc: 'El rugido de los salones recreativos dorados. Street Fighter II, Metal Slug, The King of Fighters y Pac-Man.',
                color: '#ff6348',
                glow: 'rgba(255, 99, 72, 0.45)',
                secondary: '#ff4757'
            },
            {
                id: 'atari',
                name: 'Atari 2600',
                img: 'atari.png',
                wallpaper: 'assets/wallpapers/atari.svg',
                sub: 'Woodgrain Living Room Icon (1977)',
                year: '1977',
                maker: 'Atari, Inc.',
                arch: '8-Bit MOS 6507 + TIA',
                gamesCount: 'Listo para ROMs',
                controllers: 'Joysticks CX40 + Paddles',
                desc: 'La chispa original de los videojuegos en casa con Pitfall!, Space Invaders, Asteroids y Adventure.',
                color: '#f0932b',
                glow: 'rgba(240, 147, 43, 0.45)',
                secondary: '#d35400'
            },
            {
                id: 'pce',
                name: 'PC Engine / TurboGrafx-16',
                img: 'pce.png',
                wallpaper: 'assets/wallpapers/pce.svg',
                sub: 'NEC 16-Bit Ultra-Compact (1987)',
                year: '1987',
                maker: 'NEC / Hudson Soft',
                arch: 'Hudson HuC6280 8/16-Bit',
                gamesCount: 'Listo para ROMs',
                controllers: 'TurboPad',
                desc: 'Potencia diminuta en tarjetas HuCard. Castlevania: Rondo of Blood, PC Genjin (Bonk) y Soldier Blade.',
                color: '#2ed573',
                glow: 'rgba(46, 213, 115, 0.45)',
                secondary: '#00d2d3'
            },
            {
                id: 'virtualboy',
                name: 'Virtual Boy',
                img: 'virtualboy.png',
                wallpaper: 'assets/wallpapers/virtualboy.svg',
                sub: '3D Monochromatic VR (1995)',
                year: '1995',
                maker: 'Nintendo',
                arch: '32-Bit NEC V810 RISC',
                gamesCount: 'Listo para ROMs',
                controllers: 'Mando Dual D-Pad',
                desc: 'La audaz visión estereoscópica roja de Gunpei Yokoi con Wario Land y Red Alarm.',
                color: '#eb4d4b',
                glow: 'rgba(235, 77, 75, 0.45)',
                secondary: '#ff7979'
            },
            {
                id: 'gbc',
                name: 'Game Boy Color',
                img: 'gbc.png',
                wallpaper: 'assets/wallpapers/gbc.svg',
                sub: 'Color Portable Magic (1998)',
                year: '1998',
                maker: 'Nintendo',
                arch: 'Sharp 8-Bit Z80 @ 8MHz',
                gamesCount: 'Listo para ROMs',
                controllers: 'Formato Vertical Original',
                desc: 'El estallido de color en la mítica portátil. Zelda Oracle of Ages/Seasons y Pokémon Oro/Plata.',
                color: '#9b59b6',
                glow: 'rgba(155, 89, 182, 0.45)',
                secondary: '#8e44ad'
            },
            {
                id: 'nds',
                name: 'Nintendo DS',
                img: 'nds.png',
                wallpaper: 'assets/wallpapers/nds.svg',
                sub: 'Dual Screen Touch Sensation (2004)',
                year: '2004',
                maker: 'Nintendo',
                arch: 'ARM946E-S + ARM7TDMI',
                gamesCount: 'Listo para ROMs',
                controllers: 'Pantalla Táctil + Stylus',
                desc: 'Revolución de doble pantalla táctil con Mario Kart DS, Zelda Phantom Hourglass y Pokémon Diamante.',
                color: '#a0a0a0',
                glow: 'rgba(160, 160, 160, 0.45)',
                secondary: '#2c3e50'
            }
        ];

        // 2. CATÁLOGO LOCAL DE JUEGOS VERIFICADOS (100% FUNCIONALES EN DISCO)
        const LOCAL_GAMES_CATALOG = {
            'n64': [
                {
                    id: 'n64_papermario',
                    title: 'Paper Mario (Europe)',
                    file: 'ROMS/n64/Paper Mario (Europe) (En,Fr,De,Es).z64',
                    cover: 'ROMS/covers/papermario.png',
                    cartridge: 'ROMS/cartridges/cart_papermario.png',
                    year: '2001-10-05',
                    players: '1 Jugador',
                    developer: 'Intelligent Systems / Nintendo',
                    engine: 'ParaLLEl N64 60FPS',
                    genre: 'RPG / Mario Aventura',
                    core: 'n64',
                    n64core: 'parallel',
                    desc: 'Acompaña a Mario en una mágica aventura con estética de papel recortado y combates dinámicos por turnos para rescatar a los Espíritus Estelares.'
                }
            ],
            'gba': [
                {
                    id: 'gba_anguna',
                    title: 'Anguna: Warriors of Demrav',
                    file: 'ROMS/gba/Anguna.gba',
                    cover: 'ROMS/covers/anguna_box.png',
                    cartridge: 'ROMS/cartridges/cart_anguna.png',
                    year: '2008-01-15',
                    players: '1 Jugador',
                    developer: 'Bite the Chili Productions',
                    engine: 'mGBA WebGL High-Fi',
                    genre: 'Acción / RPG Aventura (Estilo Zelda)',
                    core: 'gba',
                    desc: 'Un aclamado RPG de acción al estilo clásico de Zelda con múltiples mazmorras, enemigos formidables y secretos por todo el reino de Demrav.'
                },
                {
                    id: 'gba_3weeks',
                    title: '3 Weeks in Paradise',
                    file: 'ROMS/gba/3Weeksinparadise.gba',
                    cover: 'ROMS/covers/3weeksinparadise.jpg',
                    cartridge: 'ROMS/cartridges/cart_3weeksinparadise.png',
                    year: '1986 / GBA',
                    players: '1 Jugador',
                    developer: 'Mikro-Gen / GBA Remake',
                    engine: 'mGBA WebGL High-Fi',
                    genre: 'Aventura Clásica',
                    core: 'gba',
                    desc: 'La famosa odisea de Wally Week en una misteriosa isla paradisíaca repleta de acertijos ingeniosos y desafíos de plataformas.'
                }
            ],
            'nes': [
                {
                    id: 'nes_31in1',
                    title: '31 In 1 Realgame Multicart',
                    file: 'ROMS/nes/31In1Realgame-Multicart.nes',
                    cover: 'ROMS/covers/31in1.png',
                    cartridge: 'ROMS/cartridges/cart_31in1.png',
                    year: '1992',
                    players: '1-2 Jugadores',
                    developer: 'Realgame Arcade',
                    engine: 'FCEUmm / QuickNES',
                    genre: 'Compilatorio Arcade 8-Bit',
                    core: 'nes',
                    desc: 'Legendario cartucho multicomputadora que reúne los mayores éxitos del arcade de 8 bits con decenas de títulos directos.'
                },
                {
                    id: 'nes_3in1',
                    title: '3 In 1 2P Pak',
                    file: 'ROMS/nes/3In12Ppak.nes',
                    cover: 'ROMS/covers/3in1.png',
                    cartridge: 'ROMS/cartridges/cart_3in1.png',
                    year: '1990',
                    players: '2 Jugadores Simultáneos',
                    developer: 'Nintendo Entertainment',
                    engine: 'FCEUmm / QuickNES',
                    genre: 'Multijuego Cooperativo',
                    core: 'nes',
                    desc: 'Compendio de tres experiencias cooperativas e interactivas diseñadas específicamente para partidas de dos jugadores en la NES.'
                }
            ]
        };

        // ESTADO GLOBAL DE LA APLICACIÓN
        let currentConsole = CONSOLES_DATA[0]; // N64 por defecto
        let activeGameIndex = 0;
        let activeBgLayer = 'A';
        let favoriteConsoles = JSON.parse(localStorage.getItem('retrohub_favorite_consoles') || '["n64", "gba"]');
        let favoriteGames = JSON.parse(localStorage.getItem('retrohub_favorite_games') || '["n64_papermario", "gba_anguna"]');
        let isGamesViewActive = false;
        let currentTheme = localStorage.getItem('retrohub_theme') || 'iisu_pearl';
        let peer = null;
        let peerConnection = null;

        // PERFIL DE USUARIO
        let userProfile = {
            handle: "saragamer",
            displayName: "Sara",
            bio: "Entusiasta de la emulación, estética iiSU y preservación de consolas.",
            avatarUrl: "",
            bannerUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1280&q=80",
            favoriteGames: [
                { id: "sm64", title: "Super Mario 64", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png", year: "1996", platform: "Nintendo 64" },
                { id: "oot", title: "The Legend of Zelda: Ocarina of Time", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2579.png", year: "1998", platform: "Nintendo 64" }
            ]
        };

        let currentCropMode = 'avatar';
        let cropImageObj = new Image();
        let cropState = { x: 0, y: 0, scale: 1, isDragging: false, startX: 0, startY: 0 };
        let searchDebounceTimer = null;

        // ========================================================
        // INICIALIZACIÓN AL CARGAR LA PÁGINA
        // ========================================================
        window.addEventListener('DOMContentLoaded', () => {
            renderConsolesGrid();
            selectConsole(CONSOLES_DATA[0]);
            applyThemePreset(currentTheme);
            loadSavedSettings();
            loadProfile();
            loadBlinkies();
            updateLiveClock();
            setInterval(updateLiveClock, 1000);
            initPeerJS();
            setupGlobalControllerKeys();
        });

        // ========================================================
        // PASO 1: GESTIÓN DE CONSOLAS Y NAVEGACIÓN EN SISTEMAS
        // ========================================================
        function renderConsolesGrid() {
            const grid = document.getElementById('consoleGrid');
            if (!grid) return;
            grid.innerHTML = '';

            CONSOLES_DATA.forEach(item => {
                const card = document.createElement('div');
                const isSelected = item.id === currentConsole.id;
                const gamesForThis = LOCAL_GAMES_CATALOG[item.id] || [];
                const gamesText = gamesForThis.length > 0 ? `${gamesForThis.length} Juego${gamesForThis.length > 1 ? 's' : ''}` : 'Cargar ROM';

                card.className = `console-card ${isSelected ? 'active' : ''}`;
                card.style.setProperty('--console-color', item.color);
                card.style.setProperty('--console-glow', item.glow);

                card.innerHTML = `
                    <div class="card-img-wrap">
                        <img src="assets/consoles/${item.img}" class="card-console-img" alt="${item.name}">
                    </div>
                    <div class="console-name">${item.name}</div>
                    <div class="console-sub">${item.sub}</div>
                    <span class="console-badge-count">${gamesText}</span>
                `;

                card.onclick = () => {
                    selectConsole(item);
                };
                card.ondblclick = () => {
                    selectConsole(item);
                    enterGamesView();
                };

                grid.appendChild(card);
            });
        }

        function selectConsole(item) {
            if (window.n3dsAudio) window.n3dsAudio.play('move');
            currentConsole = item;

            // 1. Crossfade dinámico del fondo hacia la estética de la consola
            setDynamicWallpaper(item.wallpaper || `assets/wallpapers/${item.id}.svg`);

            // 2. Inyección de variables CSS para el resplandor y acento del sistema
            document.documentElement.style.setProperty('--system-accent', item.color);
            document.documentElement.style.setProperty('--system-glow', item.glow);
            document.documentElement.style.setProperty('--system-secondary', item.secondary || item.color);

            // 3. Hardware protagonista 3D con animación pop-in
            const imgElem = document.getElementById('stageRealImg');
            if (imgElem) {
                imgElem.classList.remove('hardware-pop-in');
                void imgElem.offsetWidth;
                imgElem.src = `assets/consoles/${item.img}`;
                imgElem.classList.add('hardware-pop-in');
            }

            // 4. Actualización de textos del Hero
            document.getElementById('stageHeader').textContent = item.name;
            document.getElementById('stageDesc').textContent = item.desc;
            document.getElementById('metaYear').textContent = item.year;
            document.getElementById('metaMaker').textContent = item.maker;
            document.getElementById('metaArch').textContent = item.arch;
            document.getElementById('metaControllers').textContent = item.controllers;

            const games = LOCAL_GAMES_CATALOG[item.id] || [];
            document.getElementById('metaGames').textContent = games.length > 0 
                ? `${games.length} Juego${games.length > 1 ? 's' : ''} Instalado${games.length > 1 ? 's' : ''}` 
                : 'Listo para ROMs externas';

            updateFavoriteButtonState();
            renderConsolesGrid();
        }

        function setDynamicWallpaper(wallpaperUrl) {
            const layerA = document.getElementById('bgLayerA');
            const layerB = document.getElementById('bgLayerB');
            if (!layerA || !layerB) return;

            const incoming = activeBgLayer === 'A' ? layerB : layerA;
            const outgoing = activeBgLayer === 'A' ? layerA : layerB;

            incoming.style.backgroundImage = `url('${wallpaperUrl}')`;
            incoming.classList.add('active');
            outgoing.classList.remove('active');

            activeBgLayer = activeBgLayer === 'A' ? 'B' : 'A';
        }

        function updateFavoriteButtonState() {
            const btn = document.getElementById('btnHeroFavorite');
            const star = document.getElementById('favStarIcon');
            const txt = document.getElementById('favStarText');
            if (!btn || !star || !txt) return;

            if (favoriteConsoles.includes(currentConsole.id)) {
                btn.classList.add('active');
                star.textContent = '★';
                txt.textContent = 'En tus Favoritos';
            } else {
                btn.classList.remove('active');
                star.textContent = '⭐';
                txt.textContent = 'Añadir a Favoritos';
            }
        }

        function toggleFavoriteCurrent() {
            const idx = favoriteConsoles.indexOf(currentConsole.id);
            if (idx >= 0) {
                favoriteConsoles.splice(idx, 1);
                if (window.n3dsAudio) window.n3dsAudio.play('cancel');
            } else {
                favoriteConsoles.push(currentConsole.id);
                if (window.n3dsAudio) window.n3dsAudio.play('favorite');
            }
            localStorage.setItem('retrohub_favorite_consoles', JSON.stringify(favoriteConsoles));
            updateFavoriteButtonState();
        }

        // ========================================================
        // PASO 2: TRANSICIÓN A LA EXPERIENCIA IISU DE JUEGOS
        // ========================================================
        function enterGamesView() {
            if (window.n3dsAudio) window.n3dsAudio.play('launch');
            isGamesViewActive = true;

            document.getElementById('view-systems').style.display = 'none';
            document.getElementById('view-games').style.display = 'flex';

            // Actualizar encabezados iiSU
            document.getElementById('gameviewConsoleName').textContent = currentConsole.name;
            document.getElementById('iisuSquircleImg').src = `assets/consoles/${currentConsole.img}`;

            // Cargar juegos para esta consola
            activeGameIndex = 0;
            renderIisuGamesList();
        }

        function goToSystemsView() {
            if (window.n3dsAudio) window.n3dsAudio.play('cancel');
            isGamesViewActive = false;

            document.getElementById('view-games').style.display = 'none';
            document.getElementById('view-systems').style.display = 'flex';
        }

        function getActiveConsoleGames() {
            return LOCAL_GAMES_CATALOG[currentConsole.id] || [];
        }

        function renderIisuGamesList() {
            const games = getActiveConsoleGames();
            const container = document.getElementById('iisuCoversColumn');
            container.innerHTML = '';

            document.getElementById('gameviewGamesCount').textContent = games.length > 0 
                ? `${games.length} Juego${games.length > 1 ? 's' : ''}` 
                : '0 Juegos';

            if (games.length === 0) {
                // Si la consola no tiene juegos locales precargados, mostrar tarjeta para cargar ROM
                const emptyCard = document.createElement('div');
                emptyCard.className = 'iisu-game-tile active';
                emptyCard.style.display = 'flex';
                emptyCard.style.flexDirection = 'column';
                emptyCard.style.alignItems = 'center';
                emptyCard.style.justifyContent = 'center';
                emptyCard.style.padding = '14px';
                emptyCard.style.textAlign = 'center';
                emptyCard.style.background = 'rgba(255,255,255,0.1)';

                emptyCard.innerHTML = `
                    <div style="font-size: 32px; margin-bottom: 8px;">📂</div>
                    <div style="font-size: 13px; font-weight: 800; color: white;">Cargar ROM</div>
                    <div style="font-size: 10px; color: #94a3b8; margin-top: 4px;">Arrastra un archivo aquí</div>
                `;
                emptyCard.onclick = () => document.getElementById('customRomInput').click();
                container.appendChild(emptyCard);

                // Detalles genéricos de carga
                document.getElementById('iisuGameTitle').textContent = `Catálogo de ${currentConsole.name}`;
                document.getElementById('iisuMetaYear').textContent = currentConsole.year;
                document.getElementById('iisuMetaPlayers').textContent = '1-2 Jugadores';
                document.getElementById('iisuMetaDev').textContent = currentConsole.maker;
                document.getElementById('iisuMetaEngine').textContent = 'WebGL Native Emulation';
                document.getElementById('iisuMetaGenre').textContent = 'Carga Externa';
                document.getElementById('iisuGameDesc').textContent = `Selecciona o arrastra cualquier archivo ROM compatible con ${currentConsole.name} para emularlo de inmediato con soporte de mando y WebGL.`;
                document.getElementById('iisuCartridgeImg').src = `assets/consoles/${currentConsole.img}`;
                return;
            }

            // Renderizar carátulas cuadradas verticales
            games.forEach((game, idx) => {
                const tile = document.createElement('div');
                tile.className = `iisu-game-tile ${idx === activeGameIndex ? 'active' : ''}`;
                tile.innerHTML = `
                    <span class="iisu-tile-platform-badge">${currentConsole.id.toUpperCase()}</span>
                    <img src="${game.cover}" class="iisu-game-tile-img" alt="${game.title}" onerror="this.src='assets/consoles/${currentConsole.img}'">
                `;
                tile.onclick = () => {
                    focusIisuGame(idx);
                };
                tile.ondblclick = () => {
                    focusIisuGame(idx);
                    launchActiveGame();
                };
                container.appendChild(tile);
            });

            // Actualizar detalles del juego enfocado
            updateIisuGameDetails(games[activeGameIndex]);
        }

        function focusIisuGame(idx) {
            const games = getActiveConsoleGames();
            if (!games[idx]) return;

            if (window.n3dsAudio) window.n3dsAudio.play('move');
            activeGameIndex = idx;

            // Actualizar clases activas en carátulas
            const tiles = document.querySelectorAll('.iisu-game-tile');
            tiles.forEach((t, i) => {
                if (i === idx) {
                    t.classList.add('active');
                    t.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    t.classList.remove('active');
                }
            });

            updateIisuGameDetails(games[idx]);
        }

        function updateIisuGameDetails(game) {
            if (!game) return;

            document.getElementById('iisuGameTitle').textContent = game.title;
            document.getElementById('iisuMetaYear').textContent = game.year || 'Retro Classic';
            document.getElementById('iisuMetaPlayers').textContent = game.players || '1 Jugador';
            document.getElementById('iisuMetaDev').textContent = game.developer || 'Nintendo';
            document.getElementById('iisuMetaEngine').textContent = game.engine || 'WebGL 60FPS';
            document.getElementById('iisuMetaGenre').textContent = game.genre || 'Aventura';
            document.getElementById('iisuGameDesc').textContent = game.desc || 'Disfruta de este clásico de la emulación con shaders de alta fidelidad y controles auténticos.';

            // Cartucho 3D
            const cartImg = document.getElementById('iisuCartridgeImg');
            if (cartImg) {
                cartImg.src = game.cartridge || `assets/consoles/${currentConsole.img}`;
            }

            // Estado de favorito
            const star = document.getElementById('gameFavStar');
            if (favoriteGames.includes(game.id)) {
                star.textContent = '★';
            } else {
                star.textContent = '⭐';
            }
        }

        function toggleActiveGameFavorite() {
            const games = getActiveConsoleGames();
            const game = games[activeGameIndex];
            if (!game) return;

            const idx = favoriteGames.indexOf(game.id);
            if (idx >= 0) {
                favoriteGames.splice(idx, 1);
                if (window.n3dsAudio) window.n3dsAudio.play('cancel');
            } else {
                favoriteGames.push(game.id);
                if (window.n3dsAudio) window.n3dsAudio.play('favorite');
            }
            localStorage.setItem('retrohub_favorite_games', JSON.stringify(favoriteGames));
            updateIisuGameDetails(game);
        }

        // ========================================================
        // PASO 3: LANZAMIENTO REAL DEL EMULADOR (IN-APP MODAL)
        // ========================================================
        function launchActiveGame() {
            const games = getActiveConsoleGames();
            const game = games[activeGameIndex];

            if (!game) {
                document.getElementById('customRomInput').click();
                return;
            }

            if (window.n3dsAudio) window.n3dsAudio.play('launch');

            const overlay = document.getElementById('gamePlayerOverlay');
            const iframe = document.getElementById('emulatorIframe');
            const titleElem = document.getElementById('playerGameTitle');
            const coreBadge = document.getElementById('playerCoreBadge');

            titleElem.textContent = `${game.title} • ${currentConsole.name}`;
            coreBadge.textContent = game.core.toUpperCase();

            // Construir URL limpia para player.html
            let playerUrl = `player.html?core=${encodeURIComponent(game.core)}&rom=${encodeURIComponent(game.file)}&name=${encodeURIComponent(game.title)}&theme=${encodeURIComponent(currentTheme)}`;
            if (game.n64core) {
                playerUrl += `&n64core=${encodeURIComponent(game.n64core)}`;
            }

            iframe.src = playerUrl;
            overlay.style.display = 'flex';
        }

        function closeGamePlayer() {
            if (window.n3dsAudio) window.n3dsAudio.play('cancel');
            const overlay = document.getElementById('gamePlayerOverlay');
            const iframe = document.getElementById('emulatorIframe');

            // Descargar iframe para detener audio y WebGL de inmediato
            iframe.src = 'about:blank';
            overlay.style.display = 'none';

            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        }

        function togglePlayerFullscreen() {
            const overlay = document.getElementById('gamePlayerOverlay');
            if (!document.fullscreenElement) {
                overlay.requestFullscreen().catch(() => {});
            } else {
                document.exitFullscreen().catch(() => {});
            }
        }

        // CARGA DE ROM EXTERNA POR EL USUARIO
        function handleCustomRomFile(event) {
            const file = event.target.files[0];
            if (!file) return;

            const blobUrl = URL.createObjectURL(file);
            const cleanName = file.name.replace(/\.[^/.]+$/, "");

            // Crear un juego dinámico temporal para la consola activa
            const customGame = {
                id: 'custom_' + Date.now(),
                title: cleanName,
                file: blobUrl,
                cover: `assets/consoles/${currentConsole.img}`,
                cartridge: `assets/consoles/${currentConsole.img}`,
                year: 'ROM Personalizada',
                players: '1-2 Jugadores',
                developer: 'Archivo Local',
                engine: 'Carga Directa WebGL',
                genre: 'Juego Local',
                core: currentConsole.id === 'genesis' ? 'segaMD' : (currentConsole.id === 'ps1' ? 'psx' : currentConsole.id),
                desc: `ROM cargada localmente: ${file.name} (${(file.size / (1024*1024)).toFixed(2)} MB).`
            };

            if (!LOCAL_GAMES_CATALOG[currentConsole.id]) {
                LOCAL_GAMES_CATALOG[currentConsole.id] = [];
            }
            LOCAL_GAMES_CATALOG[currentConsole.id].unshift(customGame);
            activeGameIndex = 0;

            renderIisuGamesList();
            launchActiveGame();
        }

        // ========================================================
        // PASO 4: CONTROL POR TECLADO Y MANDO DE CONSOLA
        // ========================================================
        function setupGlobalControllerKeys() {
            window.addEventListener('keydown', (e) => {
                // No interceptar si el usuario está escribiendo en campos de texto
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

                // Si el reproductor está abierto, ESC lo cierra
                if (document.getElementById('gamePlayerOverlay').style.display === 'flex') {
                    if (e.key === 'Escape') {
                        closeGamePlayer();
                    }
                    return;
                }

                // NAVEGACIÓN EN MODO SISTEMAS
                if (!isGamesViewActive) {
                    const currentIndex = CONSOLES_DATA.findIndex(c => c.id === currentConsole.id);
                    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                        const next = (currentIndex + 1) % CONSOLES_DATA.length;
                        selectConsole(CONSOLES_DATA[next]);
                    } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                        const prev = (currentIndex - 1 + CONSOLES_DATA.length) % CONSOLES_DATA.length;
                        selectConsole(CONSOLES_DATA[prev]);
                    } else if (e.key === 'Enter') {
                        enterGamesView();
                    } else if (e.key === 'f' || e.key === 'F') {
                        toggleFavoriteCurrent();
                    } else if (e.key === 't' || e.key === 'T') {
                        togglePersonalizationDrawer();
                    }
                } 
                // NAVEGACIÓN EN MODO JUEGOS IISU (EL VIDEO)
                else {
                    const games = getActiveConsoleGames();
                    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                        if (games.length > 0) {
                            const next = (activeGameIndex + 1) % games.length;
                            focusIisuGame(next);
                        }
                    } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                        if (games.length > 0) {
                            const prev = (activeGameIndex - 1 + games.length) % games.length;
                            focusIisuGame(prev);
                        }
                    } else if (e.key === 'Enter') {
                        launchActiveGame();
                    } else if (e.key === 'Escape' || e.key === 'Backspace') {
                        goToSystemsView();
                    } else if (e.key === 'f' || e.key === 'F') {
                        toggleActiveGameFavorite();
                    } else if (e.key === 't' || e.key === 'T') {
                        togglePersonalizationDrawer();
                    }
                }
            });
        }

        // ========================================================
        // PASO 5: CAJÓN DE PERSONALIZACIÓN Y ESTUDIO DE TEMAS
        // ========================================================
        function togglePersonalizationDrawer() {
            if (window.n3dsAudio) window.n3dsAudio.play('move');
            const drawer = document.getElementById('personalizationDrawer');
            drawer.classList.toggle('open');
        }

        function applyThemePreset(themeName) {
            currentTheme = themeName;
            document.documentElement.setAttribute('data-theme', themeName);
            localStorage.setItem('retrohub_theme', themeName);

            // Actualizar botones activos
            document.querySelectorAll('.theme-preset-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.getElementById(`btnPreset-${themeName}`);
            if (activeBtn) activeBtn.classList.add('active');

            const select = document.getElementById('settingThemeSelect');
            if (select) select.value = themeName;

            if (window.n3dsAudio) window.n3dsAudio.play('favorite');
        }

        function updateBlur(val) {
            document.documentElement.style.setProperty('--glass-blur', `${val}px`);
            document.getElementById('labelBlurVal').textContent = `${val}px`;
            saveSetting('blur', val);
        }

        function updateBorderRadius(val) {
            document.documentElement.style.setProperty('--radius-xl', `${val}px`);
            document.documentElement.style.setProperty('--radius-lg', `${Math.round(val * 0.7)}px`);
            document.documentElement.style.setProperty('--radius-md', `${Math.round(val * 0.5)}px`);
            document.getElementById('labelRadiusVal').textContent = `${val}px`;
            saveSetting('radius', val);
        }

        function toggleCrtScanlines(enable) {
            const overlay = document.getElementById('crtOverlay');
            if (enable) {
                overlay.classList.add('active');
            } else {
                overlay.classList.remove('active');
            }
            saveSetting('crt', enable);
        }

        function toggleBgmMusic(enable) {
            if (window.n3dsAudio) {
                if (enable && !window.n3dsAudio.bgmEnabled) {
                    window.n3dsAudio.toggleBGM();
                } else if (!enable && window.n3dsAudio.bgmEnabled) {
                    window.n3dsAudio.toggleBGM();
                }
            }
            saveSetting('bgm', enable);
        }

        function toggleSfxAudio(enable) {
            if (window.n3dsAudio) {
                window.n3dsAudio.enabled = enable;
            }
            saveSetting('sfx', enable);
        }

        function saveSetting(key, val) {
            const current = JSON.parse(localStorage.getItem('retrohub_custom_settings') || '{}');
            current[key] = val;
            localStorage.setItem('retrohub_custom_settings', JSON.stringify(current));
        }

        function loadSavedSettings() {
            const saved = JSON.parse(localStorage.getItem('retrohub_custom_settings') || '{}');
            if (saved.blur !== undefined) {
                document.getElementById('inputBlurSlider').value = saved.blur;
                updateBlur(saved.blur);
            }
            if (saved.radius !== undefined) {
                document.getElementById('inputRadiusSlider').value = saved.radius;
                updateBorderRadius(saved.radius);
            }
            if (saved.crt) {
                document.getElementById('checkCrt').checked = true;
                toggleCrtScanlines(true);
            }
            if (saved.bgm) {
                document.getElementById('checkBgm').checked = true;
                toggleBgmMusic(true);
            }
        }

        // ========================================================
        // PASO 6: GESTIÓN DE PERFIL, CROPPER & P2P AMIGOS
        // ========================================================
        function switchTab(tabId) {
            if (window.n3dsAudio) window.n3dsAudio.play('move');
            document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

            const activeBtn = document.getElementById(`tab-btn-${tabId}`);
            const activeTab = document.getElementById(`tab-${tabId}`);

            if (activeBtn) activeBtn.classList.add('active');
            if (activeTab) activeTab.classList.add('active');
        }

        function loadProfile() {
            const saved = localStorage.getItem('retrohub_full_profile');
            if (saved) {
                try {
                    userProfile = { ...userProfile, ...JSON.parse(saved) };
                } catch(e) {}
            }

            document.getElementById('inputDisplayName').value = userProfile.displayName;
            document.getElementById('inputHandle').value = userProfile.handle;
            document.getElementById('inputBio').value = userProfile.bio;

            updateIdentityPreview();
            updateBioCounter(document.getElementById('inputBio'));

            if (userProfile.avatarUrl) {
                document.getElementById('avatarImage').src = userProfile.avatarUrl;
                document.getElementById('avatarImage').style.display = 'block';
                document.getElementById('avatarFallback').style.display = 'none';
                document.getElementById('headerAvatar').src = userProfile.avatarUrl;
            } else {
                generateDynamicInitials();
            }

            if (userProfile.bannerUrl) {
                document.getElementById('bannerImage').src = userProfile.bannerUrl;
            }

            renderFavoritesShowcase();
            setupCanvasCropEvents();
        }

        function generateDynamicInitials() {
            const name = userProfile.displayName.trim() || "Retro Player";
            const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() || "SA";
            const fallback = document.getElementById('avatarFallback');
            fallback.textContent = initials;
            fallback.style.display = 'flex';
            document.getElementById('avatarImage').style.display = 'none';
        }

        function updateIdentityPreview() {
            const dn = document.getElementById('inputDisplayName').value.trim() || "Sara";
            const h = document.getElementById('inputHandle').value.trim() || "saragamer";

            document.getElementById('previewDisplayName').textContent = dn;
            document.getElementById('previewHandle').textContent = "@" + h.replace("@", "");
            document.getElementById('headerUsername').textContent = dn;
        }

        function updateBioCounter(textarea) {
            document.getElementById('bioCounter').textContent = `${textarea.value.length} / 300`;
        }

        function validateHandle(input) {
            input.value = input.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
            updateIdentityPreview();
        }

        // CANVAS CROPPER
        function openCropModal(evt, mode) {
            const file = evt.target.files[0];
            if (!file) return;

            currentCropMode = mode;
            document.getElementById('cropModalTitle').textContent = mode === 'avatar' ? 'Recortar Avatar (1:1)' : 'Ajustar Banner (16:9)';

            const reader = new FileReader();
            reader.onload = (e) => {
                cropImageObj.onload = () => {
                    cropState.scale = 1;
                    cropState.x = 0;
                    cropState.y = 0;
                    document.getElementById('cropZoomSlider').value = 1;
                    document.getElementById('cropModal').style.display = 'flex';
                    renderCropCanvas();
                };
                cropImageObj.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function closeCropModal() {
            document.getElementById('cropModal').style.display = 'none';
        }

        function renderCropCanvas() {
            const canvas = document.getElementById('cropCanvas');
            const ctx = canvas.getContext('2d');
            const wrapper = canvas.parentElement;

            canvas.width = wrapper.clientWidth;
            canvas.height = wrapper.clientHeight;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const zoom = parseFloat(document.getElementById('cropZoomSlider').value);
            const aspect = currentCropMode === 'avatar' ? 1 : 16 / 9;

            let targetW = canvas.width * 0.8;
            let targetH = targetW / aspect;
            if (targetH > canvas.height * 0.8) {
                targetH = canvas.height * 0.8;
                targetW = targetH * aspect;
            }

            const targetX = (canvas.width - targetW) / 2;
            const targetY = (canvas.height - targetH) / 2;

            const baseScale = Math.max(targetW / cropImageObj.width, targetH / cropImageObj.height);
            const imgW = cropImageObj.width * baseScale * zoom;
            const imgH = cropImageObj.height * baseScale * zoom;

            ctx.drawImage(cropImageObj, targetX + cropState.x, targetY + cropState.y, imgW, imgH);

            // Máscara oscura
            ctx.fillStyle = "rgba(15, 23, 42, 0.65)";
            ctx.fillRect(0, 0, canvas.width, targetY);
            ctx.fillRect(0, targetY + targetH, canvas.width, canvas.height - (targetY + targetH));
            ctx.fillRect(0, targetY, targetX, targetH);
            ctx.fillRect(targetX + targetW, targetY, canvas.width - (targetX + targetW), targetH);

            // Marco guía
            ctx.strokeStyle = "#ff4757";
            ctx.lineWidth = 3;
            if (currentCropMode === 'avatar') {
                ctx.beginPath();
                ctx.arc(canvas.width / 2, canvas.height / 2, targetW / 2, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.strokeRect(targetX, targetY, targetW, targetH);
            }
        }

        function setupCanvasCropEvents() {
            const canvas = document.getElementById('cropCanvas');
            if (!canvas) return;

            canvas.onmousedown = (e) => {
                cropState.isDragging = true;
                cropState.startX = e.clientX - cropState.x;
                cropState.startY = e.clientY - cropState.y;
            };

            window.addEventListener('mousemove', (e) => {
                if (!cropState.isDragging) return;
                cropState.x = e.clientX - cropState.startX;
                cropState.y = e.clientY - cropState.startY;
                renderCropCanvas();
            });

            window.addEventListener('mouseup', () => { cropState.isDragging = false; });
        }

        function applyCroppedImage() {
            const canvas = document.getElementById('cropCanvas');
            const dataUrl = canvas.toDataURL("image/webp", 0.9);

            if (currentCropMode === 'avatar') {
                userProfile.avatarUrl = dataUrl;
                document.getElementById('avatarImage').src = dataUrl;
                document.getElementById('avatarImage').style.display = 'block';
                document.getElementById('avatarFallback').style.display = 'none';
                document.getElementById('headerAvatar').src = dataUrl;
            } else {
                userProfile.bannerUrl = dataUrl;
                document.getElementById('bannerImage').src = dataUrl;
            }

            closeCropModal();
            if (window.n3dsAudio) window.n3dsAudio.play('favorite');
        }

        function handleGameSearch(val) {
            clearTimeout(searchDebounceTimer);
            const q = val.trim();
            if (q.length < 2) return;

            searchDebounceTimer = setTimeout(() => {
                const sampleGames = [
                    { id: "sm64", title: "Super Mario 64", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png" },
                    { id: "oot", title: "Zelda Ocarina of Time", cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2579.png" },
                    { id: "pmario", title: "Paper Mario", cover: "ROMS/covers/papermario.png" },
                    { id: "anguna", title: "Anguna", cover: "ROMS/covers/anguna_box.png" }
                ];
                const matched = sampleGames.filter(g => g.title.toLowerCase().includes(q.toLowerCase()));
                if (matched.length > 0) {
                    addGameToFavorites(matched[0]);
                }
            }, 300);
        }

        function addGameToFavorites(game) {
            if (userProfile.favoriteGames.length >= 5) {
                alert("Límite de 5 juegos favoritos alcanzado.");
                return;
            }
            if (userProfile.favoriteGames.some(g => g.id === game.id)) return;

            userProfile.favoriteGames.push(game);
            renderFavoritesShowcase();
            if (window.n3dsAudio) window.n3dsAudio.play('favorite');
        }

        function removeFavorite(idx, evt) {
            evt.stopPropagation();
            userProfile.favoriteGames.splice(idx, 1);
            renderFavoritesShowcase();
            if (window.n3dsAudio) window.n3dsAudio.play('cancel');
        }

        function renderFavoritesShowcase() {
            const container = document.getElementById('favoritesShowcase');
            container.innerHTML = '';

            for (let i = 0; i < 5; i++) {
                const game = userProfile.favoriteGames[i];
                const slot = document.createElement('div');
                slot.className = 'showcase-slot';

                if (game) {
                    slot.innerHTML = `
                        <img src="${game.cover}" class="slot-cover-img" title="${game.title}" onerror="this.src='assets/consoles/n64.png'">
                        <button class="slot-remove-btn" onclick="removeFavorite(${i}, event)">✕</button>
                    `;
                } else {
                    slot.innerHTML = `
                        <div style="font-size: 22px; color: rgba(0,0,0,0.25);">+</div>
                        <div style="font-size: 10px; font-weight: 700; color: #94a3b8; margin-top: 4px;">SLOT ${i+1}</div>
                    `;
                    slot.onclick = () => document.getElementById('gameSearchInput').focus();
                }
                container.appendChild(slot);
            }
        }

        function saveCompleteProfile() {
            userProfile.displayName = document.getElementById('inputDisplayName').value.trim() || "Sara";
            userProfile.handle = document.getElementById('inputHandle').value.trim() || "saragamer";
            userProfile.bio = document.getElementById('inputBio').value.trim();

            localStorage.setItem('retrohub_full_profile', JSON.stringify(userProfile));
            updateIdentityPreview();

            if (window.n3dsAudio) window.n3dsAudio.play('launch');
            alert("¡Perfil guardado correctamente!");
        }

        // BLINKIES
        function loadBlinkies() {
            const saved = localStorage.getItem('retrohub_blinkies');
            if (saved) {
                try {
                    const list = JSON.parse(saved);
                    const container = document.getElementById('blinkiesContainer');
                    list.forEach(url => {
                        const img = document.createElement('img');
                        img.src = url;
                        img.className = 'blinky-badge';
                        container.appendChild(img);
                    });
                } catch(e) {}
            }
        }

        function addNewBlinky() {
            const url = prompt("Introduce la URL del GIF pixel para tu nuevo blinky:");
            if (url) {
                const container = document.getElementById('blinkiesContainer');
                const img = document.createElement('img');
                img.src = url;
                img.className = 'blinky-badge';
                container.appendChild(img);

                const current = JSON.parse(localStorage.getItem('retrohub_blinkies') || '[]');
                current.push(url);
                localStorage.setItem('retrohub_blinkies', JSON.stringify(current));
            }
        }

        // PEERJS CHAT P2P
        function initPeerJS() {
            const myUsername = localStorage.getItem('retrohub_username') || 'Sara' + Math.floor(Math.random()*1000);
            const peerId = 'RHUB-' + myUsername.replace(/[^a-zA-Z0-9]/g, '');

            try {
                peer = new Peer(peerId);
                peer.on('open', (id) => {
                    document.getElementById('myPeerId').textContent = id;
                });
                peer.on('connection', (conn) => {
                    peerConnection = conn;
                    setupChat();
                });
                peer.on('error', () => {
                    peer = new Peer();
                    peer.on('open', (id) => {
                        document.getElementById('myPeerId').textContent = id;
                    });
                });
            } catch(e) {}
        }

        function connectToPeerPrompt() {
            const friendId = prompt("Introduce el ID P2P de tu amigo (ejemplo: RHUB-Carlos):");
            if (friendId && peer) {
                peerConnection = peer.connect(friendId);
                setupChat();
                document.getElementById('chatActiveFriend').textContent = friendId;
            }
        }

        function setupChat() {
            if (!peerConnection) return;
            peerConnection.on('data', (data) => {
                appendChatMessage(peerConnection.peer, data);
                if (window.n3dsAudio) window.n3dsAudio.play('favorite');
            });
        }

        function sendChatMessage() {
            const input = document.getElementById('chatInput');
            const msg = input.value.trim();
            if (!msg) return;

            appendChatMessage('me', msg);
            if (peerConnection && peerConnection.open) {
                peerConnection.send(msg);
            }
            input.value = '';
            if (window.n3dsAudio) window.n3dsAudio.play('move');
        }

        function appendChatMessage(sender, text) {
            const box = document.getElementById('chatMessages');
            const bubble = document.createElement('div');
            bubble.style.maxWidth = '70%';
            bubble.style.padding = '10px 16px';
            bubble.style.borderRadius = '18px';
            bubble.style.fontSize = '13px';

            if (sender === 'me') {
                bubble.style.alignSelf = 'flex-end';
                bubble.style.background = 'var(--primary)';
                bubble.style.color = 'white';
            } else {
                bubble.style.alignSelf = 'flex-start';
                bubble.style.background = 'var(--iisu-pill-bg)';
                bubble.style.color = 'var(--text-main)';
            }
            bubble.textContent = text;
            box.appendChild(bubble);
            box.scrollTop = box.scrollHeight;
        }

        // RELOJ
        function updateLiveClock() {
            const now = new Date();
            let hours = now.getHours();
            const minutes = now.getMinutes().toString().padStart(2, '0');
            const timeStr = `${hours.toString().padStart(2, '0')}:${minutes}`;
            
            const clock1 = document.getElementById('clockTimeText');
            if (clock1) clock1.textContent = timeStr;
            const clock2 = document.getElementById('gameviewClockText');
            if (clock2) clock2.textContent = timeStr;
        }
    </script>
</body>
</html>
"""

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_code)

print("Generated index.html successfully! Size:", len(html_code))
