const inst_pool = require("./inst_pool");
const utils = require("../../utils");

const _send_message = (inst_id, event, value) => {
    const io = require("../index").io;
    const _values = {
        event: event,
        inst_id: inst_id,
        value: value
    };

    if(event != null && event != ""){
        io.emit("message", _values);
    }
};

class MCProcessCallback {
    constructor(){

    }

    on_log_update(inst_id, pipe, log){
        let _log;
        if(log instanceof Buffer){
            _log = log.toString();
        }else{
            _log = log;
        }
        // analyse log string
        this._log_string_analyse(inst_id, _log);

        const _formatted_log = inst_pool.get_info(inst_id).format_log(pipe, log, "auto");
        _send_message(inst_id, "log_update", _formatted_log);
        
    }

    on_instance_start(inst_id){
        inst_pool.set_status(inst_id, utils.STARTING);
        // reset RAM and current_player
        inst_pool.get_info(inst_id).reset();
        _send_message(inst_id, "status_change", utils.STARTING);
    }

    on_instance_running(inst_id, start_time){
        inst_pool.set_status(inst_id, utils.RUNNING);
        inst_pool.get_info(inst_id).set_current_player(0);
        
        _send_message(inst_id, "status_change", utils.RUNNING);
    }

    on_instance_stop(inst_id, stop_signal){
        inst_pool.set_status(inst_id, utils.HALT);
        _send_message(inst_id, "status_change", utils.HALT);

        // if restart = true
        const inst_daemon = inst_pool.get_daemon(inst_id),
              inst_proc = inst_pool.get_process(inst_id),
              inst_info = inst_pool.get_info(inst_id),
              inst_config = inst_pool.get_config(inst_id);
        
        if(inst_daemon.get_restart_flag()){
            console.log(`start inst (${inst_id})`);

            // reload config and start again
            inst_proc.load_config(inst_config);
            inst_proc.start_process();
        }

        inst_daemon.set_restart_flag(true);
        inst_daemon.set_normal_exit(false);
        inst_info.reset();
    }

    on_instance_unexpectedly_exit(inst_id){

    }

    on_player_login(inst_id, player_info){
        let inst_info = inst_pool.get_info(inst_id);
        _send_message(inst_id, "player_change", inst_info.get_current_player());
    }

    on_player_logout(inst_id, player_info){
        let inst_info = inst_pool.get_info(inst_id);
        _send_message(inst_id, "player_change", inst_info.get_current_player());
    }

    on_player_leave(inst_id, player){
        // TODO
    }

    on_player_change(inst_id, player_num){
        _send_message(inst_id, "player_change", player_num);
    }

    on_memory_change(inst_id, memory){
        _send_message(inst_id, "memory_change", memory);
    }

    _log_string_analyse(inst_id, log_str){
        const re_done_str = /Done \(([0-9.]+)s\)!/,
              re_done_str_torch = /Ready for connections! \(([0-9.]+)s\)/,
              re_login_str = /^\[\d\d:\d\d:\d\d INFO\]: (.*)\[(.*)\] logged in/,
              re_logout_str = /^\[\d\d:\d\d:\d\d INFO\]: (.*) left the game/,
              re_UUID_str = /UUID of player (.*) is (.*)/,
              re_online_user_str = /There are ([0-9]+)\/([0-9]+) players/;
        
        if(
            (
                re_done_str.test(log_str) === true || 
                re_done_str_torch.test(log_str) === true
            ) && 
            inst_pool.get_status(inst_id) == utils.STARTING){
            let m = re_done_str.exec(log_str) || re_done_str_torch.exec(log_str);

            let start_time = -1.0;
            if(m != null && m.length > 1){
                start_time = m[1];
            }
            if(utils.types.likeNumber(start_time) === true){
                start_time = parseFloat(start_time);
            }else{
                start_time = -1.0;
            }

            inst_pool.set_status(inst_id, utils.RUNNING);
            this.on_instance_running(inst_id, start_time);
        // player login
        }else if(re_login_str.test(log_str) === true && 
            inst_pool.get_status(inst_id) == utils.RUNNING){
            let m = re_login_str.exec(log_str);
            let player_name = m[1];
            let player_ip = m[2];
            let _info = inst_pool.get_info(inst_id);
            _info.incr_current_player();
            this.on_player_login(inst_id, [player_name, player_ip]);
        }else if(re_logout_str.test(log_str) === true &&
            inst_pool.get_status(inst_id) == utils.RUNNING){
            
            let m = re_logout_str.exec(log_str);
            let player_name = m[1];

            let _info = inst_pool.get_info(inst_id);
            _info.decr_current_player();
            this.on_player_logout(inst_id, [player_name]);
        }

        // bind UUID : TODO
    }
}

module.exports = MCProcessCallback;