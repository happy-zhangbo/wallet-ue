const vault = require("./common/vault")
const utils = require("./common/utils");
const { factoryABI } = require("./common/constant");
const Web3 = require("web3");
const walletconnect = require("./common/walletconnect");
const ipfsC = require("./common/ipfs_common");
const constant = require("./common/constant");

async function main(){
    // console.log(await vault.read("official/account"));
    // console.log(utils.signMetaDataMsg("bc", 0));
    // walletconnect.signMetaDataMsg("abccc",1,web3).then(console.log);
    //ipfsC.add("ABC").then(console.log);
    const salt = utils.numberToUint256("B80A95EE83FF3D3B");
    console.log(salt);
    const d = utils.encodeParamsABI(constant.factoryABI, [salt], "calculation");

    console.log(d);
}

main()
