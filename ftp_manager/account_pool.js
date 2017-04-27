let model = require("../app/model");

let account_pool = {};

module.exports = {
    /* account_pool model:
    <username> = {
        hash: <hash>,
        inst_id: <inst_id>,
        inst_dir: <inst_dir>
    }
    */
    update(){
        const FTPAccount = model.get("FTPAccount"),
              ServerInstance = model.get("ServerInstance"),
              User = model.get("User");
        
        if(FTPAccount == null || ServerInstance == null || User == null){
            return ;
        }else{
            FTPAccount.belongsTo(ServerInstance, {foreignKey:"inst_id", targetKey:"inst_id"});
            FTPAccount.belongsTo(User, {foreignKey: "owner_id", targetKey:"id"})
            FTPAccount.findAll({
                include : [ ServerInstance, User ]
            }).then(
                (data) => {
                    for(let i=0;i<data.length;i++){
                        let username = data[i]["username"];
                        let hash;
                        if(data[i]["default_password"]){
                            // get hash from user_db directly
                            hash = data[i]["User"]["hash"];
                        }else{
                            // get hash from FTPAccount db
                            hash = data[i]["hash"];
                        }

                        // = data[i]["hash"];
                        let inst_id = data[i]["inst_id"];
                        let inst_dir = data[i]["ServerInstance"]["inst_dir"];
                        let _model = {
                            "hash" : hash,
                            "inst_id": inst_id,
                            "inst_dir": inst_dir
                        };
                        account_pool[username] = _model;
                    }
                },
                (err) => {
                    console.log(err);
                }
            )
        }
    },

    get(username){
        if(account_pool[username] != null){
            return account_pool[username];
        }else{
            return null;
        }
    },

    get_all(){
        return account_pool;
    }
};