const utils = require("../../utils");
const mysql = require("mysql");

const create_database = (config, callback) => {
    if(config["db"]["type"] === "mysql"){
        let conn = mysql.createConnection({
            host : config["db"]["mysql_host"],
            user : config["db"]["mysql_user"],
            password : config["db"]["mysql_password"],
            database : null,
        });
        
        conn.query(`CREATE DATABASE IF NOT EXISTS ${config["db"]["name"]}`, (err, res)=>{
            if(err){
                console.log(err);
                callback(err);
            }else{
                callback(true);
            }
        })
    }else{
        callback(true);
    }
};
module.exports = {
    set_port_config: (req, res, next) => {
        let config = utils.get_config();

        if(req.body.app_port != null){ // or undefined
            config["server"]["listen_port"] = parseInt(req.body.app_port);
        }

        if(req.body.ftp_port != null){
            config["ftp"]["listen_port"] = parseInt(req.body.ftp_port);
        }
        
        // modify app_port & ftp_port config
        utils.dump_config(config);
        next();
    },

    set_db_config: (req, res, next) => {
        let config = utils.get_config();

        const body = req.body;
        const req_data = {
            type: body.db_env,
            mysql_username: body.mysql_username,
            mysql_password: body.mysql_password
        };

        if(req_data.type != null){ // or undefined
            config["db"]["type"] = req_data.type;
        }

        if(req_data.mysql_username != null){
            config["db"]["mysql_user"] = req_data.mysql_username;
        }

        if(req_data.mysql_password != null){
            config["db"]["mysql_password"] = req_data.mysql_password;
        }

        utils.dump_config(config);
        next();
    },
    
    test_mysql_db: (req, res) => {
        let config = utils.get_config();

        const body = req.body;
        const req_data = {
            type: body.db_env,
            mysql_username: body.mysql_username,
            mysql_password: body.mysql_password
        };

        let conn = mysql.createConnection({
            host: config["db"]["mysql_host"],
            user: req_data.mysql_username,
            password: req_data.mysql_password,
            port: config["db"]["mysql_port"],
            database: null
        });

        conn.connect((err)=>{
            conn.destroy();
            if(err != null){
                res.send(utils.rtn.success(false));
            }else{
                res.send(utils.rtn.success(true));
            }
        });
    },

    init_main_db: (req, res, next) => {
        let config = utils.get_config();
        create_database(config, (result)=>{
            if(result != null){
                const model = require("../model");
                // init db model
                const _seq = model.__init_model();
                if(_seq === null){
                    res.send(utils.rtn.error(500));
                }else{
                    // sync db
                    _seq.sync({force: true}).then(
                        // success
                        ()=>{
                            next();
                        },
                        // error
                        (err)=>{
                            console.error(err);
                            res.send(utils.rtn.error(500));
                        }
                    )
                }
            }else{
                res.send(utils.rtn.error(500));
            }
        })
    },

    init_super_admin: (req, res) => {
        const User = require("../model").User;
        const body = req.body;
        const req_data = {
            username: body.username,
            email: body.email,
            password: body.password
        };

        // calculate hash
        /*
        const _hash = crypto.createHash("md5");
        _hash.update(
            Buffer.concat([Buffer.from(req_data.password), utils.salt])
        );

        const hash = _hash.digest("hex");*/
        const hash = utils.calc_hash(req_data.password);
        // insert data
        User.create({
            username: req_data.username,
            hash: hash,
            email: req_data.email,
            privilege: utils.ROOT_USER
        }).then(
            // success
            (data)=>{
                // everything is done.
                utils.set_startup_lock(false);
                res.send(utils.rtn.success(200));
            },
            (err)=>{
                console.error(err);
                res.send(utils.rtn.error(500));
            }
        )
    }
}