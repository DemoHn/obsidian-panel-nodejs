const colors = require("colors");

// "YYYY-MM-DD hh:mm:ss" format
const _format_time = (date) => {
    const _padding_zero = (num) => {
        if(num < 10){
            return "0" + num;
        }else{
            return num;
        }
    }

    const _year = date.getFullYear(),
          _month = _padding_zero(date.getMonth()+1),
          _date  = _padding_zero(date.getDate()),
          _hour  = _padding_zero(date.getHours()),
          _minute  = _padding_zero(date.getMinutes()),
          _second  = _padding_zero(date.getSeconds());

    let _d = `${_year}/${_month}/${_date} ${_hour}:${_minute}:${_second}`;
    return _d;
};

module.exports = (proc) => {
    console.log(proc);
    console.log(proc["pm2_env"]);
/*
    const status = proc["pm2_env"]["status"] + "";
    const pid = proc['process']['pid'] + "";
    const restart_time = proc["pm2_env"]["restart_time"] + "";
*/
    console.log("+----------------------------------+".white);
    console.log("|                                  |".white);
    console.log("|   obsidian-panel: status report  |".white);
    console.log("|             @Nigshoxiz           |".white);
    console.log(`|     time: ${_format_time(new Date())}    |`.white);
    console.log("|                                  |".white);
    console.log("+----------------------------------+".white);
    console.log("\n"); // enter 2 lines
    /*
    console.log("====================================");
    console.log(`|     status     |\t${status.bgBlue.white}\t|`);
    console.log(`|     pid        |\t${pid.bgBlue.white}\t|`);
    console.log(`|     restart    |\t${restart_time.bgBlue.white}\t|`);
    console.log("====================================");*/
}