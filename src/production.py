from gevent.pywsgi import WSGIServer
from app import app
from dotenv_config import Config

config = Config()

print("Starting server on port %s" % (config("PORT", default=5000)))
http_server = WSGIServer(("", config("PORT", conversion=int, default=5000)), app)
http_server.serve_forever()