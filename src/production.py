from gevent.pywsgi import WSGIServer
from app import app

print("Starting server on port 5000")
http_server = WSGIServer(("", 5000), app)
http_server.serve_forever()