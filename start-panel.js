// nodejs packages
const os = require("os");
const fs = require("fs");
const mkdirp = require("mkdirp");
const app = require("./app").app;
const server = require("./app").server;
const utils = require("./utils");

// check if config.yml exists
const config_yml = utils.resolve(__dirname, "config.yml");
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

// update config
if(!utils.exists(config_yml)){
    utils.write(config_yml, utils.read(config_yml_sample));
}else{
    let obj_conf = utils.get_config();
    let obj_conf_sample = utils.get_config(config_yml_sample);
}

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
// then mkdir all subdir in data_dir
const sub_dirs = ['env', 'files', 'servers', 'sql', 'uploads', 'backups'];
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
        database: config["db"]["name"]
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

let server_port = config["server"]["listen_port"];
// start (listen) the process
console.log("[INFO] Start panel!");
console.log(`[INFO] Server listen on ${server_port}`);
server.listen(server_port);