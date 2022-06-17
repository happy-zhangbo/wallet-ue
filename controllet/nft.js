const express = require('express');
const ipfs = require("../common/ipfs_common");

//global
let { connectMap, deviceMap, abiMap } = require("../common/global");


const api = express.Router();

api.post("/getTokenByAddress",async (req, res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    const { web3 } = connectMap[body["device_id"]];
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

api.post("/saveMetadata",async (req,res) => {
    const body = req.body;
    const metadata = body["metadata"];
    console.log(body);
    if(metadata){
        const cid = await ipfs.add(JSON.stringify(metadata)).catch(err => {
            res.json({
                result: false,
                error: err
            })
            return;
        });
        res.json({
            result: true,
            data: cid
        })
    }else{
        res.json({
            result: false,
            data: "No Metadata"
        })
    }
})

api.post("/getMetadata",async (req,res) =>{
    const body = req.body;
    const ipfsHash = body["ipfs_hash"];
    const content = await ipfs.cat(ipfsHash).catch(err => {
        res.json({
            result: false,
            error: err
        })
        return;
    })
    res.json({
        result: true,
        data: JSON.parse(content)
    })
})



module.exports = api;
