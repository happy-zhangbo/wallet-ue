const  {AbortController} = require("node-abort-controller");
global.AbortController = AbortController;

const { toString } = require('uint8arrays/to-string');

const ipfs = require('ipfs-http-client');
const client = ipfs.create();

module.exports = {
    add: async (content) => {
        const { cid } = await client.add(content);
        return String(cid);
    },
    cat: async (ipfsHash) => {
        let content = "";
        for await (const buf of client.cat(ipfsHash)) {
            content += toString(buf);
        }
        return content;
    }
}
// (async() => {
//     const { cid } = await client .add("hello");
//     console.log(cid);
// })