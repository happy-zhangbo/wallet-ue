const NodeWalletConnect = require("@walletconnect/client").default;
const Web3EthAbi = require('web3-eth-abi');
const crypto = require('crypto');

const Web3 = require("web3");

const express = require('express');
var bodyParser = require('body-parser');

const app = express()
const port = 3000

// Create connector
const walletConnector = new NodeWalletConnect(
    {
        // Required
        bridge: "https://bridge.walletconnect.org",
        // Required
        clientMeta: {
            description: "WalletConnect Developer App",
            url: "https://walletconnect.org",
            icons: ["https://walletconnect.org/walletconnect-logo.png"],
            name: "WalletConnect",
        },
    }
);

let web3;

let deviceMap = {};
let abiMap = {};
app.use(bodyParser())
app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.post('/connect',(req, res) => {
    const body = req.body;
    // Check if connection is already established
    if (!walletConnector.connected) {
        // create new session
        walletConnector.createSession().then(() => {
            // get uri for QR Code modal
            const uri = walletConnector.uri;
            // display QR Code modal
            res.send(uri);
        });
    }
    // Subscribe to connection events
    walletConnector.on("connect", (error, payload) => {
        if (error) {
            throw error;
        }
        const { accounts, chainId } = payload.params[0];
        deviceMap[body.deviceId] = {
            accounts: accounts,
            chainId:chainId
        };
        web3 = new Web3("https://rinkeby.infura.io/v3/fb000ce8a4944ec0971045125fa286ee");
        console.log("connect success");
        console.log(accounts, chainId);
    });
})

app.post("/wallet/info",(req,res) => {
    const body = req.body;

    res.json(deviceMap[body.deviceId]);
})

app.post("/abi",(req,res) => {
    const body = req.body;
    var hash = crypto.createHash('sha256').update(body.abi).digest('hex');
    abiMap[hash] = JSON.parse(body.abi);
    res.json({abi: hash});
})


app.post('/send/transaction', (req, res) => {
    const body = req.body;
    const device = deviceMap[body.deviceId];
    const abi = abiMap[body["abi_hash"]];
    let data = {};
    abi.forEach(func => {
        if(func.name === body["method"]){
            data = func;
        }
    })
    let inputs = [];
    data["inputs"].forEach(param => {
        inputs.push(param.type);
    })
    var abi_hash = Web3EthAbi.encodeFunctionSignature(data);
    abi_hash += Web3EthAbi.encodeParameters(inputs,JSON.parse(body["args"])).substring(2)

    // Draft transaction
    const tx = {
        from: device.accounts[0], // Required
        to: body["contract_address"], // Required (for non contract deployments)
        data: abi_hash, // Required
        // gasPrice: "0x02540be400", // Optional
        // gas: "0x9c40", // Optional
        // value: "0x00", // Optional
        // nonce: "0x0114", // Optional
    };

// Send transaction
    walletConnector
        .sendTransaction(tx)
        .then((result) => {
            // Returns transaction id (hash)
            res.send(result);
        })
        .catch((error) => {
            // Error returned when rejected
            console.error(error);
        });
})

app.post('/call/method', (req, res) => {
    const body = req.body;
    const device = deviceMap[body.deviceId];
    const abi = abiMap[body["abi_hash"]];
    let data = {};
    abi.forEach(func => {
        if(func.name === body["method"]){
            data = func;
        }
    })
    let outputs = [];
    data["outputs"].forEach(param => {
        outputs.push(param.type);
    })
    var abi_hash = Web3EthAbi.encodeFunctionSignature(data);
    // abi_hash += Web3EthAbi.encodeParameters(inputs,JSON.parse(body["args"])).substring(2)
    console.log(abi_hash);
    // Send Custom Request
    web3.eth.call({
        to: body["contract_address"],
        data: abi_hash
    }).then(result => {
        var decodeParameters = Web3EthAbi.decodeParameters(outputs,result);
        res.json(decodeParameters);
    }).catch(error => {
        console.log(error);
    });
})
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})




