# Install Node.js

https://nodejs.org/en/

```shell
> node -v
14.19.1

> npm -v
6.14.16
```

# Clone Project

```shell
> git clone https://github.com/happy-zhangbo/wallet-ue.git
Waiting......
```

# Install Package

```shell
> cd wallet-ue
> npm install
Waiting......
```

# Run

```shell
> node index.js
body-parser deprecated bodyParser: use individual json/urlencoded middlewares index.js:32:9
body-parser deprecated undefined extended: provide extended option node_modules/body-parser/index.js:105:29
Example app listening on port 3000
```

# Smart Contracts

Open

https://remix.ethereum.org/

After compiling and deploying, you will get the contract address and ABI.

# API Call Flow

1. Calling the Connect interface will return the bridge string, which needs to be converted into a QR code and scanned using metamask.
2. Calling the WalletInfo interface will return the connected wallet address and chain ID
3. Calling the Abi interface will perform the hash operation on the Abi and return the hash.
4. To call the SendTx interface, pass in "contract address", "abi_hash", "method", " args", calling this interface will result in a popup window in metasmask. Confirmation will return the transaction hash
5. To call the CallMethod interface, you need to pass the "contract address", "abi_hash", "method" and "args" parameters, which will return the result of the call.

# API Documentation

The interface can be viewed and used through Postman.

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/14909165-e71eee17-9f30-41eb-b1f9-913bfef546d7?action=collection%2Ffork&collection-url=entityId%3D14909165-e71eee17-9f30-41eb-b1f9-913bfef546d7%26entityType%3Dcollection%26workspaceId%3Dc9137c59-d8cc-44c5-8a87-0dc7eaf8dec1)

# Update Log

### 20220526

ADD ERC721A contract

ADD find NFT by Adrress

### 20220525

Add winstonLogger Log frame

Add device_Id duplicate verification

Add check transaction results based on ticketId

Add signature and verify signature function

Add Query Data

Update Transaction Return to content

Update Express for Modularity
