PetiteVue.createApp({
    key: "",
    error: "",
    async setKey(e) {
        e.preventDefault();
        let key = this.key;
        this.key = "";
        let resp = await (await fetch("/setkey", {
            method: "POST",
            body: JSON.stringify({ key: key }),
            headers: {
                "Content-Type": "application/json"
            }
        })).json();
        key = "";
        let { success, message } = resp;
        if (success) {
            window.location.reload();
        } else {
            this.error = message;
        }
    }
}).mount("#app");