import dropbox, os
from datetime import datetime
import urllib.request, urllib.parse, json

DB_FILE_PATH = os.path.join(os.getcwd(), "Passwords.ejp")
DPBX_TOKEN_FILE_PATH = os.path.join(os.getcwd(), "dpbxtoken.txt")
LOGS_FILE_PATH = os.path.join(os.getcwd(), "events.log")

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

def logAction(req, action):
    try:
        with open(LOGS_FILE_PATH, "a") as fl:
            if req.environ.get('HTTP_X_FORWARDED_FOR') is None:
                ip = req.environ['REMOTE_ADDR']
            else:
                ip = req.environ['HTTP_X_FORWARDED_FOR']
            try:
                ipinfojson = urllib.request.urlopen("http://ip-api.com/json/{}".format(ip)).read().decode("utf-8")
                ipinfo = json.loads(ipinfojson)
                if (ipinfo["status"] == "success"):
                    fl.write("[{}]|{}|({},{}): {}\n".format(ip, datetime.now().strftime("%Y-%m-%d %H:%M:%S"), ipinfo["country"], ipinfo["regionName"], action))
                else:
                    raise Exception("Could not retrieve ip info")
            except Exception as e:
                print(e)
                fl.write("[{}]|{}|: {}\n".format(ip, datetime.now().strftime("%d-%m-%Y %H:%M:%S"), action))
    except Exception as e:
        print("Loggin error: {}".format(e))

def readLogs():
    if (not os.path.exists(LOGS_FILE_PATH)):
        return ""
    with open(LOGS_FILE_PATH, "r") as fl:
        return fl.read()