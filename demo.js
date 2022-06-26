const vault = require("./common/vault")
const utils = require("./common/utils");
const { factoryABI } = require("./common/constant");

async function main(){
    console.log(utils.soliditySha3("a", 123));
}

main()
