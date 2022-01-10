from flask import Flask, render_template, request
from hashing import *
import os

DB_FILE_PATH = os.path.join(os.getcwd(), "Passwords.ejp")

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

app = Flask(__name__)

@app.route("/")
def index():
    if (authKeyExists()):
        return render_template("index.html")
    else:
        return render_template("setkey.html")

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
    
if (__name__ == "__main__"):
    app.run(host="0.0.0.0", port=5000, debug=True)