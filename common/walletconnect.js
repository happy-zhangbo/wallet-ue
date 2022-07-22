const { default: NodeWalletConnect } = require("@walletconnect/client");
const winlogger = require("../log/winstonLogger");
const utils = require("./utils");
//global
const { connectMap, abiMap} = require("./global");
const { read } = require("./vault");
const constants = require("./constant");
const Web3EthAbi = require("web3-eth-abi");

const self = {
    connect: async (deviceId,callback)=> {
        let walletConnector;
        walletConnector = new NodeWalletConnect(
            {
                // Required
                bridge: "https://bridge.walletconnect.org",
                // Required
                clientMeta: {
                    description: "Black Warrior App",
                    url: "https://walletconnect.org",
                    icons: ["https://walletconnect.org/walletconnect-logo.png"],
                    name: "Black Warrior",
                }
            }
        );
        let uri;
        // Check if connection is already established
        if (!walletConnector.connected) {
            // create new session
            await walletConnector.createSession();
            uri = walletConnector.uri;
        }
        // Subscribe to connection events
        walletConnector.on("connect", async (error, payload) => {
            if (error) {
                throw error;
            }
            const { accounts, chainId } = payload.params[0];
            const isOpenChain = utils.getChainURI(chainId, walletConnector, deviceId);
            if(isOpenChain){
                winlogger.info("connect success: accountID: "+accounts[0]+",chainID:"+chainId);
                callback(accounts,chainId);
            }else{
                winlogger.warn("The current network is not supported,Please switch the network and scan the code again");
            }
        });
        return uri;
    },
    sendTXWallet: async (tx, walletConnector) => {
        const result = await walletConnector.sendTransaction(tx).catch((error) => {
            // Error returned when rejected
            return Promise.reject(error);
        });
        return result;
    },
    sendTXOfficial: async(tx, web3) => {
        const officialAccount = await read(constants["officialPath"]);
        tx["from"] = officialAccount["address"];
        const gas = await web3.eth.estimateGas(tx).catch(error => {
            return Promise.reject(error);
        });
        tx["gas"] = gas;
        const sign = await web3.eth.accounts.signTransaction(tx, officialAccount["privateKey"]).catch(error =>{
            return Promise.reject(error);
        })
        const result = await web3.eth.sendSignedTransaction(sign.rawTransaction).catch(error =>{
            return Promise.reject(error);
        })
        return result["transactionHash"];
    },
    call: async (outputs ,abi_hash, contractAddress,web3) => {
        const result = await web3.eth.call({
            to: contractAddress,
            data: abi_hash
        }).catch(error => {
            return Promise.reject(error);
        });
        let decodeParameters = Web3EthAbi.decodeParameters(outputs,result);
        return decodeParameters;
    },
    signMetaDataMsg: async (ipfsHash, tokenId, web3) => {
        const officialAccount = await read(constants["officialPath"]).catch(error => {
            return Promise.reject(error);
        });
        const message = utils.signMetaDataMsg(ipfsHash,tokenId);
        const sign = await web3.eth.accounts.sign(message,officialAccount["privateKey"]);
        return sign;
    },
    signInfo712Msg: async (msgParams ,walletConnector) => {
        // Sign Typed Data
       const result = await walletConnector
            .signTypedData(msgParams)
            .catch((error) => {
                // Error returned when rejected
                return Promise.reject(error);
            });
       return result;
    }
}
module.exports = self;