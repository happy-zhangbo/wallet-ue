const express = require('express');
const ipfs = require("../common/ipfs_common");
const token = require("../services/token");
const walletconnect = require("../common/walletconnect")
const utils = require("../common/utils")
//global
let { connectMap, deviceMap } = require("../common/global");

const api = express.Router();

api.post("/getTokenByAddress",async (req, res) => {
    const body = req.body;
    const device = deviceMap[body["device_id"]];
    let tokens = [];
    if(device["accounts"] && device.accounts.length > 0){
        const account = utils.toChecksumAddress(device.accounts[0])
        const result = await token.findTokenByAddress(account);
        result.forEach(item => {
            tokens.push(item);
        })
    }
    let tokenProxy = [];
    if(device["proxyAccount"]){
        const account = utils.toChecksumAddress(device.proxyAccount)
        const result = await token.findTokenByAddress(account);
        result.forEach(item => {
            tokenProxy.push(item);
        })
    }
    const data = {
        proxy: tokenProxy,
        master: tokens
    }
    res.json(utils.toReturn(true, data));
});

api.post("/sign/metadata", async (req, res) => {
    const body = req.body;
    const signData = body["data"];
    const { web3 } = connectMap[body["device_id"]]

    const sign = await walletconnect.signMetaDataMsg(signData, web3).catch(err => {
        res.json(utils.toReturn(false,err));
    });
    res.json(utils.toReturn(true,sign));
})

api.post("/saveMetadata",async (req,res) => {
    const body = req.body;
    const metadata = body["metadata"];
    if(metadata){
        const cid = await ipfs.add(JSON.stringify(metadata)).catch(err => {
            return err;
        });
        res.json(utils.toReturn(true, cid));
    }else{
        res.json(utils.toReturn(false, "No Metadata"));
    }
})

api.post("/getMetadata",async (req,res) =>{
    const body = req.body;
    const ipfsHash = body["ipfs_hash"];
    const content = await ipfs.cat(ipfsHash.substring(7)).catch(err => {
        res.json(utils.toReturn(false, err));
        return;
    })
    res.json({
        result: true,
        data: JSON.parse(content)
    })
})



module.exports = api;
