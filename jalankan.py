#!/usr/bin/env python3
"""Jalankan website biodata supaya mudah dilihat di HP.

Cara pakai:
  A) Di komputer: jalankan `python jalankan.py`, lalu buka alamat "Di HP" yang tampil
     di browser HP (HP dan komputer harus satu Wi-Fi).
  B) Di HP langsung (Termux): `python jalankan.py`, lalu buka http://localhost:8000
Tekan Ctrl+C untuk berhenti. Tidak perlu install apa pun.
"""
import http.server, os, socket, socketserver, sys, webbrowser

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mp3": "audio/mpeg", ".webp": "image/webp"}

    def end_headers(self):
        # tanpa cache: setiap kali file diubah, tinggal muat ulang di HP
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *a):
        pass


def ip_lokal():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    except OSError:
        return None
    finally:
        s.close()


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


for p in range(PORT, PORT + 20):
    try:
        srv = Server(("0.0.0.0", p), Handler)
        break
    except OSError:
        continue
else:
    sys.exit("Semua port 8000-8019 terpakai. Coba: python jalankan.py 9000")

ip = ip_lokal()
url_hp = f"http://{ip}:{p}" if ip else None
print("\n  Website biodata berjalan\n")
print(f"  Di komputer / Termux : http://localhost:{p}")
if url_hp:
    print(f"  Di HP (satu Wi-Fi)   : {url_hp}")
    try:  # kode QR bila modul qrcode terpasang (pip install qrcode)
        import qrcode
        q = qrcode.QRCode(border=1)
        q.add_data(url_hp)
        q.print_ascii(invert=True)
    except Exception:
        pass
print("\n  Tekan Ctrl+C untuk berhenti.\n")
try:
    webbrowser.open(f"http://localhost:{p}")
except Exception:
    pass
try:
    srv.serve_forever()
except KeyboardInterrupt:
    print("\n  Berhenti.")
