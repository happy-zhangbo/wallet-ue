let options = {
    apiVersion: 'v1', // default
    endpoint: 'http://127.0.0.1:8200', // default
    token: 'hvs.aBrypEPDggmCfwRBLxmXilwT' // optional client token; can be fetched after valid initialization of the server
};

// get new instance of the client
let vault = require("node-vault")(options);
module.exports = {
    init: () => {
        // init vault server
        vault.init({ secret_shares: 1, secret_threshold: 1 })
            .then( (result) => {
                console.log(result);
                var keys = result.keys;
                // set token for all following requests
                vault.token = result.root_token;
                // unseal vault server
                return vault.unseal({ secret_shares: 1, key: keys[0] })
            })
            .catch(console.error);
    },
    read: async () => {
        const { data } = await vault.read('accounts/super').catch(console.error);
        return data;
    }
}