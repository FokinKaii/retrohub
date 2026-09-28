import os
import json

base_dir = os.path.dirname(os.path.abspath(__file__))
roms_dir = os.path.join(base_dir, "ROMS")

consolas = ["arcade", "atari2600", "gb", "gba", "n64", "nds", "nes", "psp", "psx", "segaMD", "snes"]
catalogo = {c: [] for c in consolas}

if os.path.exists(roms_dir):
    for c in consolas:
        subdir = os.path.join(roms_dir, c)
        if os.path.exists(subdir):
            for archivo in os.listdir(subdir):
                if archivo.startswith(".") or archivo.endswith(".json"):
                    continue
                ruta_relativa = f"ROMS/{c}/{archivo}"
                titulo = os.path.splitext(archivo)[0]
                catalogo[c].append({
                    "titulo": titulo,
                    "archivo": ruta_relativa,
                    "nombreArchivo": archivo
                })

cat_path = os.path.join(roms_dir, "catalogo.json")
with open(cat_path, "w", encoding="utf-8") as f:
    json.dump(catalogo, f, indent=2, ensure_ascii=False)

print(f"Catalogo actualizado correctamente en: {cat_path}")
