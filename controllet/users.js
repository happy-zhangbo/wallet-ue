const express = require('express');
const utils = require("../common/utils");

const walletconnect = require("../common/walletconnect");
let { deviceMap } = require("../common/global");
const {error} = require("winston");

const api = express.Router();

api.post("/login",async (req, res) => {
    const body = req.body;
    if(!body["device_id"]){
        res.json({
            result: false
        })
        return;
    }
    const deviceId = body["device_id"];
    const method = body["method"];
    switch (method){
        case "metamask":
            const qr = await walletconnect.connect(deviceId,async function(accounts,chainId){
                deviceMap[deviceId] = {
                    accounts: accounts,
                    chainId: chainId,
                    isProxy: false
                }
            });
            res.json({
                result: true,
                login: true,
                uri: qr,
                session: qr.split("?")[0]
            });
            break;
        case "email":
            if(utils.getChainURI(1008,null, deviceId)){
                if(!body["key"]){
                    res.json({
                        result: false,
                        error: "NO KEY"
                    });
                    return;
                }
                const salt = utils.numberToUint256(body["key"]);
                if(body["generate"]){
                    //计算create2代理合约地址
                    const result = await walletconnect.getProxyAddress(salt, deviceId).catch(error => {
                        res.json({
                            result: false,
                            error: error
                        });
                        throw error;
                    });
                    deviceMap[deviceId] = {
                        proxyAccount: result,
                        chainId: "1008",
                        isProxy: true,
                        key: salt
                    };
                    res.json({
                        result: true,
                        data: result
                    });
                }else{
                    if(body["proxyAddress"]){
                        deviceMap[deviceId] = {
                            proxyAccount: body["proxyAddress"],
                            chainId: "1008",
                            key: salt,
                            isProxy: true
                        };
                    }else{
                        res.json({
                            result: false,
                            error: "Please enter the proxy account address"
                        });
                        return;
                    }
                }
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
            deviceMap[deviceId]["isProxy"] = false;
        }
    });
    res.json({
        result: true,
        login: true,
        uri: qr,
        session: qr.split("?")[0]
    });
})

module.exports = api;
