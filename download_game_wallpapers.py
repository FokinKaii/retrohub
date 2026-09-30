import urllib.request
import urllib.parse
import os
import json

BASE_URL = "https://raw.githubusercontent.com/libretro/libretro-thumbnails/master/"

GAMES_MAP = {
    "n64": [
        ("Nintendo%20-%20Nintendo%2064/Named_Snaps/Super%20Mario%2064%20(USA).png", "sm64.png"),
        ("Nintendo%20-%20Nintendo%2064/Named_Snaps/Legend%20of%20Zelda,%20The%20-%20Ocarina%20of%20Time%20(USA).png", "oot.png"),
        ("Nintendo%20-%20Nintendo%2064/Named_Snaps/Paper%20Mario%20(USA).png", "papermario.png"),
        ("Nintendo%20-%20Nintendo%2064/Named_Snaps/Mario%20Kart%2064%20(USA).png", "mariokart64.png")
    ],
    "gba": [
        ("Nintendo%20-%20Game%20Boy%20Advance/Named_Snaps/Pokemon%20-%20Emerald%20Version%20(USA,%20Europe).png", "pokemon_emerald.png"),
        ("Nintendo%20-%20Game%20Boy%20Advance/Named_Snaps/Legend%20of%20Zelda,%20The%20-%20The%20Minish%20Cap%20(USA).png", "minish_cap.png"),
        ("Nintendo%20-%20Game%20Boy%20Advance/Named_Snaps/Metroid%20Fusion%20(USA).png", "metroid_fusion.png"),
        ("Nintendo%20-%20Game%20Boy%20Advance/Named_Snaps/Golden%20Sun%20(USA).png", "golden_sun.png")
    ],
    "snes": [
        ("Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/Named_Snaps/Super%20Mario%20World%20(USA).png", "smw.png"),
        ("Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/Named_Snaps/Chrono%20Trigger%20(USA).png", "chrono.png"),
        ("Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/Named_Snaps/Donkey%20Kong%20Country%20(USA).png", "dkc.png"),
        ("Nintendo%20-%20Super%20Nintendo%20Entertainment%20System/Named_Snaps/Super%20Metroid%20(Japan,%20USA)%20(En,Ja).png", "super_metroid.png")
    ],
    "nes": [
        ("Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/Super%20Mario%20Bros.%203%20(USA).png", "smb3.png"),
        ("Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/Legend%20of%20Zelda,%20The%20(USA).png", "zelda1.png"),
        ("Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/Mega%20Man%202%20(USA).png", "megaman2.png"),
        ("Nintendo%20-%20Nintendo%20Entertainment%20System/Named_Snaps/Castlevania%20(USA).png", "castlevania.png")
    ],
    "genesis": [
        ("Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Snaps/Sonic%20The%20Hedgehog%202%20(World).png", "sonic2.png"),
        ("Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Snaps/Streets%20of%20Rage%202%20(USA).png", "sor2.png"),
        ("Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Snaps/Gunstar%20Heroes%20(USA).png", "gunstar.png"),
        ("Sega%20-%20Mega%20Drive%20-%20Genesis/Named_Snaps/Shinobi%20III%20-%20Return%20of%20the%20Ninja%20Master%20(USA).png", "shinobi3.png")
    ],
    "ps1": [
        ("Sony%20-%20PlayStation/Named_Snaps/Crash%20Bandicoot%20(USA).png", "crash1.png"),
        ("Sony%20-%20PlayStation/Named_Snaps/Metal%20Gear%20Solid%20(USA)%20(Disc%201).png", "mgs.png"),
        ("Sony%20-%20PlayStation/Named_Snaps/Castlevania%20-%20Symphony%20of%20the%20Night%20(USA).png", "sotn.png"),
        ("Sony%20-%20PlayStation/Named_Snaps/Tekken%203%20(USA).png", "tekken3.png")
    ],
    "psp": [
        ("Sony%20-%20PlayStation%20Portable/Named_Snaps/God%20of%20War%20-%20Ghost%20of%20Sparta%20(USA).png", "gow.png"),
        ("Sony%20-%20PlayStation%20Portable/Named_Snaps/Persona%203%20Portable%20(USA).png", "p3p.png"),
        ("Sony%20-%20PlayStation%20Portable/Named_Snaps/Crisis%20Core%20-%20Final%20Fantasy%20VII%20(USA).png", "crisis_core.png")
    ],
    "arcade": [
        ("FBNeo%20-%20Arcade%20Games/Named_Snaps/sf2ce.png", "sf2ce.png"),
        ("FBNeo%20-%20Arcade%20Games/Named_Snaps/mslug.png", "mslug.png"),
        ("FBNeo%20-%20Arcade%20Games/Named_Snaps/pacman.png", "pacman.png")
    ],
    "gbc": [
        ("Nintendo%20-%20Game%20Boy%20Color/Named_Snaps/Pokemon%20-%20Crystal%20Version%20(USA,%20Europe).png", "pokemon_crystal.png"),
        ("Nintendo%20-%20Game%20Boy%20Color/Named_Snaps/Legend%20of%20Zelda,%20The%20-%20Oracle%20of%20Ages%20(USA).png", "oracle_ages.png"),
        ("Nintendo%20-%20Game%20Boy%20Color/Named_Snaps/Wario%20Land%203%20(World)%20(En,Ja).png", "wario3.png")
    ],
    "nds": [
        ("Nintendo%20-%20Nintendo%20DS/Named_Snaps/Mario%20Kart%20DS%20(USA).png", "mariokart_ds.png"),
        ("Nintendo%20-%20Nintendo%20DS/Named_Snaps/New%20Super%20Mario%20Bros.%20(USA).png", "nsmb.png"),
        ("Nintendo%20-%20Nintendo%20DS/Named_Snaps/Pokemon%20-%20Platinum%20Version%20(USA).png", "pokemon_plat.png")
    ],
    "sms": [
        ("Sega%20-%20Master%20System%20-%20Mark%20III/Named_Snaps/Alex%20Kidd%20in%20Miracle%20World%20(USA,%20Europe).png", "alexkidd.png"),
        ("Sega%20-%20Master%20System%20-%20Mark%20III/Named_Snaps/Sonic%20The%20Hedgehog%20(USA,%20Europe).png", "sonic_sms.png")
    ],
    "atari": [
        ("Atari%20-%202600/Named_Snaps/Space%20Invaders%20(USA).png", "space_invaders.png"),
        ("Atari%20-%202600/Named_Snaps/Pitfall!%20-%20Pitfall%20Harry's%20Jungle%20Adventure%20(USA).png", "pitfall.png")
    ],
    "pce": [
        ("NEC%20-%20PC%20Engine%20-%20TurboGrafx%2016/Named_Snaps/Akumajou%20Dracula%20X%20-%20Chi%20no%20Rondo%20(Japan).png", "rondo_blood.png"),
        ("NEC%20-%20PC%20Engine%20-%20TurboGrafx%2016/Named_Snaps/Bonk's%20Adventure%20(USA).png", "bonk.png")
    ],
    "virtualboy": [
        ("Nintendo%20-%20Virtual%20Boy/Named_Snaps/Virtual%20Boy%20Wario%20Land%20(USA).png", "wario_vb.png"),
        ("Nintendo%20-%20Virtual%20Boy/Named_Snaps/Mario's%20Tennis%20(USA).png", "mario_tennis.png")
    ]
}

