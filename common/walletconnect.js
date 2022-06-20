const { default: NodeWalletConnect } = require("@walletconnect/client");
const winlogger = require("../log/winstonLogger");
const utils = require("./utils");
//global

module.exports = {
    connect: async (deviceId,callback)=> {
        let walletConnector;
        walletConnector = new NodeWalletConnect(
            {
                // Required
                bridge: "https://bridge.walletconnect.org",
                // Required
                clientMeta: {
                    description: "Black Warrior App",
                    url: "https://walletconnect.org",
                    icons: ["https://walletconnect.org/walletconnect-logo.png"],
                    name: "Black Warrior",
                }
            }
        );
        let uri;
        // Check if connection is already established
        if (!walletConnector.connected) {
            // create new session
            await walletConnector.createSession();
            uri = walletConnector.uri;
        }
        // Subscribe to connection events
        walletConnector.on("connect", async (error, payload) => {
            if (error) {
                throw error;
            }
            const { accounts, chainId } = payload.params[0];
            const isOpenChain = utils.getChainURI(chainId, walletConnector, deviceId);
            if(isOpenChain){
                winlogger.info("connect success: accountID: "+accounts[0]+",chainID:"+chainId);
                callback(accounts,chainId);
            }else{
                winlogger.warn("The current network is not supported,Please switch the network and scan the code again");
            }
        });
        return uri;
    }
}
