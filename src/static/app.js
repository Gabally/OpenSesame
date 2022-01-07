PetiteVue.createApp({
    authenticated: false,
    key: "",
    error: "",
    base64ToArrayBuffer(b64) {
        return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
    },
    async authenticate(e) {
        e.preventDefault();
        let key = this.key;
        this.key = "";
        let resp = await (await fetch("/getdb", {
            method: "POST",
            body: JSON.stringify({ key: key }),
            headers: {
                "Content-Type": "application/json"
            }
        })).json();
        let { success, error, db } = resp;
        if (success) {
            this.authenticated = true;
            window.db = this.base64ToArrayBuffer(db);
        } else {
            this.error = error;
        }
        key = "";
    }
}).mount("#app");