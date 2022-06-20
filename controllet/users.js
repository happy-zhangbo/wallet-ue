const express = require('express');
const db = require("../db/database");
const utils = require("../common/utils");
const users = require("../services/users");

const walletconnect = require("../common/walletconnect");
let { deviceMap } = require("../common/global");

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
                // let rows = await users.findByAddress(accounts[0]);
                // if(!rows){
                //     rows = await users.insertUser(0,accounts[0],"","")
                // }
                // delete rows["password"];
                // delete rows["proxy_private_key"];
                deviceMap[deviceId] = {
                    accounts: accounts,
                    chainId: chainId,
                    // user: rows
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
            //account password
            const email = body["email"];
            const password = body["password"];
            const rows = await users.findByEmailAndPassword(email, password);
            if(!rows){
                res.json({
                    result: false,
                    error: "Current user not found"
                });
            }else{
                delete rows["password"];
                delete rows["proxy_private_key"];
                deviceMap[deviceId] = {
                    result: true,
                    user: rows
                }
                utils.getChainURI(4, {}, deviceId);
                res.json({
                    result: true,
                    user: rows
                });
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
            let user = device.user;
            let rows = await users.updateDataById(user["uid"],{"master_address": accounts[0]});
            delete rows["password"];
            delete rows["proxy_private_key"];
            deviceMap[deviceId] = {
                accounts: accounts,
                chainId: chainId,
                user: rows
            }
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
