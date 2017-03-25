const MAX_CRASH = 5;
class MCDaemonManager{
    constructor(){
        this._crash_count = 0;
        this._restart_flag = true;
        this._normal_exit  = false;
    }

    add_crash_count(){
        if(!this._normal_exit)
            this._crash_count += 1;
        if(this._crash_count > MAX_CRASH)
            this._restart_flag = false;
    }

    reset_crash_count(){
        this._crash_count = 0;
        this._restart_flag = true;
    }
    set_normal_exit(val){
        /*
        if normal_exit flag is True, that means
        the process just closed normally without restart.
        */
        this._normal_exit = val;
        if(val === true){
            this._restart_flag = False;
        }
    }
    set_restart_flag(val){
        this._restart_flag = val;
    }

    get_normal_exit(){
        return this._normal_exit;
    }
    get_restart_flag(){
        return this._restart_flag;
    }
}

module.exports = MCDaemonManager;