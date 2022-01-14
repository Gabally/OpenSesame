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

Vue.component("add-field-form", {
    props: ["submit"],
    data: function () {
      return {
        type: "text",
        name: "",
        value: "",
        error: "",
        encodedFile: null,
        MimeType: null,
      }
    },
    methods: {
        sendData(event) {
            event.preventDefault();
            if (this.submit) {
                if (this.type == "file") {
                    this.submit({
                        type: this.type,
                        name: this.name,
                        MimeType: this.MimeType,
                        value: this.encodedFile
                    });
                } else {
                    this.submit({
                        type: this.type,
                        name: this.name,
                        value: this.value
                    });
                }
                this.type = "text";
                this.name = "";
                this.value = "";
                this.encodeFile = null;
            }
        },
        setError(e) {
            this.error = e;
            setTimeout(()=>{
                this.error = "";
            }, 5000);
        },
        encodeFile() {
            let file = this.$refs.rawFile.files[0];
            this.MimeType = file.type;
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              this.encodedFile = reader.result;
            };
            reader.onerror = (error) => {
              console.error("Error: ", error);
            };
        }
    },
    template: `
    <div style="overflow: hidden;" class="center-content">
        <form @submit="sendData" class="center-content">
        <label>Type:</label>
        <select v-model="type" required style="background: rgb(92, 92, 92);" spellcheck="false" class="db-field input-border">
             <option value="text" selected>Text</option>
             <option value="protected">Protected</option>
             <option value="file">File</option>
         </select>
         <label>Name:</label>
         <input v-model="name" required class="db-field input-border" spellcheck="false "type="text">
         <label>Value:</label>
         <input v-model="value" v-if="type == 'text'" required class="db-field input-border" spellcheck="false "type="text">
         <input v-model="value" v-if="type == 'protected'" required class="db-field input-border" spellcheck="false "type="password">
         <label for="file-input" v-if="type == 'file'" class="btn">📁</label>
         <input id="file-input" type="file" @change="encodeFile" ref="rawFile" name="uploaf" v-if="type == 'file'" style="opacity: 0;" required>
         <div class="error">{{ error }}</div>
         <button style="margin: 10px;" class="btn">➕</button>
         </form>
    </div>
    `
});

var app = new Vue({
    el: "#app",
    data: {
        authenticated: true,
        error: "",
        rawDB: null,
        showAddFieldMenu: false,
        db: { lol: {
            created: new Date(),
            fields: {
                username: {
                    type: "text",
                    value: "mycoolusername"
                },
                password: {
                    type: "protected",
                    value: btoa("ljshdjsdg")
                }
            }
        }, poppo: {
            created: new Date(),
            fields: {
                username: {
                    type: "text",
                    value: "mycoolusername"
                },
                password: {
                    type: "protected",
                    value: btoa("ljshdjsdg")
                }
            }
        },
         dsfsdf: {
            created: new Date(),
            fields: {
                username: {
                    type: "text",
                    value: "mycoolusername"
                },
                password: {
                    type: "protected",
                    value: btoa("ljshdjsdg")
                }
            }
        } },
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
            this.currentEntry = name;
        },
        forceFieldRender() {
            let c = this.currentEntry;
            this.currentEntry = null;
            this.currentEntry = c;
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
            this.db[name] = {
                created: new Date(),
                fields: {
                    username: {
                        type: "text",
                        value: "mycoolusername"
                    },
                    password: {
                        type: "protected",
                        value: btoa("ljshdjsdg")
                    }
                }
            };
            this.currentEntry = name;
        },
        updateEntryName(event) {
            let newName = event.target.value;
            if (newName && !this.db[newName]) {
                this.db[newName] = { ...this.db[this.currentEntry] };
                delete this.db[this.currentEntry];
                this.currentEntry = newName;
            }
        },
        addField(eventData) {
            if (this.db[this.currentEntry].fields[eventData.name]) {
                this.$refs.addField.setError("A field with that name already exists");
            } else {
                if (eventData.type == "file") {
                    this.db[this.currentEntry].fields[eventData.name] = {
                        type: eventData.type,
                        MimeType: eventData.MimeType,
                        value: eventData.value
                    };
                } else {
                    this.db[this.currentEntry].fields[eventData.name] = {
                        type: eventData.type,
                        value: eventData.value
                    };
                }
                this.forceFieldRender();
            }
        },
        deleteField(name) {
            if (confirm(`Are you sure you want to delete the field ${name} ?`)) {
                delete this.db[this.currentEntry].fields[name];
                this.forceFieldRender();
            }
        },
        decryptDB(e) {
            e.preventDefault();
            try {
                this.db = JSON.parse(CryptoJS.AES.decrypt(this.rawDB, this.getFromTextField("decryptpw")).toString(CryptoJS.enc.Utf8));
            } catch (e) {
                this.error = "Could not decrypt the database";
            }
        },
        previewFile(file){
            window.open(`data:${file.MimeType};base64,${file.value}`, "_blank");
        }
    }
});