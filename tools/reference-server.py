"""Loopback-only preview and bounded capture endpoint. Root and output are explicit."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import pathlib,sys,re
root=pathlib.Path(sys.argv[1]).resolve(); output=pathlib.Path(sys.argv[2]).resolve()
class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(root),**kwargs)
    def do_POST(self):
        if not re.fullmatch(r'/capture/(timeline|riff|song)\.(wav|json)',self.path):
            self.send_error(404); return
        n=int(self.headers.get('Content-Length',0))
        if n<1 or n>20_000_000: self.send_error(413); return
        output.mkdir(parents=True,exist_ok=True)
        (output/self.path.split('/')[-1]).write_bytes(self.rfile.read(n))
        self.send_response(200); self.end_headers(); self.wfile.write(b'Saved')
ThreadingHTTPServer(('127.0.0.1',8767),Handler).serve_forever()
