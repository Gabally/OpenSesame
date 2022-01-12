function randomString(len, charSet) {
    charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';
    for (let i = 0; i < len; i++) {
        let randomPoz = Math.floor(Math.random() * charSet.length);
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
            return;
        } else {
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

    addField(newField) {
        if (!this.fields[newField.name]) {
            this.fields[newField.name] = newField.entry;
        } else {
            throw "Error: A field with that name already exists";
        }
    }
}

var app = new Vue({
    el: "#app",
    data: {
        authenticated: true,
        error: "",
        rawDB: null,
        db: { lol: new Entry(), poppo: new Entry(), lol: new Entry(), dsfsdf: new Entry() },
        currentEntry: null
    },
    methods: {
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
            this.currentEntry = {
                name: name,
                entry: this.db[name]
            };
        },
        deleteEntry(name) {
            if (confirm(`Are you sure you want to delete ${name} ?`)) {
                delete this.db[name];
                this.currentEntry = null;
            };
        },
        addEntry() {
            let name = `New Entry #${randomString(5)}`;
            if (this.db[name]) {
                alert(`An entry with the name ${name} already exists`);
                return;
            }
            this.db[name] = new Entry();
            this.currentEntry = {
                name: name,
                entry: this.db[name]
            };
        },
        /*
        updateEntryName(event) {
            let newName = event.target.value;
            if (newName && !this.db[newName]) {
                this.db[newName] = this.db[this.currentEntry.name];
                delete this.db[this.currentEntry.name];
                this.currentEntry = {
                    name: newName,
                    entry: this.db[newName]
                };
            }
        },
        */
        decryptDB(e) {
            e.preventDefault();
            try {
                this.db = JSON.parse(CryptoJS.AES.decrypt(this.rawDB, this.getFromTextField("decryptpw")).toString(CryptoJS.enc.Utf8));
            } catch (e) {
                this.error = "Could not decrypt the database";
            }
        }
    }
});