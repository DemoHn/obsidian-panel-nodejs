const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('JavaBinary',{
        id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // java version (main)
        major_version : Seq.STRING(10),
        // minor version. e.g. : '1.8.10_92'. '1.8.10' is major and '92' is minor
        minor_version : Seq.STRING(10),
        // execute result
        bin_directory : Seq.TEXT,
        // install time
        install_time : Seq.DATE
    },{
        tableName:"ob_java_bin"
    })
}