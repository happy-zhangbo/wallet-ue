const {Client} = require('pg')
const client = new Client({
    user: 'postgres',
    host: '192.168.124.177',
    database: 'blockscout',
    password: '123123',
    port: 5432,
})
client.connect();
module.exports = client;