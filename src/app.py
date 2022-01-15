from datetime import datetime
from pydoc import cli
from flask import Flask, render_template, request
from hashing import *
import os, dropbox
from datetime import datetime

DB_FILE_PATH = os.path.join(os.getcwd(), "Passwords.ejp")
DPBX_TOKEN_FILE_PATH = os.path.join(os.getcwd(), "dpbxtoken.txt")

def readDBFile():
    if (not os.path.exists(DB_FILE_PATH)):
        return ""
    with open(DB_FILE_PATH, "r") as fl:
        return fl.read()

def writeDBFile(data):
    with open(DB_FILE_PATH, "w") as fl:
        fl.write(data)

def isValid(data):
    return data and len(data) > 0

def getDropBoxToken():
    if (os.path.exists(DPBX_TOKEN_FILE_PATH)):
        with open(DPBX_TOKEN_FILE_PATH, "r") as fl:
            return fl.read()
    else:
        return None

def setDropBoxToken(token):
    with open(DPBX_TOKEN_FILE_PATH, "w") as fl:
        fl.write(token)

app = Flask(__name__)

@app.route("/")
def index():
    if (authKeyExists()):
        return app.send_static_file("index.html")
    else:
        return app.send_static_file("setkey.html")

@app.route("/init", methods=["POST"])
def setkey():
    if (authKeyExists()):
        return {
            "success": False,
            "error": "The key is already set"
        }, 401
    else:
        body = request.get_json()
        if (isValid(body["key"]) and isValid(body["db"])):
            setKey(body["key"])
            writeDBFile(body["db"])
            if (isValid(body["dpbxtoken"])):
                setDropBoxToken(body["dpbxtoken"])
            return { "success": True }, 200
        else:
            return {
                "success": False,
                "error": "missing fields"
            }, 400

@app.route("/testdropboxtoken", methods=["POST"])
def testdropboxtoken():
    if (authKeyExists()):
        return {
            "success": False,
            "error": "The key is already set"
        }, 401
    else:
        body = request.get_json()
        if (isValid(body["token"])):
            try:
                dbx = dropbox.Dropbox(body["token"])
                dbx.users_get_current_account()
                return { "valid": True }, 200
            except:
                return { "valid": False }, 200
        else:
            return {
                "success": False,
                "error": "missing fields"
            }, 400

@app.route("/getdb", methods=["POST"])
def getdb():
    if (authKeyExists()):
        body = request.get_json()
        if (isValid(body["key"]) and verifyKey(body["key"])):
            return {
                "success": True,
                "db": readDBFile()
            }, 200
        else:
            return {
                "success": False,
                "error": "Wrong key"
            }, 401    
    else:
        return {
            "success": False,
            "error": "The key is not set, the password db cannot be returned"
        }, 401

@app.route("/updatedb", methods=["POST"])
def updatedb():
    if (authKeyExists()):
        body = request.get_json()
        if (isValid(body["key"]) and verifyKey(body["key"]) and isValid(body["db"])):
            writeDBFile(body["db"])
            token = getDropBoxToken()
            if (token):
                client = dropbox.Dropbox(token)
                with open(DB_FILE_PATH, "rb") as f:
                    now_timestamp = datetime.now().strftime("%m-%d-%Y-%H:%M:%S")
                    meta = client.files_upload(f.read(), f"/Passwords-{now_timestamp}.ejp", mode=dropbox.files.WriteMode("overwrite"))
            return {
                "success": True
            }, 200
        else:
            return {
                "success": False,
                "error": "Wrong key"
            }, 401    
    else:
        return {
            "success": False,
            "error": "The key is not set"
        }, 401
    
if (__name__ == "__main__"):
    app.run(host="0.0.0.0", port=5000, debug=True)