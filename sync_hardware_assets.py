#!/usr/bin/env python3
"""
RetroHub - Sincronizador Automático de Activos de Hardware Real
Descarga y cachea automáticamente renders fotorrealistas en alta resolución
(con canal alfa transparente) desde repositorios comunitarios abiertos
(Libretro, OpenVGDB, Wikimedia con User-Agent verificado).
"""

import os
import sys
import json
import urllib.request
import urllib.error
import argparse

if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONSOLES_DIR = os.path.join(BASE_DIR, 'assets', 'consoles')
WALLPAPERS_DIR = os.path.join(BASE_DIR, 'assets', 'wallpapers')

# Catálogo oficial de consolas con fuentes redundantes de alta fidelidad
COMMUNITY_HARDWARE_SOURCES = {
    "n64": {
        "filename": "n64.png",
        "name": "Nintendo 64",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Nintendo%20-%20Nintendo%2064.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/N64-Console-Set.png/640px-N64-Console-Set.png"
    },
    "gba": {
        "filename": "gba.png",
        "name": "Game Boy Advance",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Nintendo%20-%20Game%20Boy%20Advance.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Nintendo-Game-Boy-Advance-Purple-FL.png/640px-Nintendo-Game-Boy-Advance-Purple-FL.png"
    },
    "snes": {
        "filename": "snes.png",
        "name": "Super Nintendo (SNES)",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Nintendo%20-%20Super%20Nintendo%20Entertainment%20System.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/SNES-Mod1-Console-Set.png/640px-SNES-Mod1-Console-Set.png"
    },
    "nes": {
        "filename": "nes.png",
        "name": "Nintendo NES",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Nintendo%20-%20Nintendo%20Entertainment%20System.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/NES-Console-Set.png/640px-NES-Console-Set.png"
    },
    "nds": {
        "filename": "nds.png",
        "name": "Nintendo DS",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Nintendo%20-%20Nintendo%20DS.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Nintendo-DS-Lite-Black-Open.png/640px-Nintendo-DS-Lite-Black-Open.png"
    },
    "gbc": {
        "filename": "gbc.png",
        "name": "Game Boy Color",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Nintendo%20-%20Game%20Boy%20Color.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Nintendo-Game-Boy-Color-FL.png/640px-Nintendo-Game-Boy-Color-FL.png"
    },
    "virtualboy": {
        "filename": "virtualboy.png",
        "name": "Nintendo Virtual Boy",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Nintendo%20-%20Virtual%20Boy.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Virtual-Boy-Set.png/640px-Virtual-Boy-Set.png"
    },
    "ps1": {
        "filename": "ps1.png",
        "name": "PlayStation 1",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Sony%20-%20PlayStation.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/PSX-Console-wController.png/640px-PSX-Console-wController.png"
    },
    "psp": {
        "filename": "psp.png",
        "name": "PlayStation Portable",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Sony%20-%20PlayStation%20Portable.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/PlayStation-Portable-PSP-1000-FL.png/640px-PlayStation-Portable-PSP-1000-FL.png"
    },
    "genesis": {
        "filename": "genesis.png",
        "name": "Sega Genesis / Mega Drive",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Sega%20-%20Mega%20Drive%20-%20Genesis.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Sega-Genesis-Mod2-Bare.png/640px-Sega-Genesis-Mod2-Bare.png"
    },
    "sms": {
        "filename": "sms.png",
        "name": "Sega Master System",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Sega%20-%20Master%20System%20-%20Mark%20III.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Sega-Master-System-Set.png/640px-Sega-Master-System-Set.png"
    },
    "arcade": {
        "filename": "arcade.png",
        "name": "Arcade MAME",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/FB%20Alpha%20-%20Arcade%20Games.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Arcade-Cabinet.png/640px-Arcade-Cabinet.png"
    },
    "atari": {
        "filename": "atari.png",
        "name": "Atari 2600",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/Atari%20-%202600.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Atari-2600-Wood-4Sw-Set.png/640px-Atari-2600-Wood-4Sw-Set.png"
    },
    "pce": {
        "filename": "pce.png",
        "name": "PC Engine / TurboGrafx-16",
        "primary_url": "https://raw.githubusercontent.com/libretro/retroarch-assets/master/xmb/monochrome/png/NEC%20-%20PC%20Engine%20-%20TurboGrafx%2016.png",
        "fallback_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/TurboGrafx16-Console-Set.png/640px-TurboGrafx16-Console-Set.png"
    }
}

HEADERS = {
    'User-Agent': 'RetroHubLauncher/2.0 (Windows NT 10.0; Win64; x64) RetroHub/2.0 AssetSync/1.0'
}

def sync_hardware_assets(force_download=False):
    os.makedirs(CONSOLES_DIR, exist_ok=True)
    report = {"synced": [], "cached": [], "failed": []}

    print("════════════════════════════════════════════════════════════════")
    print(" 🕹️ RETROHUB - Sincronizador de Imágenes Reales de Consolas")
    print("════════════════════════════════════════════════════════════════")

    for system_id, data in COMMUNITY_HARDWARE_SOURCES.items():
        dest_path = os.path.join(CONSOLES_DIR, data['filename'])
        exists = os.path.exists(dest_path) and os.path.getsize(dest_path) > 500

        if exists and not force_download:
            print(f" [CACHE OK] {data['name']} -> {data['filename']} ({os.path.getsize(dest_path)} bytes)")
            report["cached"].append(system_id)
            continue

        print(f" [DESCARGANDO] {data['name']}...")
        success = False

        for url in [data["primary_url"], data["fallback_url"]]:
            try:
                req = urllib.request.Request(url, headers=HEADERS)
                with urllib.request.urlopen(req, timeout=12) as response:
                    content = response.read()
                    if len(content) > 500:
                        with open(dest_path, 'wb') as f:
                            f.write(content)
                        print(f"   ✓ Éxito desde: {url[:60]}... ({len(content)} bytes)")
                        report["synced"].append(system_id)
                        success = True
                        break
            except Exception as e:
                print(f"   ✗ Fallo con {url[:50]}: {e}")

        if not success:
            if exists:
                print(f"   ! Se conserva copia local existente para {system_id}")
                report["cached"].append(system_id)
            else:
                print(f"   ❌ No se pudo descargar imagen para {system_id}")
                report["failed"].append(system_id)

    print("────────────────────────────────────────────────────────────────")
    print(f" Resumen: {len(report['cached'])} en caché | {len(report['synced'])} descargadas | {len(report['failed'])} fallidas")
    print("════════════════════════════════════════════════════════════════\n")
    return report

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Sincronizador de Activos de Hardware Real para RetroHub")
    parser.add_argument('--force', action='store_true', help="Forzar la descarga sobreescribiendo la caché local")
    args = parser.parse_args()

    sync_hardware_assets(force_download=args.force)
