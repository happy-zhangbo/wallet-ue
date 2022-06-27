module.exports = {
    factoryAddress: "0x3Bd5Ef404B7c784e858958D9d7212C80B8f1893B",
    factoryABI: [
        {
            "inputs": [
                {
                    "internalType": "bytes32",
                    "name": "salt",
                    "type": "bytes32"
                }
            ],
            "name": "calculation",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "nftToken",
                    "type": "address"
                },
                {
                    "internalType": "uint256[]",
                    "name": "tokens",
                    "type": "uint256[]"
                },
                {
                    "internalType": "bytes32",
                    "name": "salt",
                    "type": "bytes32"
                }
            ],
            "name": "createDSalted",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ],
    officialPath: "official/account"
};


