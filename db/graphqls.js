const { GraphQLClient } = require('graphql-request');
const client = new GraphQLClient("http://127.0.0.1:3001", { headers: {} })
module.exports = {
    client
}