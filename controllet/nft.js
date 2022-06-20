const express = require('express');
const ipfs = require("../common/ipfs_common");
const token = require("../services/token");
//global
let { connectMap, deviceMap, abiMap } = require("../common/global");



const api = express.Router();

api.post("/getTokenByAddress",async (req, res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    const { web3 } = connectMap[body["device_id"]];
    const abi = abiMap[body["abi_hash"]];
    let tokenIds = [];
    const result = await token.findTokenByAddress(device.accounts[0].substring(2),body["contract_address"].substring(2));
    result.forEach(item => {
        tokenIds.push(item["token_id"]);
    })
    res.json({
        result: true,
        data:tokenIds
    });
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
    const content = await ipfs.cat(ipfsHash.substring(7)).catch(err => {
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
