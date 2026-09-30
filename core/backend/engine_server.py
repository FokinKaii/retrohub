#!/usr/bin/env python3
"""
RetroHub Engine Server - Motor Local Agnóstico de Alta Fidelidad
Soporte para:
- HTTP 206 Partial Content (Range Requests) para Streaming de Vídeo/Audio
- Watcher de Temas en tiempo real con Server-Sent Events (SSE) / Polling de Eventos
- Servidor de Assets Pesados (.mp4, .webm, .wav, .cur, .woff2)
- API REST para selección y recarga en caliente de temas
"""

import os
import sys
import json
import time
import mimetypes
import threading
import urllib.parse
from http.server import HTTPServer, SimpleHTTPRequestHandler
from socketserver import ThreadingMixIn

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # core/
WORKSPACE_DIR = os.path.dirname(BASE_DIR)                             # retrohub root
THEMES_DIR = os.path.join(BASE_DIR, 'themes')
PORT = 8085

# MIME types adicionales para assets de temas
mimetypes.add_type('video/mp4', '.mp4')
mimetypes.add_type('video/webm', '.webm')
mimetypes.add_type('audio/wav', '.wav')
mimetypes.add_type('audio/mpeg', '.mp3')
mimetypes.add_type('audio/ogg', '.ogg')
mimetypes.add_type('image/x-icon', '.cur')
mimetypes.add_type('font/woff2', '.woff2')
mimetypes.add_type('application/json', '.json')

class ThemeState:
    def __init__(self):
        self.active_theme_id = 'y2k_cyberia'
        self.last_modified = 0
        self.clients = []
        self.lock = threading.Lock()

    def get_active_theme_path(self):
        return os.path.join(THEMES_DIR, self.active_theme_id, 'theme.json')

    def load_active_theme(self):
        theme_path = self.get_active_theme_path()
        if os.path.exists(theme_path):
            with open(theme_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {"error": "Theme not found", "id": self.active_theme_id}

    def list_themes(self):
        themes = []
        if os.path.exists(THEMES_DIR):
            for folder in os.listdir(THEMES_DIR):
                theme_json = os.path.join(THEMES_DIR, folder, 'theme.json')
                if os.path.isfile(theme_json):
                    try:
                        with open(theme_json, 'r', encoding='utf-8') as f:
                            data = json.load(f)
                            themes.append({
                                "id": data.get("id", folder),
                                "name": data.get("name", folder),
                                "description": data.get("description", ""),
                                "author": data.get("author", ""),
                                "version": data.get("version", "1.0"),
                                "active": (folder == self.active_theme_id)
                            })
                    except Exception as e:
                        print(f"[Error leyendo tema {folder}]: {e}")
        return themes

    def set_theme(self, theme_id):
        theme_path = os.path.join(THEMES_DIR, theme_id, 'theme.json')
        if os.path.exists(theme_path):
            with self.lock:
                self.active_theme_id = theme_id
                self.last_modified = os.path.getmtime(theme_path)
            self.broadcast_event('theme_switched', self.load_active_theme())
            return True
        return False

    def broadcast_event(self, event_type, data):
        with self.lock:
            dead_clients = []
            for client_queue in self.clients:
                try:
                    client_queue.put({"event": event_type, "data": data})
                except Exception:
                    dead_clients.append(client_queue)
            for d in dead_clients:
                self.clients.remove(d)

theme_state = ThemeState()

class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

class EngineRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WORKSPACE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Range')
        self.send_header('Cross-Origin-Opener-Policy', 'same-origin')
        self.send_header('Cross-Origin-Embedder-Policy', 'require-corp')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        # 1. API: Listar temas
        if path == '/api/themes':
            themes = theme_state.list_themes()
            self.send_json_response(200, themes)
            return

        # 2. API: Obtener tema activo
        if path == '/api/theme/active':
            data = theme_state.load_active_theme()
            self.send_json_response(200, data)
            return

        # 3. API: Cambiar tema activo
        if path == '/api/theme/set':
            theme_id = query.get('id', [''])[0]
            if theme_state.set_theme(theme_id):
                self.send_json_response(200, {"success": True, "active": theme_id})
            else:
                self.send_json_response(404, {"success": False, "error": "Tema no encontrado"})
            return

        # 4. API: Streaming de Assets de Temas con Range Requests (HTTP 206)
        if path.startswith('/assets/themes/'):
            # Formato: /assets/themes/<theme_id>/...
            rel_path = path[len('/assets/themes/'):]
            full_path = os.path.join(THEMES_DIR, rel_path)
            if os.path.isfile(full_path):
                self.serve_media_with_ranges(full_path)
                return

        # Fallback estándar para el resto de archivos
        super().do_GET()

    def send_json_response(self, code, obj):
        data = json.dumps(obj, indent=2, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.end_headers()
        self.wfile.write(data)

    def serve_media_with_ranges(self, filepath):
        """Implementa RFC 7233 (HTTP 206 Partial Content) para vídeos y audios pesados"""
        file_size = os.path.getsize(filepath)
        range_header = self.headers.get('Range', None)
        content_type, _ = mimetypes.guess_type(filepath)
        if not content_type:
            content_type = 'application/octet-stream'

        if not range_header:
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()
            with open(filepath, 'rb') as f:
                self.copyfile(f, self.wfile)
            return

        try:
            byte_range = range_header.replace('bytes=', '').split('-')
            start = int(byte_range[0])
            end = int(byte_range[1]) if byte_range[1] else file_size - 1
            if start >= file_size or end >= file_size or start > end:
                self.send_response(416) # Range Not Satisfiable
                self.send_header('Content-Range', f'bytes */{file_size}')
                self.end_headers()
                return

            length = (end - start) + 1
            self.send_response(206)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Range', f'bytes {start}-{end}/{file_size}')
            self.send_header('Content-Length', str(length))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()

            with open(filepath, 'rb') as f:
                f.seek(start)
                bytes_to_send = length
                chunk_size = 64 * 1024
                while bytes_to_send > 0:
                    read_len = min(bytes_to_send, chunk_size)
                    data = f.read(read_len)
                    if not data:
                        break
                    self.wfile.write(data)
                    bytes_to_send -= len(data)
        except Exception as e:
            pass # Cliente desconectado durante streaming

def theme_file_watcher():
    """Vigila theme.json activo para Hot Module Reloading"""
    print("[Engine Watcher] Vigilando cambios en archivos de temas...")
    last_mtime = 0
    while True:
        try:
            path = theme_state.get_active_theme_path()
            if os.path.exists(path):
                current_mtime = os.path.getmtime(path)
                if last_mtime != 0 and current_mtime > last_mtime:
                    print(f"[Engine Watcher] ¡Tema modificado detectado!: {theme_state.active_theme_id}")
                    theme_state.broadcast_event('theme_updated', theme_state.load_active_theme())
                last_mtime = current_mtime
        except Exception as e:
            pass
        time.sleep(0.5)

def run_server():
    watcher_thread = threading.Thread(target=theme_file_watcher, daemon=True)
    watcher_thread.start()

    server = ThreadedHTTPServer(('0.0.0.0', PORT), EngineRequestHandler)
    print(f"============================================================")
    print(f" RETROHUB ENGINE SERVER - MOTOR AGNÓSTICO V1.0")
    print(f" Servidor activo en: http://localhost:{PORT}/")
    print(f" Directorio base: {WORKSPACE_DIR}")
    print(f" Temas instalados: {len(theme_state.list_themes())}")
    print(f"============================================================")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nApagando servidor...")
        server.shutdown()

if __name__ == '__main__':
    run_server()
