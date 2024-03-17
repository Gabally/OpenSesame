from gevent.pywsgi import WSGIServer
from app import app
from os import environ as enviroment_variables

listening_port = int(enviroment_variables.get("PORT", "5000"))

print("Starting server on port %s" % (listening_port))
http_server = WSGIServer(("", listening_port), app)
http_server.serve_forever()