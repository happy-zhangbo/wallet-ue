const vault = require("./common/vault")
const utils = require("./common/utils");
const { factoryABI } = require("./common/constant");
const Web3 = require("web3");
const walletconnect = require("./common/walletconnect");
const ipfsC = require("./common/ipfs_common");


const web3 = new Web3("https://www.blackwarrior.vip/eth");

async function main(){
    // console.log(await vault.read("official/account"));
    // console.log(utils.signMetaDataMsg("bc", 0));
    // walletconnect.signMetaDataMsg("abccc",1,web3).then(console.log);
    ipfsC.add("ABC").then(console.log);
}

main()
