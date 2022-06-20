const client = require("../db/postgresql");

const self = {
    async findTokenByAddress(address,contractAddress){
        const sql = "select * from token_transfers tt \n" +
            "        WHERE\n" +
            "            (tt.to_address_hash = decode($1,'hex') OR tt.from_address_hash =  decode($1,'hex')) \n" +
            "        and \n" +
            "        \ttt.token_contract_address_hash = decode($2,'hex')\n" +
            "        AND\n" +
            "            tt.token_id NOT IN (SELECT token_id FROM token_transfers WHERE from_address_hash = decode($1,'hex'))\n" +
            "        ORDER BY block_number DESC"
        const res = await client.query(sql,[address, contractAddress]).catch(err => {
            throw err;
        });
        await client.end();
        return res.rows

    }
}

module.exports = self