const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('HistoryData',{
        data_id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // data point happen time (x-axis time)
        time : Seq.STRING(10),
        // inst id for this data point
        inst_id : Seq.INTEGER,
        // data key name
        // like 'online_player' or 'memory' or something else
        key : Seq.TEXT,
        // data value
        value : Seq.TEXT
    },{
        tableName:"ob_history_data"
    })
}