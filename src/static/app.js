class ProtectedValue {
    constructor(value) {
        this.key = CryptoJS.lib.WordArray.random(16).toString();
        this.enc = CryptoJS.AES.encrypt(value, this.key).toString();
    }

    get() {
        return CryptoJS.AES.decrypt(this.enc, this.key).toString(CryptoJS.enc.Utf8);
    }
}

Vue.component("add-field-form", {
    props: ["submit"],
    data: function() {
        return {
            type: "text",
            name: "",
            value: "",
            error: "",
            encodedFile: null,
            MimeType: null,
            fileName: null,
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
                        value: this.encodedFile,
                        fileName: this.fileName
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
            setTimeout(() => {
                this.error = "";
            }, 5000);
        },
        encodeFile() {
            let file = this.$refs.rawFile.files[0];
            this.fileName = file.name;
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
         <div class="padded">{{ fileName }}</div>
         <input id="file-input" type="file" @change="encodeFile" ref="rawFile" name="uploaf" v-if="type == 'file'" style="opacity: 0;" required>
         <div class="error">{{ error }}</div>
         <button style="margin: 10px;" class="btn">➕</button>
         </form>
    </div>
    `
});

new Vue({
    el: "#app",
    data: {
        authenticated: false,
        authPassword: null,
        error: "",
        rawDB: null,
        showAddFieldMenu: false,
        db: null,
        currentEntry: null,
        encPassword: null,
        notification: null
    },
    methods: {
        randomString(len, charSet) {
            charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            let randomString = '';
            for (let i = 0; i < len; i++) {
                let randomPoz = Math.floor(Math.random() * charSet.length);
                randomString += charSet.substring(randomPoz, randomPoz + 1);
            }
            return randomString;
        },
        formatTimestamp(timestamp) {
            let date = new Date(timestamp);
            return `${date.getHours()}:${date.getMinutes()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        },
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
            this.authPassword = new ProtectedValue(this.getFromTextField("authpw"));
            let { success, error, db } = await this.postJSON("/getdb", { key: btoa(this.authPassword.get()) });
            if (success) {
                this.authenticated = true;
                this.rawDB = db;
                this.error = "";
            } else {
                this.authPassword = null;
                this.error = error;
            }
        },
        showNotification(txt) {
            this.notification = txt;
            setTimeout(() => {
                this.notification = null;
            }, 3000);
        },
        async updateDB() {
            let serialized = JSON.stringify(this.db);
            let encrypted = CryptoJS.AES.encrypt(serialized, this.encPassword.get()).toString();
            let { success, error } = await this.postJSON("/updatedb", {
                key: btoa(this.authPassword.get()),
                db: encrypted
            });
            if (success) {
                this.showNotification("DB Saved successfully");
            } else {
                alert(error);
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
            this.updateDB();
        },
        addEntry() {
            let name = `New Entry #${this.randomString(5)}`;
            if (this.db[name]) {
                alert(`An entry with the name ${name} already exists`);
                return;
            }
            this.db[name] = {
                created: new Date().getTime(),
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
            this.updateDB();
        },
        updateEntryName(event) {
            let newName = event.target.value;
            if (newName && !this.db[newName]) {
                this.db[newName] = {...this.db[this.currentEntry] };
                delete this.db[this.currentEntry];
                this.currentEntry = newName;
                this.updateDB();
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
                        value: eventData.value,
                        fileName: eventData.fileName
                    };
                } else if (eventData.type == "protected") {
                    this.db[this.currentEntry].fields[eventData.name] = {
                        type: eventData.type,
                        value: btoa(eventData.value)
                    };
                } else {
                    this.db[this.currentEntry].fields[eventData.name] = {
                        type: eventData.type,
                        value: eventData.value
                    };
                }
                this.forceFieldRender();
                this.updateDB();
            }
        },
        deleteField(name) {
            if (confirm(`Are you sure you want to delete the field ${name} ?`)) {
                delete this.db[this.currentEntry].fields[name];
                this.forceFieldRender();
                this.updateDB();
            }
        },
        decryptDB(e) {
            e.preventDefault();
            try {
                this.encPassword = new ProtectedValue(this.getFromTextField("decryptpw"));
                this.db = JSON.parse(CryptoJS.AES.decrypt(this.rawDB, this.encPassword.get()).toString(CryptoJS.enc.Utf8));
            } catch (e) {
                this.error = "Could not decrypt the database";
            }
        },
        previewFile(file) {
            let previewWindow = window.open("about:blank", "_blank");
            previewWindow.document.body.style.margin = "0px";
            previewWindow.document.body.style.padding = "0px";
            let frame = document.createElement("iframe");
            frame.src = file.value;
            frame.style.width = "100%";
            frame.style.height = "100%";
            frame.style.border = "none";
            previewWindow.document.body.appendChild(frame);
        },
        copyText(text) {
            navigator.clipboard.writeText(text);
        }
    }
});