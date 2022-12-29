const { client } = require("../db/graphqls");
const { gql } = require('graphql-request');

const { query } = require('../db/mysql');
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
    },
    async findTokenByAddressToMysql(address) {
      const findSql = "SELECT * FROM `aboveland_nft_owner` WHERE (`to` = ? OR `from` = ?) AND token_id NOT IN (SELECT token_id FROM `aboveland_nft_owner` WHERE `from` = ?) ORDER BY `block_number` DESC";
      const results = await query(findSql, [address,address,address]);
      let tokens = [];
      for (let resArrayElement of results) {
          tokens.push(resArrayElement["token_id"]);
      }
      return tokens; 
    }
}

module.exports = self;