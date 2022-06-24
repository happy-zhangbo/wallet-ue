const express = require('express');
const ipfs = require("../common/ipfs_common");
const token = require("../services/token");
//global
let { connectMap, deviceMap, abiMap } = require("../common/global");



const api = express.Router();

api.post("/getTokenByAddress",async (req, res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    let tokens = [];
    if(device.accounts.length > 0){
        const result = await token.findTokenByAddress(device.accounts[0],body["contract_address"].substring(2));
        result.forEach(item => {
            tokens.push(item["token_id"]);
        })
    }
    let tokenProxy = [];
    if(device.proxyAccount){
        const result = await token.findTokenByAddress(device.proxyAccount,body["contract_address"].substring(2));
        result.forEach(item => {
            tokenProxy.push(item["token_id"]);
        })
    }
    res.json({
        result: true,
        data:{
            proxy: tokenProxy,
            master: tokens
        }
    });
});

api.post("/saveMetadata",async (req,res) => {
    const body = req.body;
    const metadata = body["metadata"];
    console.log(body);
    if(metadata){
        const cid = await ipfs.add(JSON.stringify(metadata)).catch(err => {
            return err;
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
