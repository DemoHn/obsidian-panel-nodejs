// nodejs packages
const os = require("os");
const fs = require("fs");
const mkdirp = require("mkdirp");

const app = require("./app").app;
const server = require("./app").server;
const utils = require("./utils");
const model = require("./app/model");

// check if config.yml exists

// According to enclose's manual, if we setup the path like __dirname+"config.yml",
// enclose will regard the config file as internal asset and include into the bundle by default.
// Since we want to read config.yml from external filesystem, we use `process.cwd()` to read
// config.yml dynamically.
const config_yml = utils.resolve(process.cwd(), "config.yml");
const config_yml_sample = utils.resolve(__dirname, "config.yml.sample");

const merge_dict = (dict_conf, dict_sample)=>{
    for(let item in dict_sample){
        if(utils.types.isPlainObject(dict_sample[item])){
            // if item is object, check and merge_dict
            if(dict_conf[item] !== null){
                merge_dict(dict_conf[item], dict_sample[item]);
            }
        }else{
            if(dict_conf[item] !== undefined){
                dict_sample[item] = dict_conf[item];
            }
        }
    }
    return dict_sample;
};

const update_config = () => {
    // update config
    if(!utils.exists(config_yml)){
        utils.write(config_yml, utils.read(config_yml_sample));
    }

    return 1;
}

const check_config = () => {
    let is_root = false;
    // if this process is running under root privilege
    // if so, listen to port <1024 is allowed
    if(process.getuid && process.getuid() == 0){
        is_root = true;
    }

    // access data dir & log file
    let log_file, data_dir, config;
    try{
        config = utils.get_config();
        log_file = config['global']['log_file'];
        data_dir = config['global']['data_dir'];

        mkdirp.sync(data_dir);
        // == touch ${log_file}
        utils.write(log_file, "");
    }catch(err){
        console.log(
    `[ERR-ACCESS] Access ${log_file} or ${data_dir} failed! Maybe directory not exists?
    Maybe you can try running this process under root privilege?`);
        return -1;
    }
    // then mkdir all subdirs inside $data_dir
    const sub_dirs = ['backups', 'cores', 'downloads', 'exes', 'files', 'servers', 'sql', 'uploads'];
    for(let sub_dir in sub_dirs){
        mkdirp.sync(utils.resolve(data_dir, sub_dirs[sub_dir]));
    }
    // if db.type = mysql,
    // try database connection
    if(config["db"]["type"] === "mysql"){
        let mysql = require("mysql");
        let conn  = mysql.createConnection({
            host: config["db"]["mysql_host"],
            user: config["db"]["mysql_user"],
            password: config["db"]["mysql_password"],
            port: config["db"]["mysql_port"],
            database: null
        });

        conn.connect((err)=>{
            conn.destroy();
            if(err != null){
                console.error(`[ERR-SQLERR] Connection Database Error! Code: ${err.code}`)
                return -2;
            }
        });
    }
    // on UNIX like system, non-root users are allowed to start a process
    // that binds the port under 1024
    // thus, 
    if(os.platform() === "linux" && !is_root){
        if(config["server"]["listen_port"] < 1024 &&
        config["ftp"]["listen_port"] < 1024){
            console.log("[ERR-BINDERR] For non-root users, it's not allowed to bind port under 1024! You have to rerun the process under root privilege!");
            return -3;
        }
    }

    return 1;
}

const launch_process = () => {
    let config = utils.get_config();
    // start process
    let server_port = config["server"]["listen_port"];
    // start (listen) the process
    console.log("[INFO] Start panel!");
    console.log(`[INFO] Server listen on ${server_port}`);
    server.listen(server_port);
}

const sync_model = () => {
    // sync database
    model.__sequelize.sync().then(
        // if success
        ()=>{
            launch_process();    
        },
        // if error
        (err)=>{
            console.log("[ERR-SQLERR] Sync Database Data Error!");
            console.log(err);
        }
    );
}

let rc = update_config() && check_config();

if(rc === 1){
    if(utils.get_startup_lock() === true){
        // launch directly, without sync db model
        launch_process();
    }else{
        sync_model();
    }
}