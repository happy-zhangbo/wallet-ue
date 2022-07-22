var sigUtil = require("eth-sig-util")
const utils = require("./common/utils");


const typedData = {
    "types": {
        "EIP712Domain": [
            {"name": "name", "type": "string"},
            {"name": "version", "type": "string"},
            {"name": "chainId", "type": "uint256"},
            {"name": "verifyingContract", "type": "address"}
        ],
        "Permit": [
            {
                "name": "owner",
                "type": "address"
            },
            {
                "name": "spender",
                "type": "address"
            },
            {
                "name": "value",
                "type": "uint256"
            },
            {
                "name": "nonce",
                "type": "uint256"
            },
            {
                "name": "deadline",
                "type": "uint256"
            }
        ]
    },
    "primaryType": "Permit",
    "domain": {
        "name": "Gold",
        "version": "1",
        "chainId": 1,
        "verifyingContract": "0x9D7f74d0C41E726EC95884E0e97Fa6129e3b5E99"
    },
    "message": {
        "owner": "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4",
        "spender": "0xd2a5bC10698FD955D1Fe6cb468a17809A08fd005",
        "value": 100000,
        "nonce": 0,
        "deadline": 1658487189
    }
}


function main(){
    var privateKey = "503f38a9c967ed597e47fe25643985f032b072db8075426a92110f82df48dfcb";
    var privateKeyHex = Buffer.from(privateKey, 'hex')

    var result = sigUtil.signTypedData_v4(privateKeyHex, { data: typedData });

    let sign = result.substring(2, result.length);
    let hexV = sign.substring(sign.length-2,sign.length)
    let data = {
        v: utils.hexToNUmber(`0x${hexV}`),
        r: `0x${sign.substring(0,64)}`,
        s: `0x${sign.substring(64,128)}`,
        sign: result
    }
    console.log(data);
}

main();






