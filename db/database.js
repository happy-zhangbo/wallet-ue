const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/users.db');

module.exports = {
    run: (query) => {
        return new Promise(function(resolve, reject) {
            db.run(query,
                function(err)  {
                    if(err) reject(err.message)
                    else    resolve(true)
                })
        })
    },
    get: (query, params) => {
        return new Promise(function(resolve, reject) {
            db.get(query, params, function(err, row)  {
                if(err) reject("Read error: " + err.message)
                else {
                    resolve(row)
                }
            })
        })
    },
    all: (query, params) => {
        return new Promise(function(resolve, reject) {
            if(params == undefined) params=[]
            db.all(query, params, function(err, rows)  {
                if(err) reject("Read error: " + err.message)
                else {
                    resolve(rows)
                }
            })
        })
    },
    close: () => {
        return new Promise(function(resolve, reject) {
            this.db.close()
            resolve(true)
        })
    }
}