const {Client} = require('pg')
const connectionString = 'postgresql://postgres:123123@127.0.0.1:5432/postgres'

const client = new Client({
    connectionString,
})
client.connect();
module.exports = client;