const vault = require("./common/vault")
const utils = require("./common/utils")
const Web3Utils = require('web3-utils');

async function main(){
    // const data = await utils.createWallet()
    // console.log(data);

    const asciiToHex = Web3Utils.asciiToHex("ABC");
    console.log(asciiToHex);
    console.log(asciiToHex.padEnd(66,'0'));
}

main()
