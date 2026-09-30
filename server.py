#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
import threading
import sys
import json
import socket
import sqlite3

PORT = 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def obtener_ips_locales():
    ips = []
    try:
        _, _, all_ips = socket.gethostbyname_ex(socket.gethostname())
        for ip in all_ips:
            if not ip.startswith('127.') and not ip.startswith('192.168.56.'):
                ips.append(ip)
    except:
        pass
    return ips or ['127.0.0.1']

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/api/roms':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            cat_file = os.path.join(DIRECTORY, 'ROMS', 'catalogo.json')
            resultado = {}
            if os.path.exists(cat_file):
                try:
                    with open(cat_file, 'r', encoding='utf-8') as f:
                        resultado = json.load(f)
                except Exception:
                    resultado = {}

            roms_dir = os.path.join(DIRECTORY, 'ROMS')
            if os.path.isdir(roms_dir):
                for sistema in os.listdir(roms_dir):
                    if sistema in ['consoles', 'cartridges', 'covers']:
                        continue
                    sis_path = os.path.join(roms_dir, sistema)
                    if os.path.isdir(sis_path):
                        if sistema not in resultado:
                            resultado[sistema] = []
                        archivos_existentes = {j.get('archivo', '').replace('\\', '/') for j in resultado[sistema]}
                        for root, _, files in os.walk(sis_path):
                            for f in files:
                                if not f.startswith('.'):
                                    rel_path = os.path.relpath(os.path.join(root, f), DIRECTORY).replace('\\', '/')
                                    if rel_path not in archivos_existentes:
                                        nombre = os.path.splitext(f)[0]
                                        resultado[sistema].append({
                                            'titulo': nombre,
                                            'archivo': rel_path,
                                            'nombreArchivo': f
                                        })
            self.wfile.write(json.dumps(resultado, ensure_ascii=False).encode('utf-8'))
            return

        if self.path == '/api/network':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            info = {
                'ips': obtener_ips_locales(),
                'port': PORT
            }
            self.wfile.write(json.dumps(info).encode('utf-8'))
            return
        
        if self.path.startswith('/api/games/search'):
            import urllib.parse
            query_params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            q = query_params.get('query', [''])[0].strip().lower()

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()

            if len(q) < 2:
                self.wfile.write(json.dumps({'results': []}).encode('utf-8'))
                return

            db_path = os.path.join(DIRECTORY, 'retrohub_games_cache.db')
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            cur.execute("CREATE TABLE IF NOT EXISTS games_cache (query TEXT PRIMARY KEY, response_json TEXT, cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
            cur.execute("SELECT response_json FROM games_cache WHERE query = ?", (q,))
            row = cur.fetchone()

            if row:
                conn.close()
                self.wfile.write(row[0].encode('utf-8'))
                return

            # Rich catalog of classic retro games with HD covers
            CATALOG_RETRO = [
                {"id": "sm64", "title": "Super Mario 64", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png", "year": "1996", "platform": "Nintendo 64"},
                {"id": "oot", "title": "The Legend of Zelda: Ocarina of Time", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2579.png", "year": "1998", "platform": "Nintendo 64"},
                {"id": "mgs", "title": "Metal Gear Solid", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1w6g.png", "year": "1998", "platform": "PlayStation 1"},
                {"id": "poke_emerald", "title": "Pokémon Emerald", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r7d.png", "year": "2004", "platform": "Game Boy Advance"},
                {"id": "chrono", "title": "Chrono Trigger", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1v2n.png", "year": "1995", "platform": "Super Nintendo"},
                {"id": "smw", "title": "Super Mario World", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png", "year": "1990", "platform": "Super Nintendo"},
                {"id": "sonic2", "title": "Sonic the Hedgehog 2", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2044.png", "year": "1992", "platform": "Sega Genesis"},
                {"id": "castlevania_sotn", "title": "Castlevania: Symphony of the Night", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1w1j.png", "year": "1997", "platform": "PlayStation 1"},
                {"id": "metroid_fusion", "title": "Metroid Fusion", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8c.png", "year": "2002", "platform": "Game Boy Advance"},
                {"id": "zelda_minish", "title": "The Legend of Zelda: The Minish Cap", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1r8h.png", "year": "2004", "platform": "Game Boy Advance"},
                {"id": "ff7", "title": "Final Fantasy VII", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co2040.png", "year": "1997", "platform": "PlayStation 1"},
                {"id": "mario_kart_ds", "title": "Mario Kart DS", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png", "year": "2005", "platform": "Nintendo DS"},
                {"id": "tekken3", "title": "Tekken 3", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1w6g.png", "year": "1998", "platform": "PlayStation 1"},
                {"id": "god_of_war_psp", "title": "God of War: Chains of Olympus", "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1w6g.png", "year": "2008", "platform": "PlayStation Portable"}
            ]

            results = [g for g in CATALOG_RETRO if q in g['title'].lower() or q in g['platform'].lower()]
            if not results:
                # Dynamic item based on query
                results = [{
                    "id": f"custom-{hash(q)}",
                    "title": q.title(),
                    "cover": "https://images.igdb.com/igdb/image/upload/t_cover_big/co1vce.png",
                    "year": "Classic",
                    "platform": "Retro System"
                }]

            output = {'results': results}
            json_str = json.dumps(output, ensure_ascii=False)
            cur.execute("INSERT OR REPLACE INTO games_cache (query, response_json) VALUES (?, ?)", (q, json_str))
            conn.commit()
            conn.close()
            self.wfile.write(json_str.encode('utf-8'))
            return

        super().do_GET()

    def end_headers(self):
        # Cabeceras necesarias para WebAssembly, SharedArrayBuffer y multihilo en navegadores modernos
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def guess_type(self, path):
        mime = super().guess_type(path)
        if path.endswith('.wasm'):
            return 'application/wasm'
        if path.endswith('.data'):
            return 'application/octet-stream'
        return mime

def abrir_navegador():
    import time
    time.sleep(1)
    webbrowser.open(f'http://localhost:{PORT}/')

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    ips = obtener_ips_locales()
    
    with socketserver.ThreadingTCPServer(("", PORT), Handler) as httpd:
        print(f"==================================================")
        print(f"  RETROHUB - Servidor de Emuladores Activo")
        print(f"  URL Local:      http://localhost:{PORT}/")
        for ip in ips:
            print(f"  URL Red Local:  http://{ip}:{PORT}/ (Compartir con amigos)")
        print(f"  Pulsa Ctrl + C en esta ventana para detenerlo")
        print(f"==================================================")
        threading.Thread(target=abrir_navegador, daemon=True).start()
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor detenido.")
            sys.exit(0)
