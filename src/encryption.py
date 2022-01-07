import os, hashlib, base64

KEY_FILE_PATH = os.path.join(os.getcwd(), "key")

def authKeyExists():
    return os.path.exists(KEY_FILE_PATH)

def hashPassword(password):
    salt = os.urandom(32) 
    key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        100000 
    )
    return salt + key

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
        key_to_verify.encode("utf-8"),
        salt, 
        100000
    )
    return new_key == key