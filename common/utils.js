const Web3 = require("web3");
const {connectMap, resultMap} = require("./global");
const Web3Utils = require('web3-utils');
const Web3EthAbi = require("web3-eth-abi");
const winlogger = require("../log/winstonLogger");
const crypto = require('crypto');
const constants = require("./constant");
const ethers = require("ethers");

const self = {
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
                endpoint = "https://www.blackwarrior.vip/eth";
                break;
            case 1281:
                endpoint = "https://gateway.testnet.octopus.network/barnacle-evm/wj1hhcverunusc35jifki19otd4od1n5";
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
    buildCreate2Address: (creatorAddress, saltHex, byteCode) => {
        return `0x${Web3Utils.sha3(`0x${[
            'ff',
            creatorAddress,
            saltHex,
            Web3Utils.sha3(byteCode)
        ].map(x => x.replace(/0x/, ''))
            .join('')}`).slice(-40)}`.toLowerCase()
    },
    numberToUint256: (value) => {
        const md5 = crypto.createHash('md5');
        const result = md5.update(value).digest('hex');
        const hex = Web3Utils.utf8ToHex(result).substring(2);
        return `0x${'0'.repeat(64-hex.length)}${hex}`
    },
    encodeParamsABI: (abi,args,method) => {
        let data = {};
        try {
            abi.forEach(func => {
                if(func.name === method){
                    if(args.length == func["inputs"].length) {
                        data = func;
                        //break
                        throw new Error("End");
                    }
                }
            })
        }catch (e){
            if(e.message != "End") throw e;
        }
        if(!data){
            throw new Error("No Method");
        }
        let inputs = [];
        data["inputs"].forEach((param) => {
            inputs.push(param.type);
        });
        let abiHash = Web3EthAbi.encodeFunctionSignature(data);
        abiHash += Web3EthAbi.encodeParameters(inputs,args).substring(2)
        return { abiHash, data };
    },
    pollingTxResult(result, ticketId, web3, frequency){
        let timer = null
        function interval(func, wait){
            let inter = function(){
                func.call(null);
                timer=setTimeout(inter, wait);
            };
            timer= setTimeout(inter, wait);
        }
        let count = 0;
        interval(async() => {
            const receipt = await web3.eth.getTransactionReceipt(result).catch(err =>{
                throw err;
            });
            if(receipt && receipt["status"]){
                console.log("TX Success");
                resultMap[ticketId].code = 1;
                resultMap[ticketId].status = "success";
                resultMap[ticketId].data = receipt;
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
            }else{
                console.info("Getting the results of the uplink: "+result);
                if(frequency > 0){
                    if(count > frequency){
                        winlogger.info("TX Error");
                        clearTimeout(timer);
                        timer = null;
                    }else{
                        count = count + 1;
                    }
                }
            }
        }, 2000);
    },
    signMetaDataMsg(types,content){
        let msg = ethers.utils.keccak256(ethers.utils.solidityPack(types,content));
        return msg;
    },
    getProxyAddress(salt){
        return self.buildCreate2Address(constants.factoryAddress, salt, constants.proxyAccountBytecode);
    },
    toChecksumAddress(address){
        return Web3Utils.toChecksumAddress(address);
    },
    toReturn(result,data){
        if(result){
            return {
                result: true,
                data: data
            }
        }else{
            return {
                result: false,
                error: data
            }
        }
    },
    hexToNUmber(hex){
        return Web3Utils.hexToNumber(hex);
    }

}
module.exports = self;
