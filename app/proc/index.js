const os = require('os'),
      pusage = require("pidusage"),
      model = require("../model"),
      utils = require("../../utils");

// classes
const MCWrapperConfig = require("./config"),
      MCProcess = require("./process"),
      MCInstanceInfo = require("./info"),
      MCDaemonManager = require("./daemon");

// instance pool
const inst_pool = require("./inst_pool");

const _update_pool_data = (inst_id, db_item) => {
    // add int_pkg support
    let _jar_file = null;

    if(db_item.use_integrated_package === true){        
        _jar_file = utils.resolve(db_item.inst_dir, db_item.IntegratedPackage.exec_jar);
    }else{
        _jar_file = utils.resolve(db_item.ServerCore.file_dir, db_item.ServerCore.file_name);
    }
    let mc_w_config = {
        "jar_file": _jar_file,
        "java_bin": db_item.JavaBinary.bin_directory,
        // NOTICE: here, the unit max_RAM and min_RAM is MB!
        "max_RAM": parseFloat(db_item.max_RAM),        
        "min_RAM": parseFloat(db_item.max_RAM * 0.5),
        "max_player": Math.floor(db_item.max_user),
        "proc_cwd": db_item.inst_dir,
        "port": db_item.listening_port
    };

    let info = {
        "owner": db_item.owner_id,
        "inst_id": inst_id
    };

    inst_pool.add(
        inst_id,
        new MCWrapperConfig(mc_w_config),
        utils.HALT,
        new MCDaemonManager(),
        new MCInstanceInfo(info["owner"], info["inst_id"]),
        new MCProcess(inst_id, mc_w_config)
    );
};

// send message
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

module.exports = {
    // @method init_proc_pool
    // This funcion will (re)load all instances' information from database
    init_proc_pool(){
        const ServerInstance = model.get("ServerInstance"),
              JavaBinary = model.get("JavaBinary"),
              IntegratedPackage = model.get("IntegratedPackage"),
              ServerCore = model.get("ServerCore");

        ServerInstance.belongsTo(JavaBinary, {foreignKey: "java_bin_id", targetKey: "id"});
        ServerInstance.belongsTo(ServerCore, {foreignKey: "core_file_id", targetKey: "core_id"});
        ServerInstance.belongsTo(IntegratedPackage, {foreignKey: "int_pkg_id", targetKey: "pkg_id"});

        // first clear data
        inst_pool.clear();

        return new Promise((resolve, reject)=>{
            ServerInstance.findAll({
                include: [ JavaBinary, ServerCore, IntegratedPackage ]
            }).then((data) => {
                for(let _i=0;_i<data.length;_i++){
                    let db_item = data[_i];
                    _update_pool_data(db_item.inst_id, db_item);
                }

                this._start_counter();
                resolve();
            },(err)=>{
                console.log(err);
                reject(err);
            });
        });
    },

    get_instance_status(inst_id){
        let rtn_data = {
            inst_id: inst_id,
            val: null
        };

        const inst_info = inst_pool.get_info(inst_id),
              inst_conf = inst_pool.get_config(inst_id);

        let _curr_player = -1;
        let _RAM = -1;

        if(inst_info.get_current_player() != null){
            _curr_player = inst_info.get_current_player();
        }

        if(inst_info.get_RAM() != null){
            _RAM = inst_info.get_RAM();
        }

        let _model = {
            current_player: _curr_player,
            total_player: inst_conf.max_player,
            RAM: _RAM,
            total_RAM: inst_conf.max_RAM,
            status: inst_pool.get_status(inst_id)
        };

        rtn_data["val"] = _model;
        return rtn_data;
    },

    get_instance_log(inst_id){
        const inst_info = inst_pool.get_info(inst_id),
              inst_conf = inst_pool.get_config(inst_id);

        let rtn_data = {
            "inst_id" : inst_id,
            "val": {
                "log": null
            }
        }

        rtn_data["val"]["log"] = inst_info.get_log()
        return rtn_data
    },

    start_instance(inst_id){
        let inst_obj = inst_pool.get(inst_id)

        if(inst_obj == null){
            return null;
        }
        
        let _proc    = inst_obj["process"],
            _status  = inst_obj["status"],
            _daemon  = inst_obj["daemon"],
            mc_w_config  = inst_obj["config"];

        // reload config
        _proc.load_config(mc_w_config);

        // make sure status is HALT, or just skip it because
        // Another running instance may already running.
        if(_status != utils.HALT){
            return null;
        }            

        // start process
        _proc.start_process()
        // reset crash count
        _daemon.reset_crash_count()
    },

    stop_instance(inst_id, _restart=null){
        let inst_obj = inst_pool.get(inst_id);

        if(inst_obj == null){
            return null;
        }
            
        let _proc    = inst_obj["process"],
            _status  = inst_obj["status"],
            _daemon  = inst_obj["daemon"];

        // the stop callback shall do the work of marking the new status (HALT)
        // and deduct active count. Don't do them HERE!
        if(_restart == null)
            _daemon.set_normal_exit(true);
        _proc.stop_process();
    },

    terminate_instance(inst_id){
        let inst_obj = inst_pool.get(inst_id);

        if(inst_obj == null){
            return null;
        }
            
        let _proc    = inst_obj["process"],
            _status  = inst_obj["status"],
            _daemon  = inst_obj["daemon"];

        // the stop callback shall do the work of marking the new status (HALT)
        // and deduct active count. Don't do them HERE!
        _daemon.set_normal_exit(true);
        _proc.terminate_process();
    },

    restart_instance(inst_id){
        let inst_info = inst_pool.get_info(inst_id);
        let inst_daemon = inst_pool.get_daemon(inst_id);

        inst_daemon.set_normal_exit(true);
        // restart flag
        inst_daemon.set_restart_flag(true);
        // inst_id, restart = true
        this.stop_instance(inst_id, true);
    },

    send_command(inst_id, command){
        let inst_obj = inst_pool.get(inst_id)

        if(inst_obj == null){
            return null;
        }
            
        let _proc    = inst_obj["process"],
            _status  = inst_obj["status"],
            _daemon  = inst_obj["daemon"],
            _info    = inst_obj["info"];

        // limit max command length to send
        if(_status == utils.RUNNING && command.length < 1000){
            _proc.send_command(command);
            // record the input into log object
            let _cmd_log = "⟹ %s\n" % command;
            // 0 for stdin
            _info.append_log(0,_cmd_log);

            // if input 'stop', just stop it, do not restart the server.
            // Because this command is surely propmted by user.
            
            if(command === "stop"){
                _daemon.set_normal_exit(true);
            }
        }
    },

    _start_counter(){
        // TODO
        const counter_flag = setInterval(
            () => {
                const _all_inst = inst_pool.get_all();
                // execute the following functions per 5 secs.

                for(let inst_id in _all_inst){
                    let inst = _all_inst[inst_id];
                    if(inst.status === utils.RUNNING){
                        let pid = inst.process.get_pid();

                        if(pid == null){
                            continue;
                        }else{
                            pusage.stat(pid, (err, stat) => {
                                // stat = {"cpu": <cpu>, "memory":<mem> (bytes)}
                                let mem = stat.memory / (1024*1024*1024); // unit: GB
                                inst.info.set_RAM(mem);
                                _send_message(inst_id, "memory_change", mem);
                            });
                            pusage.unmonitor(pid);
                        }
                    }
                }
            }, 5000);
    }
}