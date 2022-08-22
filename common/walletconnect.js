const { default: NodeWalletConnect } = require("@walletconnect/client");
const winlogger = require("../log/winstonLogger");
const utils = require("./utils");
//global
const { connectMap, abiMap, resultMap} = require("./global");
const { read } = require("./vault");
const constants = require("./constant");
const Web3EthAbi = require("web3-eth-abi");
const {error} = require("winston");

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
    sendTXWallet: async (tx, walletConnector,web3) => {
        await web3.eth.estimateGas(tx).catch(error => {
            throw new Error(error);
        });
        const result = await walletConnector.sendTransaction(tx).catch((error) => {
            winlogger.error(error);
            throw new Error(error);
        });
        return result;
    },
    sendTXOfficial: async(tx, web3, ticketId) => {
        const officialAccount = await read(constants["officialPath"]);
        tx["from"] = officialAccount["address"];
        const gas = await web3.eth.estimateGas(tx).catch(error => {
            throw new Error(error);
        });
        tx["gas"] = gas;
        const sign = await web3.eth.accounts.signTransaction(tx, officialAccount["privateKey"]).catch(error =>{
            throw new Error(error);
        })
        console.log(sign);
        web3.eth.sendSignedTransaction(sign.rawTransaction).then(result => {
            resultMap[ticketId].code = 1;
            resultMap[ticketId].status = "success";
            resultMap[ticketId].data = result;
            console.log("TX Success");
        }).catch(error =>{
            return Promise.reject(error);
        })
        return sign["transactionHash"];
    },
    call: async (outputs ,abi_hash, contractAddress,web3) => {
        const result = await web3.eth.call({
            to: contractAddress,
            data: abi_hash
        }).catch(error => {
            throw new Error(error);
        });
        let decodeParameters = Web3EthAbi.decodeParameters(outputs,result);

        var count = Object.keys(decodeParameters).length;
        if(count <= 2){
            return decodeParameters['0'];
        }else{
            return decodeParameters;
        }
    },
    getOfficialNonce: async (web3) => {
        const officialAccount = await read(constants["officialPath"]);
        const abi = JSON.parse("[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"_nonce\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"}]");
        let { abiHash, data } = utils.encodeParamsABI(abi,[officialAccount["address"]],"_nonce");
        let outputs = [];
        data["outputs"].forEach(param => {
            outputs.push(param.type);
        })
        const result = await self.call(outputs, abiHash,constants.nftsAddress, web3).catch(error => {
            return Promise.reject(error);
        });
        return result;

    },
    signMetaDataMsg: async (signData, web3) => {
        const officialAccount = await read(constants["officialPath"]).catch(error => {
            throw new Error(error);
        });
        let types = [],contents = [];
        for (let data of signData) {
            types.push(data.type)
            contents.push(data.content);
        }
        const message = utils.signMetaDataMsg(types,contents);
        const sign = await web3.eth.accounts.sign(message,officialAccount["privateKey"]);
        return sign;
    },
    signInfo712Msg: async (msgParams ,walletConnector) => {
        // Sign Typed Data
       const result = await walletConnector
            .signTypedData(msgParams)
            .catch((error) => {
                // Error returned when rejected
                throw new Error(error);
            });
       return result;
    }
}
module.exports = self;