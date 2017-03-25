/*
Process Instance Pool

A pool that stores all data
key -> <inst id>
value -> {
    "config" : MCWrapperConfig(**) | None,
    "status" : {SERVER_STATE.HALT | STARTING | RUNNING},
    "daemon" : MCDaemonManager(**),
    "info"   : MCInstanceInfo(**),
    "process"   : MCProcess(**)
}

*/
const TYPES = ["config", "status", "daemon", "info", "process"];
let instance_pool = {};

module.exports = {
    "add": (inst_id, config, status, daemon, info, process)=>{
        // check if instance is legal
        if(
            config instanceof require("./config") &&
            /* status */
            daemon instanceof require("./daemon") &&
            info instanceof require("./info") &&
            process instanceof require("./process")
        ){
            // add data
            let obj = {
                config: config,
                status: status,
                daemon: daemon,
                info: info,
                process: process
            };
            instance_pool[inst_id] = obj;
        }else{
            return new Error("instance check failed!");
        }
    },
    "get": (inst_id)=>{
        if(instance_pool[inst_id] != undefined){
            return instance_pool[inst_id];
        }else{
            return null;
        }
    },
    // get sub-items
    get_info: (inst_id)=>{
        return this._get(inst_id, "info");
    },
    get_status: (inst_id)=>{
        return this._get(inst_id, "status");
    },
    get_config: (inst_id)=>{
        return this._get(inst_id, "config");
    },
    get_daemon: (inst_id)=>{
        return this._get(inst_id, "daemon");
    },
    get_process: (inst_id)=>{
        return this._get(inst_id, "process");
    },
    // set sub-items
    set_info: (inst_id, info)=>{
        this._set(inst_id, "info", info);
    },
    set_process: (inst_id, process)=>{
        this._set(inst_id, "process", process);
    },
    set_daemon: (inst_id, daemon)=>{
        this._set(inst_id, "daemon", daemon);
    },
    set_status: (inst_id, status)=>{
        this._set(inst_id, "status", status);
    },
    set_config: (inst_id, config)=>{
        this._set(inst_id, "config", config);
    },
    // private method
    "_get": (inst_id, type)=>{
        // check type available
        if(TYPES.indexOf(type) > -1){
            return instance_pool[inst_id][type];
        }else{
            return null;
        }
    },
    "_set": (inst_id, type, new_val)=>{
        if(TYPES.indexOf(type) > -1){
            instance_pool[inst_id][type] = new_val;
        }else{
            return null;
        }
    }
};