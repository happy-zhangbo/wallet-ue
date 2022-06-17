const express = require('express');

const crypto = require("crypto");
const Web3EthAbi = require("web3-eth-abi");
const { v4: uuidv4 } = require("uuid");
const winlogger = require("../log/winstonLogger");
const users = require("../services/users");

// Create connector
let { connectMap, deviceMap, abiMap, resultMap } = require("../common/global");

const api = express.Router();
api.post("/wallet/info",(req,res) => {
    const body = req.body;
    let deviceMapElement = deviceMap[body["device_id"]];
    if(deviceMapElement){
        deviceMapElement.result = true;
        res.json(deviceMapElement);
    }else{
        res.json({result: false});
    }

})

api.post("/abi",(req,res) => {
    const body = req.body;
    let hash = crypto.createHash('sha256').update(body.abi).digest('hex');
    abiMap[hash] = JSON.parse(body.abi);
    res.json({abi: hash});
})

api.post('/send/transaction',async (req, res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    const { walletConnector, web3 } = connectMap[body["device_id"]]
    const abi = abiMap[body["abi_hash"]];
    const user = device["user"];
    let data = {};
    let args = JSON.parse(body["args"]);
    try {
        abi.forEach(func => {
            if(func.name === body["method"]){
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

    let inputs = [];
    data["inputs"].forEach(param => {
        inputs.push(param.type);
    })
    let abi_hash = Web3EthAbi.encodeFunctionSignature(data);
    abi_hash += Web3EthAbi.encodeParameters(inputs,args).substring(2)

    // Draft transaction
    const tx = {
        to: body["contract_address"], // Required (for non contract deployments)
        data: abi_hash, // Required
        // gasPrice: "0x02540be400", // Optional
        // gas: "0x9c40", // Optional
        // value: "0x00", // Optional
        // nonce: "0x0114", // Optional
    };

    //proxy_status == 0 use master
    //proxy_status == 1 use proxy
    let result;
    if(user["proxy_status"] == 0){
        if(walletConnector){
            tx: {
                from: device.accounts[0] // Required
            }
            // Send transaction
            result = await walletConnector.sendTransaction(tx).catch((error) => {
                // Error returned when rejected
                res.json({
                    result: false,
                    error: error
                });
                throw error;
            });
        }else{
            res.json({
                result: false,
                error: "Please use your wallet to scan the code to login"
            });
            return;
        }
    }else{
        // tx: {
        //     gas:
        // }
        const privateKey = users.findByUid(user["uid"])["proxy_private_key"];
        const signTx = await web3.eth.accounts.signTransaction(tx, privateKey).catch((error) => {
            // Error returned when rejected
            res.json({
                result: false,
                error: error
            });
            throw error;
        });
        const tx = await web3.eth.sendSignedTransaction(signTx.rawTransaction).catch((error) => {
            // Error returned when rejected
            res.json({
                result: false,
                error: error
            });
            throw error;
        });
        result = tx["transactionHash"];
    }
    var ticketId = uuidv4();
    resultMap[ticketId] = {
        "tx_hash": result,
        code: 0,
        status: "wait",
    }
    res.json({
        result: true,
        ticket: ticketId
    });
    let timer = null
    function interval(func, wait){
        let inter = function(){
            func.call(null);
            timer=setTimeout(inter, wait);
        };
        timer= setTimeout(inter, wait);
    }
    interval(async() => {
        const receipt = await web3.eth.getTransactionReceipt(result);
        if(receipt && receipt["status"]){
            console.log("tx success");
            resultMap[ticketId].code = 1;
            resultMap[ticketId].status = "success";
            resultMap[ticketId].data = receipt;
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
        }else{
            winlogger.info("Getting the results of the uplink: "+result);
        }
    }, 2000);



    // Send transaction
    walletConnector
        .sendTransaction(tx)
        .then((result) => {
            // Returns transaction id (hash)

            var ticketId = uuidv4();
            resultMap[ticketId] = {
                "tx_hash": result,
                code: 0,
                status: "wait",
            }
            res.json({
                result: true,
                ticket: ticketId
            });
            let timer = null
            function interval(func, wait){
                let inter = function(){
                    func.call(null);
                    timer=setTimeout(inter, wait);
                };
                timer= setTimeout(inter, wait);
            }
            interval(async() => {
                const receipt = await web3.eth.getTransactionReceipt(result);
                if(receipt && receipt["status"]){
                    console.log("tx success");
                    resultMap[ticketId].code = 1;
                    resultMap[ticketId].status = "success";
                    resultMap[ticketId].data = receipt;
                    if (timer) {
                        clearTimeout(timer);
                        timer = null;
                    }
                }else{
                    winlogger.info("Getting the results of the uplink: "+result);
                }
            }, 2000);
        })
        .catch((error) => {
            // Error returned when rejected
            res.json({
                result: false,
                error: error
            });
        });
})

api.post('/result',(req, res) => {
    const body = req.body;
    const ticket = resultMap[body["ticket"]];
    res.json(ticket);
})

api.post('/call/method', async (req, res) => {
    const body = req.body;
    const { web3 } = connectMap[body["device_id"]]
    const abi = abiMap[body["abi_hash"]];
    let data = {};
    abi.forEach(func => {
        if(func.name === body["method"]){
            data = func;
        }
    })
    let outputs = [];
    data["outputs"].forEach(param => {
        outputs.push(param.type);
    })
    let abi_hash = Web3EthAbi.encodeFunctionSignature(data);
    if(data["inputs"] && data["inputs"].length > 0){
        let inputs = [];
        data["inputs"].forEach(param => {
            inputs.push(param.type);
        })
        abi_hash += Web3EthAbi.encodeParameters(inputs,JSON.parse(body["args"])).substring(2)
    }
    // Send Custom Request
    await web3.eth.call({
        to: body["contract_address"],
        data: abi_hash
    }).then(result => {
        let decodeParameters = Web3EthAbi.decodeParameters(outputs,result);
        res.json(decodeParameters);
    }).catch(error => {
        res.json({
            result: false,
            error: error
        });
    });
})

api.post("/sign/message",async (req,res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    const { walletConnector, web3 } = connectMap[body["device_id"]]

    // Draft Message Parameters
    const message = body["message"];

    const msgParams = [
        web3.utils.utf8ToHex(message),                                              // Required
        device.accounts[0],                             // Required
    ];
    // Sign personal message
    walletConnector
        .signPersonalMessage(msgParams)
        .then((result) => {
            // Returns signature.
            var ticketId = uuidv4();
            res.json({
                result: true,
                signature: result
            });
        })
        .catch(error => {
            // Error returned when rejected
            res.json({
                result: true,
                error: error
            });
        })
});

api.post("/verify/message",(req,res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    const { web3 } = connectMap[body["device_id"]];

    let address = web3.eth.accounts.recover(body["message"], body["signature"]);
    if(address == device.accounts[0]){
        res.json({result: true});
    }else{
        res.json({result: false});
    }
})

api.get("/getConnectAccount",(req,res) => {
    res.json(deviceMap);
});

api.get("/getAbis",(req,res) => {
    res.json(abiMap);
});

api.get("/getTickets",(req,res) => {
    res.json(resultMap);
});

api.get('/ping', (req, res) => {
    res.send('pone!')
});

module.exports = api;
