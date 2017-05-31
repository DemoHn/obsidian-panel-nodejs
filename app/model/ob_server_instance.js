const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('ServerInstance',{
        inst_id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // owner id
        owner_id : Seq.INTEGER,
        // instance name
        inst_name : Seq.STRING(100),
        // latest launch date of this instance
        last_start_time: Seq.DATE,
        // core file id
        core_file_id : Seq.INTEGER,
        // java bin file id
        java_bin_id : Seq.INTEGER,
        // listening port
        listening_port : { type: Seq.INTEGER, unique: true},
        // max_RAM allocated
        max_RAM : Seq.INTEGER,
        // max allowed online users
        max_user : Seq.INTEGER,
        // instance store directory
        inst_dir : Seq.TEXT,
        //star (one user could star only one instance)
        // if this instance is starred, it will be shown at first
        star : Seq.BOOLEAN,

        // add the folllowing column since v0.6.1 - DemoHn 31//5/2017
        int_pkg_id: Seq.INTEGER,
        // use int_pkg or core_file?
        use_integrated_package: { type: Seq.BOOLEAN, default: false }

    },{
        tableName:"ob_server_instance"
    })
}