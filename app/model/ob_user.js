const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('User',{
        id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // username (for login) 
        username : {type: Seq.STRING(80), unique: true},
        // hash 
        hash : Seq.STRING(120),
        // email
        email: Seq.STRING(120),
        // join time
        join_time : {
            type: Seq.DATE,
            defaultValue: new Date()
        },
        // privilege
        privilege : {
            type: Seq.INTEGER,
            deafaultValue: 0
        }
    },{
        tableName:"ob_user"
    })
}