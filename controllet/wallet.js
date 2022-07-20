const express = require('express');

const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const utils = require("../common/utils");
const walletconnect = require("../common/walletconnect");


// Create connector
let { connectMap, deviceMap, abiMap, resultMap } = require("../common/global");

const api = express.Router();
api.post("/wallet/info",(req,res) => {
    const body = req.body;
    let deviceMapElement = deviceMap[body["device_id"]];
    if(deviceMapElement){
        res.json(utils.toReturn(true,deviceMapElement));
    }else{
        res.json(utils.toReturn(false,"No Login"));
    }
});

api.post("/abi",(req,res) => {
    const body = req.body;
    let hash = crypto.createHash('sha256').update(body.abi).digest('hex');
    abiMap[hash] = JSON.parse(body.abi);
    res.json(utils.toReturn(true,hash));
})

api.post('/send/transaction',async (req, res) => {
    const body = req.body;
    const deviceID = body["device_id"];
    const device = deviceMap[deviceID];
    const { walletConnector, web3 } = connectMap[deviceID];
    const abi = abiMap[body["abi_hash"]];

    let { abiHash } = utils.encodeParamsABI(abi,JSON.parse(body["args"]),body["method"])

    // Draft transaction
    let tx = {
        to: body["contract_address"], // Required (for non contract deployments)
        data: abiHash, // Required
        // gasPrice: "0x02540be400", // Optional
        // gas: "0x9c40", // Optional
        // value: "0x00", // Optional
        // nonce: "0x0114", // Optional
    };
    let result;
    if(device["isProxy"]){
        result = await walletconnect.sendTXOfficial(tx,web3).catch((error) => {
            // Error returned when rejected
            res.json(utils.toReturn(false,error));
            throw error;
        });
    }else{
        tx["from"] = device.accounts[0]
        result = await walletconnect.sendTXWallet(tx, walletConnector).catch((error) => {
            // Error returned when rejected
            res.json(utils.toReturn(false,error));
            throw error;
        });

    }
    let ticketId = uuidv4();
    resultMap[ticketId] = {
        "tx_hash": result,
        code: 0,
        status: "wait",
    }
    res.json(utils.toReturn(true,ticketId));
    utils.pollingTxResult(result, ticketId, web3, 0);
})

api.post('/result',(req, res) => {
    const body = req.body;
    const ticket = resultMap[body["ticket"]];
    res.json(utils.toReturn(true,ticket));
})

api.post('/call/method', async (req, res) => {
    const body = req.body;
    const { web3 } = connectMap[body["device_id"]]
    const abi = abiMap[body["abi_hash"]];
    let { abiHash, data} = utils.encodeParamsABI(abi,JSON.parse(body["args"]),body["method"])

    let outputs = [];
    data["outputs"].forEach(param => {
        outputs.push(param.type);
    })
    const result = await walletconnect.call(outputs, abiHash, body["contract_address"],web3).catch(error => {
        res.json(utils.toReturn(false,false));
        throw error;
    });
    res.json(utils.toReturn(false, result));
})

api.post("/sign/message",async (req,res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    if(device["isProxy"]){
        res.json(utils.toReturn(false, "Please create your own wallet and claim it"));
        return;
    }

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
            res.json({
                result: true,
                signature: result
            });
            res.json(utils.toReturn(true, result));
        })
        .catch(error => {
            // Error returned when rejected
            res.json(utils.toReturn(false, error));
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
