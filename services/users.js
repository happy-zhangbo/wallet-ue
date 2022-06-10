const db = require("../db/database");
const utils = require("../common/utils");
const {v4: uuidv4} = require("uuid");


const self = {
    findByAddress: async (address) => {
        const rows = await db.get("select * from users where master_address = ?",address).catch(err => {
            throw err;
        });
        return rows;
    },
    findByUid: async (uid) => {
        const rows = await db.get("select * from users where uid = ?",uid).catch(err => {
            throw err;
        });
        return rows;
    },
    insertUser: async (proxy, masterAddress, email, password) => {
        let wallet = utils.createWallet();
        var uuid = uuidv4();
        let insert = 'INSERT INTO users VALUES (?,?,?,?,?,?,?)';
        await db.all(insert,[proxy, wallet[0], wallet[1], masterAddress, password, uuid, email]).catch(err => {
            throw err;
        });
        return await self.findByUid(uuid);
    },
    findByEmailAndPassword: async (email, password) => {
        const rows = await db.get("select * from users where `email` = ? and `password`= ?",[email, password]).catch(err => {
            throw err;
        });
        return rows;
    },
    findByEmail: async (email) => {
        const rows = await db.get("select * from users where `email` = ?",[email]).catch(err => {
            throw err;
        });
        return rows;
    },
    updateDataById: async (uid,data) => {
        if(!uid){
            throw new Error("UID is NUll");
        }
        let params = [uid];
        let update = "UPDATE users SET";
        if(data["proxy_status"]){
            update += " proxy_status = ?,"
            params.unshift(data["proxy_status"]);
        }
        if(data["proxy_address"]){
            update += " proxy_address = ?,"
            params.unshift(data["proxy_address"]);
        }
        if(data["proxy_private_key"]){
            update += " proxy_private_key = ?,"
            params.unshift(data["proxy_private_key"]);
        }
        if(data["master_address"]){
            update += " master_address = ?,"
            params.unshift(data["master_address"]);
        }
        if(data["password"]){
            update += " password = ?,"
            params.unshift(data["password"]);
        }
        if(data["email"]){
            update += " email = ?,"
            params.unshift(data["email"]);
        }
        update = update.substring(0,update.length-1)+ " where uid = ?";
        await db.all(update,params).catch(err => {
            throw err;
        });
        return await self.findByUid(uid);
    }
};


module.exports = self
