const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('TaskLog',{
        log_id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // username (for login) 
        task_id : Seq.INTEGER,
        // execute time 
        issue_time : Seq.DATE,
        // execute result
        issue_result: Seq.BOOLEAN,
        // execute time
        duration : Seq.FLOAT
    },{
        tableName:"ob_task_log"
    })
}