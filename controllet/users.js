const express = require('express');
const utils = require("../common/utils");

const walletconnect = require("../common/walletconnect");
let { deviceMap } = require("../common/global");
const api = express.Router();

api.post("/login",async (req, res) => {
    const body = req.body;
    const deviceId = body["device_id"];
    const method = body["method"];
    switch (method){
        case "metamask":
            const key = body["key"]
            const qr = await walletconnect.connect(deviceId,async function(accounts,chainId){
                let device = {
                    accounts: accounts,
                    chainId: chainId,
                    isProxy: false
                }
                if(key){
                    //计算create2代理合约地址
                    const salt = utils.numberToUint256(key);
                    const proxyAddress = utils.getProxyAddress(salt);
                    device["proxyAccount"] = proxyAddress;
                    device["key"] = salt;
                }
                deviceMap[deviceId] = device;
            });
            res.json(utils.toReturn(true,qr))
            break;
        case "email":
            if(utils.getChainURI(1008,null, deviceId)){
                if(!body["key"]){
                    res.json(utils.toReturn(false,"NO KEY"))
                    return;
                }
                //计算create2代理合约地址
                const salt = utils.numberToUint256(body["key"]);
                const proxyAddress = utils.getProxyAddress(salt);
                deviceMap[deviceId] = {
                    proxyAccount: proxyAddress,
                    chainId: "1008",
                    isProxy: true,
                    key: salt
                };
                res.json(utils.toReturn(true,proxyAddress))
            }
            break;
        default:
            break;
    }
});

api.post("/bind",async (req,res) => {
    const body = req.body;
    if(!body["device_id"]){
        res.json({
            result: false
        })
        return;
    }
    const deviceId = body["device_id"];
    const qr = await walletconnect.connect(deviceId,async function(accounts,chainId){
        let device = deviceMap[deviceId];
        if(device){
            deviceMap[deviceId]["accounts"] = accounts;
            deviceMap[deviceId]["chainId"] = chainId;
            deviceMap[deviceId]["isProxy"] = false;
        }
    });
    res.json(utils.toReturn(true,qr));
})

module.exports = api;
