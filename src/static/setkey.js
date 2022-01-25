new Vue({
    el: '#app',
    data: {
        error: "",
        tokenTest: ""
    },
    methods: {
        getFromTextField(name, erase = false) {
            let val = window.document.querySelector(`input[name="${name}"]`).value;
            if (erase) {
                window.document.querySelector(`input[name="${name}"]`).value = "";
            }
            return val;
        },
        async setKey(e) {
            e.preventDefault();
            let encDB = CryptoJS.AES.encrypt("{}", this.getFromTextField("dbkey"));
            let resp = await (await fetch("/init", {
                method: "POST",
                body: JSON.stringify({ key: btoa(this.getFromTextField("key")), db: encDB.toString(), dpbxtoken: this.getFromTextField("dpbxtoken") }),
                headers: {
                    "Content-Type": "application/json"
                }
            })).json();
            let { success, error } = resp;
            if (success) {
                window.location.reload();
            } else {
                this.error = error;
            }
        },
        async testToken() {
            this.tokenTest = "";
            let token = this.getFromTextField("dpbxtoken");
            let resp = await fetch("/testdropboxtoken", {
                method: "POST",
                body: JSON.stringify({ token: token }),
                headers: {
                    "Content-Type": "application/json"
                }
            });
            let { valid } = await resp.json();
            if (valid) {
                this.tokenTest = "Token is valid 👍";
            } else {
                this.tokenTest = "Token is invalid 👎";
            }
        }
    }
});