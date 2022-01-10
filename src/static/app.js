PetiteVue.createApp({
    authenticated: false,
    error: "",
    rawDB: null,
    db: null,
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
    decryptDB(e) {
        e.preventDefault();
        this.db = JSON.parse(CryptoJS.AES.decrypt(this.rawDB, this.getFromTextField("decryptpw")).toString(CryptoJS.enc.Utf8));
        console.log(this.db);
    }
}).mount("#app");