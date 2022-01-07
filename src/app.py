from flask import Flask, render_template, request
from encryption import *
import os

DB_FILE_PATH = os.path.join(os.getcwd(), "Passwords.ejp")

def readDBFile():
    with open(DB_FILE_PATH, "rb") as fl:
        contents = fl.read()
        encoded= base64.b64encode(contents)
        return encoded.decode("utf-8")

app = Flask(__name__)

@app.route("/")
def index():
    if (authKeyExists()):
        return render_template("index.html")
    else:
        return render_template("setkey.html")

@app.route("/setkey", methods=["POST"])
def setkey():
    if (authKeyExists()):
        return {
            "success": False,
            "error": "The key is already set"
        }, 401
    else:
        body = request.get_json()
        if (body["key"] and len(body["key"]) != 0):
            setKey(body["key"])
            return { "success": True }, 200
        else:
            return {
                "success": False,
                "error": "missing fields"
            }, 400

@app.route("/getdb", methods=["POST"])
def getdb():
    if (authKeyExists()):
        body = request.get_json()
        if (body["key"] and len(body["key"]) != 0 and verifyKey(body["key"])):
            try:
                return {
                    "success": True,
                    "db": readDBFile()
                }, 200
            except:
                return {
                    "success": False,
                    "error": "Could not read the db file"
                }, 200
        else:
            return {
                "success": False,
                "error": "Wrong fields"
            }, 401    
    else:
        return {
            "success": False,
            "error": "The key is not set, the password db cannot be returned"
        }, 401
    
if (__name__ == "__main__"):
    app.run(host="0.0.0.0", port=5000, debug=True)