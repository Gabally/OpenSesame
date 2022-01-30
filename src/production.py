from gevent.pywsgi import WSGIServer
from app import app
from dotenv_config import Config

config = Config()

print("Starting server on port %s" % (config("PORT")))
http_server = WSGIServer(("", config("PORT", int)), app)
http_server.serve_forever()