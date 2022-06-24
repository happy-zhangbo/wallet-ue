const vault = require("./common/vault")
const utils = require("./common/utils");
const { factoryABI } = require("./common/constant");

async function main(){
    const args = "[\"0xaa2556470447803699c4958ad1af70E852E4A308\",[0,1,2,3,4,5,6],\"0x0000000000000000000000000000000000000000000000000000000000000987\"]"

    utils.encodeParamsABI(factoryABI,JSON.parse(args),"createDSalted");

}

main()
