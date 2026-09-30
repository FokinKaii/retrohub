import urllib.request
import urllib.parse
import os

HARDWARE_FILES = {
    "n64": "N64-Console-Set.png",
    "gba": "Game-Boy-Advance-Console-FL.png",
    "snes": "SNES-Mod1-Console-FL.png",
    "nes": "NES-Console-Set.png",
    "genesis": "Sega-Genesis-Mod2-Set.png",
    "ps1": "PlayStation-Console-wController.png",
    "psp": "Sony-PSP-1000-Body.png",
    "gbc": "Nintendo-Game-Boy-Color-FL.png",
    "nds": "Nintendo-DS-Lite-Black-Open.png",
    "sms": "Sega-Master-System-Set.png",
    "atari": "Atari-2600-Wood-4Sw-Set.png",
    "pce": "PC-Engine-CoreGrafx-Set.png",
    "virtualboy": "Virtual-Boy-Set.png",
    "arcade": "Neo-Geo-AES-Console-Set.png"
}

os.makedirs("assets/consoles_hires", exist_ok=True)

for cid, filename in HARDWARE_FILES.items():
    url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{urllib.parse.quote(filename)}?width=800"
    dest = os.path.join("assets", "consoles_hires", f"{cid}.png")
    
    if os.path.exists(dest) and os.path.getsize(dest) > 5000:
        print(f"[CACHE] {cid}: {dest} ({os.path.getsize(dest)} bytes)")
        continue
        
    req = urllib.request.Request(url, headers={'User-Agent': 'RetroHubApp/1.0 (contact: info@retrohub.org)'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = resp.read()
            if len(data) > 5000:
                with open(dest, "wb") as f:
                    f.write(data)
                print(f"[OK] Downloaded {cid} -> {len(data)} bytes")
            else:
                print(f"[WARN] {cid} response too small: {len(data)} bytes")
    except Exception as e:
        print(f"[ERROR] {cid}: {e}")

print("Hardware photos download complete!")
