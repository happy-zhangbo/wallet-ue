const express = require('express');
const fs = require('fs');
const multer  = require('multer')


const storage = multer.diskStorage({
    // destination:'public/uploads/'+new Date().getFullYear() + (new Date().getMonth()+1) + new Date().getDate(),
    destination(req,res,cb){
        cb(null,'uploads/');
    },
    filename(req,file,cb){
        const filenameArr = file.originalname.split('.');
        cb(null,Date.now() + '-' + filenameArr[0] + '.' + filenameArr[filenameArr.length-1]);
    }
});

const upload = multer({storage});
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

api.post("/uploadFileToIpfs",upload.single("avatar"),async (req, res) => {
    const file = req.file;
    const body = req.body;
    res.send("ok");
    const pinata = pinataSDK('e9354b4499f03a94b0c0', '87ebd73c2e75d6a4533a6ee96fac9f52b48cc42cecc7d2a5d00d33a1e87193a7');
    const readableStreamForFile = fs.createReadStream(file.path);

    let result =  await pinata.pinFileToIPFS(readableStreamForFile, {}).catch((err) => {
       res.json({
           result: false,
           error: err
       });
        return;
    });
    console.log(result);
    if(result["IpfsHash"]){
        const body = {
            message: 'Pinatas are awesome'
        };
        const ipfsHashMetadata = await pinata.pinJSONToIPFS(body, {}).catch((err) => {
            //handle error here
            res.json({
                result: false,
                error: err
            });
            return;
        });


    }


})



module.exports = api;
