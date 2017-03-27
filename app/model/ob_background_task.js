const Seq = require("sequelize");

module.exports = (seq_obj)=>{
    return seq_obj.define('BackgroundTask',{
        task_id: {type: Seq.INTEGER, primaryKey: true, autoIncrement: true},
        // task name
        task_name : Seq.STRING(80),
        // task args
        task_args : Seq.TEXT,
        // owner id 
        owner_id : Seq.INTEGER,
        // # crontab string
        //# **NOTICE**: The following defined format is differnet from the crontab format normally we use!
        //#
        //# format:
        //# <year> <month_of_the_year> <day_of_the_month> <week> <day_of_the_week> <hour> <minute> <second>
        //#
        //# example:
        //# * * * * Fri */6 30 0
        //# means Every year/month/day/day_of_week, every Friday, per 6 hour (i.e. : 6am, 12am, 6pm, 12pm), minute = 30, second = 0
        //# Thus the task will be executed 4 times per day: 6:30am, 12:30am, 6:30pm, 12:30pm
        //
        cron_data : Seq.STRING(80),
        // created at
        create_time : Seq.DATE
    },{
        tableName:"ob_background_task"
    })
}