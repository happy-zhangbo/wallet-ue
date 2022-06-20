const ethers = require('ethers')
const Web3 = require("web3");
const {connectMap} = require("./global");

module.exports = {
    createWallet: ()=> {
        let wallet = new ethers.Wallet.createRandom()
        let address = wallet.address
        let privateKey = wallet.privateKey
        return [address,privateKey];
    },
    getChainURI: (chainId, walletConnector, deviceId)=> {
        let endpoint;
        switch (chainId) {
            case 1:
                endpoint = "https://mainnet.infura.io/v3/a2122abfa9b544dca3df8d951f84029b";
                break;
            case 4:
                endpoint = "https://rinkeby.infura.io/v3/a2122abfa9b544dca3df8d951f84029b";
                break;
            case 1313161554:
                endpoint = "https://mainnet.aurora.dev";
                break;
            case 1313161555:
                endpoint = "https://testnet.aurora.dev";
                break;
            case 1008:
                endpoint = "ws://www.blackwarrior.vip:9944/";
                break;
            default:
                break;
        }
        if(endpoint) {
            const web3 = new Web3(endpoint);
            connectMap[deviceId] = {
                walletConnector: walletConnector,
                web3: web3
            };
            return true;
        }else{
            return false;
        }
    },
    isStrEmpty: (str) => {

    }
}
