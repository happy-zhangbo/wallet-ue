const { client } = require("../db/graphqls");
const { gql } = require('graphql-request');
const self = {
    async findTokenByAddress(address){
        const query = gql`
          query {
            gameItemsTransferEvents(filter: {
              or: [
                { from: { equalTo: "${address}" }},
                { to: { equalTo: "${address}" }}
              ]
            }) {
                nodes {
                    id
                    from
                    to
                    tokenId
                }
            }
        }`
        const data = await client.request(query);
        const resArray = data["gameItemsTransferEvents"]["nodes"]
        let tokens = [];
        for (const resArrayElement of resArray) {
            const to = resArrayElement["to"];
            const tokenId = resArrayElement["tokenId"]
            if (to === address) {
                tokens.push(tokenId)
            }
        }
        for (const resArrayElement of resArray) {
            const from = resArrayElement["from"];
            const tokenId = resArrayElement["tokenId"]
            if (from === address) {
                tokens= tokens.filter((value, index, arr) => {
                    return value !== tokenId;
                });
            }
        }
        return tokens;
    }
}
module.exports = self;