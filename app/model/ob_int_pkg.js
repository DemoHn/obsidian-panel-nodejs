const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    /*
    A server mod is a singular .jar file that runs Minecraft Server instances.
    Because of the low performance and high RAM consumption of MC Vanilla Server (official),
    there're many optimized branches of this mod, like Bukkit, Spigot, KCauldron, SpongeForge and so on.

    Notice: Each mod has its own version number and correspond Minecraft version.
    */
    return seq_obj.define('IntegratedPackage',{
        pkg_id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // file size (unit: Bit)
        file_size : Seq.INTEGER,
        // where does the file stored
        file_path : Seq.TEXT,
        // which user upload this file
        file_uploader : Seq.INTEGER,
        // createAt
        create_time : Seq.DATE,
        // md5 hash (TODO)
        file_hash : Seq.STRING(80),
        // executable jar location (relative to the zip file)
        // notice: use '/' seperator instead of '\'
        exec_jar : Seq.TEXT,
        // minecraft version
        minecraft_version : Seq.STRING(10),
        // note
        note : Seq.TEXT,
        // package name, defined by admin 
        package_name: Seq.TEXT
    },{
        tableName:"ob_int_pkg"
    })
}