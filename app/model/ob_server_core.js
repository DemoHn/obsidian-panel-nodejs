const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    /*
    A server mod is a singular .jar file that runs Minecraft Server instances.
    Because of the low performance and high RAM consumption of MC Vanilla Server (official),
    there're many optimized branches of this mod, like Bukkit, Spigot, KCauldron, SpongeForge and so on.

    Notice: Each mod has its own version number and correspond Minecraft version.
    */
    return seq_obj.define('ServerCore',{
        core_id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // file size (unit: Bit)
        file_size : Seq.INTEGER,
        // core file name
        file_name : Seq.STRING(100),
        // file working dir
        file_dir : Seq.TEXT,
        // which user upload this file
        file_uploader : Seq.INTEGER,
        // createAt
        create_time : Seq.DATE,
        // md5 hash
        file_hash : Seq.STRING(80),
        // type of core file. Like KCauldron, Bukkit, etc.
        core_type : Seq.STRING(100),
        // core version
        core_version : Seq.STRING(10),
        // minecraft version
        minecraft_version : Seq.STRING(10),
        // note
        note : Seq.TEXT
    },{
        tableName:"ob_server_core"
    })
}