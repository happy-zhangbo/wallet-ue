const dotenv = require("dotenv")
dotenv.config()

let options = {
    apiVersion: 'v1', // default
    endpoint: 'http://127.0.0.1:8200', // default
    token: 'hvs.DxzgWRGqFroUUwwvqJ3C2DBc' // optional client token; can be fetched after valid initialization of the server
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
    read: async (path) => {
        return {
            "address": "0xe09F325F8D3Be99d9e3c8Ed258BA1b3403017985",
            "privateKey": process.env.PRIVATEKEY
        }
        // const { data } = await vault.read(path).catch(console.error);
        // if(!data){
        //     return {
        //         "address": "0xaE276007C9C367b04e8Ec49CdD3a7eE5Ac7d4B6C",
        //         "privateKey": "0x19410dc9845a816d6c6d883be8cf16cb268787c508a374e24b0238558ebead45"
        //     }
        // }
        // return data;
    }
}