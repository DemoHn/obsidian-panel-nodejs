const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('FTPAccount',{
        id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // FTP username (for login)
        username : Seq.STRING(80),
        // inst id for this data point
        inst_id : Seq.INTEGER,
        // FTP password hash
        hash = Seq.STRING(120),
        // last login
        last_login : Seq.DATE,
        // owner's id
        owner_id : Seq.INTEGER,
        // permission str
        // NOTICE: since this scheme is migrated from python verion,
        // check pyftdlib for the meaning of default string 
        permission : {
            type: Seq.STRING(50),
            defaultValue: "elradfmw"
        },
        // whether use admin's login password or not
        default_password: {
            type: Seq.BOOLEAN,
            defaultValue: true
        }
    },{
        tableName:"ob_ftp_account"
    })
}