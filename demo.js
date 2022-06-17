const vault = require("./common/vault")
const utils = require("./common/utils")


async function main(){
    // const data = await utils.createWallet()
    // console.log(data);

    const data = await vault.read();
    console.log(data);
}

main()