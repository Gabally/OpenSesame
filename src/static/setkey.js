PetiteVue.createApp({
    error: "",
    getFromTextField(name) {
        let val = window.document.querySelector(`input[name="${name}"]`).value;
        window.document.querySelector(`input[name="${name}"]`).value = "";
        return val;
    },
    async setKey(e) {
        e.preventDefault();
        let encDB = CryptoJS.AES.encrypt("{}", this.getFromTextField("dbkey"));
        let resp = await (await fetch("/init", {
            method: "POST",
            body: JSON.stringify({ key: btoa(this.getFromTextField("key")), db: encDB.toString() }),
            headers: {
                "Content-Type": "application/json"
            }
        })).json();
        let { success, message } = resp;
        if (success) {
            window.location.reload();
        } else {
            this.error = message;
        }
    }
}).mount("#app");