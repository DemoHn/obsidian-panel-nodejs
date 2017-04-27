'use strict';
// node packages
const fs = require("fs");
const path = require("path");
const cp = require("child_process");
// npm
const mkdirp = require("mkdirp");
// internal modules
const utils = require("../../utils");
const Parser = require("./parser");
const ProcessCallback = require("./process_callback");
const inst_pool = require("./inst_pool");

const STDIN = 0, STDOUT = 1, STDERR = 2;
class MCProcess extends ProcessCallback {
    constructor(inst_id, proc_config){
        super();
        this.inst_id = inst_id;
        this.proc_config = proc_config;

        this._pid = null;
        this._process = null;
        this._timeout_timer_fd = 0;

        this._stdin = null;
        this._stdout = null;
        this._stderr = null;
    }

    /* write config files*/
    _init_env(proc_cwd, port, max_player){
        // make proc dir
        mkdirp.sync(proc_cwd);
        // overwrite eula.txt
        const EULA_txt_file = path.resolve(proc_cwd, "eula.txt");
        // write eula=true to EULA txt file
        utils.write(EULA_txt_file, "eula=true");

        //  server.properties
        const s_p_file = path.resolve(proc_cwd, "server.properties")

        // touch server.properties file
        if(!utils.exists(s_p_file))
            utils.write(s_p_file, "");

        let parser = new Parser(s_p_file);
        parser.replace("server-port", port);
        parser.replace("max-players", max_player);

        // export config to server.properties
        parser.dumps();
    }

    load_config(mc_w_config){
        this.proc_config = mc_w_config;
    }
    /* start / stop process */
    start_process(){
        const min_RAM_in_MB = parseInt(this.proc_config.min_RAM * 1024),
              max_RAM_in_MB = parseInt(this.proc_config.max_RAM * 1024);
              
        const cmd_args = [`-Xms${min_RAM_in_MB}M`,
                    `-Xmx${max_RAM_in_MB}M`,
                    "-jar",
                    this.proc_config.jar_file,
                    "nogui"];

        this._init_env(this.proc_config.proc_cwd, 
            this.proc_config.port, 
            this.proc_config.max_player);

        console.log("cmd args: %s", cmd_args);

        const proc_spawn_options = {
            cwd : this.proc_config.proc_cwd,
            env : process.env
        };

        this._process = cp.spawn(this.proc_config.java_bin, cmd_args, proc_spawn_options);
        // set pid
        this._pid = this._process.pid;
        // bind pipes with events
        this._stdin = this._process.stdin;
        this._stdout = this._process.stdout;
        this._stderr = this._process.stderr;

        this._stdout.on('data',(chuck)=>{
            this.on_log_update(this.inst_id, STDOUT, chuck);
        });

        this._stderr.on('data',(chuck)=>{
            this.on_log_update(this.inst_id, STDERR, chuck);
        });
        // on exit
        this._process.on('close', this._on_exit(this));
        console.info("Start Process pid=(%s)" % this._pid);

        // run callback
        this.on_instance_start(this.inst_id);
        return true;
    }
    // stop process by sending 'stop' command
    stop_process(){
        if(this._pid != null){
            console.info(`kill process pid=(${this._pid})`);
            this.send_command("stop");
        }else{
            console.error("kill process fails!");
        }
    }

    terminate_process(){
        if(this._pid != null){
            // kill -9 <pid>
            let _daemon = inst_pool.get_daemon(this.inst_id);
            _daemon.set_normal_exit(true);

            this._process.kill("SIGKILL");
        }
    }

    send_command(command){
        const _daemon = inst_pool.get_daemon(this.inst_id);
        let _command = command + "\n";
        console.log(`write command: ${command}`);

        this._stdin.write(_command);
    }

    _on_terminate(){

    }

    _on_exit(self){
        return (code) => {
            console.log(`exit code: ${code}`);
            self._pid = null;

            let inst_daemon = inst_pool.get_daemon(self.inst_id);
            inst_daemon.add_crash_count();

            this.on_instance_stop(self.inst_id, null);
        }
    }

    get_pid(){
        return this._pid;
    }
}

module.exports = MCProcess;