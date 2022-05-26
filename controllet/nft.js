const express = require('express');
//global
let { connectMap, deviceMap, abiMap, resultMap } = require("./global");


const api = express.Router();

api.post("/getTokenByAddress",async (req, res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    const { web3 } = connectMap[body["device_id"]]
    const abi = abiMap[body["abi_hash"]];
    const myContract = new web3.eth.Contract(abi, body["contract_address"]);
    await myContract.getPastEvents('Transfer', {
        fromBlock: 0,
        toBlock: 'latest'
    }).then(result => {
        console.log(result);
        let tokenIds = [];
        result.forEach(item => {
            const returnValues = item["returnValues"];
            let tokenID = returnValues["tokenId"];
            if(returnValues["to"] == device.accounts[0]){
                tokenIds.push(tokenID);
            }
            if(returnValues["from"] == device.accounts[0]){
                tokenIds.map((val, i) => {
                    if(val === tokenID){
                        tokenIds.splice(i, 1);
                    }
                });
            }
        });
        res.json({
            result: true,
            data:tokenIds
        });
    })
});

module.exports = api;
