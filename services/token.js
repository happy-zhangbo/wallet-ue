const { client } = require("../db/graphqls");
const { gql } = require('graphql-request');
const self = {
    async findTokenByAddress(address){
        const query = gql`
          query {
            owners(filter: {
                or: [
                  { owner: { equalTo: "${address}" }}
                ]
            }) {
                nodes {
                    id
                }
            }
          }`
        const data = await client.request(query);
        const resArray = data["owners"]["nodes"];
        let tokens = [];
        for (let resArrayElement of resArray) {
            tokens.push(resArrayElement["id"]);
        }
        return tokens;
    }
}
module.exports = self;