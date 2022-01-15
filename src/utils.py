import dropbox, os
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