const inst_pool = require("./inst_pool");

class MCProcessCallback {
    constructor(){

    }

    on_log_update(inst_id, pipe, log){

    }

    on_instance_start(inst_id){

    }

    on_instance_running(inst_id, start_time){

    }

    on_instance_stop(inst_id, stop_signal){
        
    }

    on_instance_unexpectedly_exit(inst_id){

    }

    on_player_login(inst_id, player_info){

    }

    on_player_logout(inst_id, player_info){

    }

    on_player_leave(inst_id, player){

    }

    on_player_change(inst_id, player_num){

    }

    on_memory_change(inst_id, memory){

    }

    _log_string_analyse(inst_id, log_str){

    }
}

module.exports = MCProcessCallback;