#!/usr/bin/env python3
import http.server
import socketserver
import os
import webbrowser
import threading
import sys
import json
import socket

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
            
            roms_dir = os.path.join(DIRECTORY, 'ROMS')
            resultado = {}
            if os.path.isdir(roms_dir):
                for sistema in os.listdir(roms_dir):
                    sis_path = os.path.join(roms_dir, sistema)
                    if os.path.isdir(sis_path):
                        resultado[sistema] = []
                        for root, _, files in os.walk(sis_path):
                            for f in files:
                                if not f.startswith('.'):
                                    rel_path = os.path.relpath(os.path.join(root, f), DIRECTORY).replace('\\', '/')
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
    socketserver.TCPServer.allow_reuse_address = True
    ips = obtener_ips_locales()
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
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
