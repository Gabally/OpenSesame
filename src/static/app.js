PetiteVue.createApp({
    authenticated: true,
    error: "",
    rawDB: null,
    db: { lol: 'xd', poppo: 'pop', lol: 'dsfdsfsdf', dsfsdf: 'dsfdsfsdf' },
    currentEntry: null,
    getFromTextField(name) {
        let val = window.document.querySelector(`input[name="${name}"]`).value;
        window.document.querySelector(`input[name="${name}"]`).value = "";
        return val;
    },
    async postJSON(url, data) {
        let resp = await fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        });
        return await resp.json();
    },
    async authenticate(e) {
        e.preventDefault();
        let resp = await this.postJSON("/getdb", { key: btoa(this.getFromTextField("authpw")) });
        let { success, error, db } = resp;
        if (success) {
            this.authenticated = true;
            this.rawDB = db;
            this.error = "";
        } else {
            this.error = error;
        }
    },
    viewEntry(name) {
        this.currentEntry = this.db[name];
    },
    decryptDB(e) {
        e.preventDefault();
        try {
            this.db = JSON.parse(CryptoJS.AES.decrypt(this.rawDB, this.getFromTextField("decryptpw")).toString(CryptoJS.enc.Utf8));
        } catch (e) {
            this.error = "Could not decrypt the database";
        }
    }
}).mount("#app");

function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var randomString = '';
    for (var i = 0; i < len; i++) {
        var randomPoz = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
}


class ProtectedValue {
    constructor(value) {
        this.key = CryptoJS.lib.WordArray.random(256).toString();
        this.enc = CryptoJS.AES.encrypt(value, this.key).toString();
    }

    get() {
        return CryptoJS.AES.decrypt(this.enc, this.key).toString(CryptoJS.enc.Utf8);
    }
}

class Entry {
    constructor(data) {
        if (data) {

        } else {
            this.name = `entry-${Date.now()}`;
            this.created = Date.now();
            this.fields = {
                username: {
                    type: "text",
                    value: "mycoolusername"
                },
                password: {
                    type: "protected",
                    value: new ProtectedValue("password")
                }
            };
        }
    }

    addEntry(newEntry) {
        if (!this.fields[newEntry.name]) {
            this.fields[newEntry.name] = newEntry.entry;
        } else {
            throw "Entry already exists";
        }
    }
}