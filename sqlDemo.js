const user = require("./services/users")

user.findByUid("097db585-09f9-4a88-8cc7-62a39080793a").then(res => {
    res["master_address"] = "421";

    user.updateDataById("097db585-09f9-4a88-8cc7-62a39080793a", res).then(r => {
        console.log(r);
    })
});
