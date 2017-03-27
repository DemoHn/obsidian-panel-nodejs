const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('Token',{
        token_id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // username (for login) 
        uid : Seq.INTEGER,
        // hash 
        token : Seq.STRING(50),
        // email
        last_login: Seq.DATE
    },{
        tableName:"ob_token"
    })
}