os.makedirs("assets/game_wallpapers", exist_ok=True)
downloaded_manifest = {}

for console_id, items in GAMES_MAP.items():
    console_dir = os.path.join("assets", "game_wallpapers", console_id)
    os.makedirs(console_dir, exist_ok=True)
    downloaded_manifest[console_id] = []
    
    for remote_path, local_filename in items:
        local_path = os.path.join(console_dir, local_filename)
        url = BASE_URL + remote_path
        relative_url = f"assets/game_wallpapers/{console_id}/{local_filename}"
        
        if os.path.exists(local_path) and os.path.getsize(local_path) > 1000:
            print(f"[CACHE] {console_id}: {local_filename}")
            downloaded_manifest[console_id].append(relative_url)
            continue
            
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = resp.read()
                if len(data) > 1000:
                    with open(local_path, "wb") as f:
                        f.write(data)
                    print(f"[OK] Downloaded {console_id}: {local_filename} ({len(data)} bytes)")
                    downloaded_manifest[console_id].append(relative_url)
                else:
                    print(f"[SKIP] Too small {url}")
        except Exception as e:
            print(f"[ERROR] {url} -> {e}")

# Guardar manifest json
with open("assets/game_wallpapers/manifest.json", "w", encoding="utf-8") as f:
    json.dump(downloaded_manifest, f, indent=2)

print("Downloaded game wallpapers successfully!")
