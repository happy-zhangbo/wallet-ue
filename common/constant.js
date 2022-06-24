module.exports = {
    factoryAddress: "0x8516276Fa0e3731190358e6b5a4dAad2855a4738",
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


