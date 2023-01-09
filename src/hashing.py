import os, hashlib, base64, pyotp

KEY_FILE_PATH = os.path.join(os.getcwd(), "key")
MFA_FILE_PATH = os.path.join(os.getcwd(), "2fa")

def authKeyExists():
    return os.path.exists(KEY_FILE_PATH)

def hashPassword(password):
    salt = os.urandom(32) 
    key = hashlib.pbkdf2_hmac(
        "sha256",
        base64.b64decode(password),
        salt,
        100000 
    )
    return salt + key

def initMFA():
    if not os.path.exists(MFA_FILE_PATH):
        secret = pyotp.random_base32()
        with open(MFA_FILE_PATH, "w") as fl:
            fl.write(secret)
        return secret
    else:
        with open(MFA_FILE_PATH, "r") as fl:
            return fl.read()

def setKey(key):
    with open(KEY_FILE_PATH, "wb") as fl:
        fl.write(hashPassword(key))

def verifyKey(key_to_verify):
    with open(KEY_FILE_PATH, "rb") as fl:
        set_key = fl.read()

    salt = set_key[:32]
    key = set_key[32:]

    new_key = hashlib.pbkdf2_hmac(
        "sha256",
        base64.b64decode(key_to_verify),
        salt, 
        100000
    )
    return new_key == key