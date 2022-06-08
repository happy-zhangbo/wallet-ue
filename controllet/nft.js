const express = require('express');
const fs = require('fs');
const pinataSDK = require('@pinata/sdk');
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
            if(returnValues["to"].toLowerCase() === device.accounts[0].toLowerCase()){
                tokenIds.push(tokenID);
            }
            if(returnValues["from"].toLowerCase() === device.accounts[0].toLowerCase()){
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

api.post("/uploadFileToIpfs",(req, res) => {
    const pinata = pinataSDK('e9354b4499f03a94b0c0', '87ebd73c2e75d6a4533a6ee96fac9f52b48cc42cecc7d2a5d00d33a1e87193a7');
    const readableStreamForFile = fs.createReadStream('./1.png');
    const options = {
        pinataMetadata: {
            name: 'MyCustomName',
            keyvalues: {
                customKey: 'customValue',
                customKey2: 'customValue2'
            }
        },
        pinataOptions: {
            cidVersion: 0
        }
    };

    pinata.pinFileToIPFS(readableStreamForFile, options).then((result) => {
        //handle results here
        console.log(result);
    }).catch((err) => {
        //handle error here
        console.log(err);
    });
})



module.exports = api;
