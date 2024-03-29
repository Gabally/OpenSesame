from datetime import datetime
from flask import Flask, request
from hashing import *
from utils import *
import os

app = Flask(__name__)

@app.route("/")
def index():
    if (authKeyExists()):
        return app.send_static_file("index.html")
    else:
        return app.send_static_file("setkey.html")

@app.route("/2fa-secret")
def mfa():
    if (authKeyExists()):
        return {}, 401
    else:
        return { "secret_url": pyotp.totp.TOTP(initMFA()).provisioning_uri(name="Login Token", issuer_name="Open Sesame") }

@app.route("/init", methods=["POST"])
def setkey():
    if (authKeyExists()):
        return {
            "success": False,
            "error": "The key is already set"
        }, 401
    else:
        body = request.get_json()
        if not pyotp.TOTP(initMFA()).verify(body["mfa"]):
            return {
                "success": False,
                "error": "Invalid 2FA token"
            }, 400
        if (isValid(body["key"]) and isValid(body["db"])):
            setKey(body["key"])
            writeDBFile(body["db"])
            if (isValid(body["dpbxtoken"])):
                setDropBoxToken(body["dpbxtoken"])
            logAction(request, "Initialized the database")
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
        if (isValid(body["key"]) and verifyKey(body["key"]) and pyotp.TOTP(initMFA()).verify(body["mfa"])):
            logAction(request, "Obtained the database file successfully")
            return {
                "success": True,
                "db": readDBFile(),
                "logs": readLogs()
            }, 200
        else:
            logAction(request, "Submitted a wrong database password")
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
            logAction(request, "Updated the database file successfully")
            return {
                "success": True
            }, 200
        else:
            logAction(request, "Tried to update the database with the wrong password")
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
    print("Starting server...")
    app.run(host="0.0.0.0", port=5000, debug=True)