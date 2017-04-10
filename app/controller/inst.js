const os = require("os");
const fs = require("fs");
const cp = require("child_process");
const mkdirp = require("mkdirp");

const Parser = require("../proc/parser");

const model = require("../model");
const utils = require("../../utils");
module.exports = {
    /*create an new instance and init (check) properites*/
    /* 
    request params:
    inst_name    = F.get("inst_name")
    core_file_id = F.get("core_file_id")
    java_bin_id  = F.get("java_bin_id")
    listening_port = F.get("listening_port")

    # unit: GiB
    max_RAM = F.get("max_RAM")
    max_user = F.get("max_user")

    # json format
    server_properties = F.get("server_properties")

    # logo url
    logo_url = F.get("logo_url")

    # set encoded motd content
    motd     = F.get("motd")

    # FTP account
    FTP_account_name = F.get("ftp_account")
    FTP_default_password = (F.get("ftp_default_password") == True)
    FTP_password  = F.get("ftp_password")

    */

    // In order to create a new instance, we have to create an individual space to
    // store files first.

    // return: res._inst_dir 
    _creat_inst_dir(req, res, next){
        /* auto generate dir*/
        ServerInstance = model.get("ServerInstance");
        const config = utils.get_config();
        const servers_dir = utils.resolve(config["global"]["data_dir"], "servers");

        let curr_id = 0;
        ServerInstance.count().then(
            (count) => {
                if(count == null){
                    curr_id = 0;
                }else{
                    curr_id = count + 1;
                }

                dir_name = `${req._username}-${utils.nickname(count)}`;
                // mkdir -p <data_dir>/servers/<username>-<nickname>
                mkdirp.sync(utils.resolve(servers_dir, dir_name));

                // and set return value... by chaining res object
                res._inst_dir = utils.resolve(servers_dir, dirname);
                next();
            },
            (err) => {
                console.error(err);
                res.error(500);
            }
        )
    },

    _creat_inst_name(req, res, next){
        ServerInstance = model.get("ServerInstance");
        // get input
        const inst_name = req.body.inst_name;

        if(inst_name == null || inst_name == ""){
            res.error(408, "inst name is undefined!");
        }else{
            ServerInstance.findOne({
                inst_name: inst_name,
                owner_id: req._uid
            }).then(
                (data) => {
                    if(data != null){
                        // that means there's identical inst name
                        // in user's insts, which is not allowed!
                        res.error(600, "there's already a same inst name!");
                    }else{
                        res._inst_name = inst_name;
                        next();
                    }
                },
                (err) => {
                    console.error(err);
                    res.error(500);
                }
            );
        }
    },

    _creat_listening_port(req, res, next){
        ServerInstance = model.get("ServerInstance");
        // get input
        let listening_port = req.body.listening_port;
        // type checking
        if(!utils.types.likeNumber(listening_port)){
            res.error(406, "listening_port not valid!");
        }else{
            listening_port = parseInt(listening_port);

            // check if the port number has been registered by other
            // instances.
            ServerInstance.findOne({
                listening_port: listening_port
            }).then(
                (data) => {
                    if(data != null){
                        res.error(600, "port number has been registered!");
                    }else{ 
                        // return values
                        res._listening_port = listening_port;
                        next();
                    }
                },
                (error) => {
                    console.error(error);
                    res.error(500);
                }
            );
        }
    },

    _creat_inst_properties(req, res, next){
        const inst_properties_str = req.body.server_properties;
        try{
            let inst_properties = JSON.parse(inst_properties_str);
            res._inst_properties = inst_properties;
            next();
        }catch(e){
            console.log(e);
            res.error(500, "parse inst_properties params error!");
        }
    },

    _creat_max_user(req, res, next){
        const max_user = req.body.max_user;

        if(!utils.types.likeNumber(max_user)){
            res.error(406, "Invalid max_user parameter!");
        }else{
            res._max_user = parseInt(max_user);
            next();
        }
    },

    _creat_alloc_RAM(req, res, next){
        const max_RAM = req.body.max_RAM;

        if(!utils.types.likeNumber(max_RAM)){
            res.error(406, "Invalid max_user parameter!");
        }else{
            res._max_RAM = parseInt(max_RAM);
            next();
        }
    },

    _creat_java_bin(req, res, next){
        const java_bin_id = req.body.java_bin_id;
        const JavaBinary = model.get("JavaBinary");
        // type checking
        if(!utils.types.likeNumber(java_bin_id)){
            res.error(406, "Invalid java_bin param!");
        }else{
            JavaBinary.findOne({
                id: parseInt(java_bin_id)
            }).then(
                (data)=>{
                    if(data != null){
                        res._java_bin_id = parseInt(java_bin_id);
                        next();
                    }else{
                        res.error(600, "No such java_bin_id!");
                    }
                },
                (error)=>{
                    console.error(error);
                    res.error(500);
                }
            )
        }
    },

    _creat_server_core(req, res, next){
        const server_core_id = req.body.core_file_id;
        const ServerCore = model.get("ServerCore");
        // type checking
        if(!utils.types.likeNumber(server_core_id)){
            res.error(406, "Invalid core_id param!");
        }else{
            ServerCore.findOne({
                core_id: parseInt(server_core_id)
            }).then(
                (data)=>{
                    if(data != null){
                        res._server_core_id = parseInt(server_core_id);
                        next();
                    }else{
                        res.error(600, "No such server_core_id!");
                    }
                },
                (error)=>{
                    console.error(error);
                    res.error(500);
                }
            )
        }
    },

    _move_logo(req, res, next){
        const icon_png = "server-icon.png";
        const config = utils.get_config();
        if(res._inst_dir == undefined || req.body.logo_url == undefined){
            //skip it
            next();
        }else{
            const logo_url = req.body.logo_url,
                  logo_file = utils.resolve(config["global"]["data_dir"], "uploads", logo_url),
                  new_logo = utils.resolve(res._inst_dir, icon_png);
                
            if(utils.exists(logo_file)){                
                fs.renameSync(logo_file, new_logo);
            }
            next();
        }
    },

    _creat_ftp_account(req, res, next){
        const User = model.get("User"),
              FTPAccount = model.get("FTPAccount");

        let FTP_default_password = req.body.ftp_default_password;
        let _ftp_hash, FTP_account, FTP_password;

        FTP_account = req.body.ftp_account;
        FTP_password = req.body.ftp_password;

        if(FTP_default_password == null){
            FTP_default_password = true;
        }

        User.findOne({
            id: req._uid
        }).then(
            (user)=>{
                if(FTP_default_password){
                    _ftp_hash = user.hash;
                }else{
                    _ftp_hash = utils.calc_hash(FTP_password);
                }
                // check if account has already exists
                FTPAccount.findOne({
                    username: FTP_account
                }).then(
                    (data)=>{
                        if(data != null){
                            // already exists
                            res.error(406, "FTP account already exists!");
                        }else{
                            // insert FTP account
                            // since we don't know the accurate inst id of 
                            // the being-created instance, we suppose 
                            // inst_id = 0 at first.
                            // After instnace is created, DON'T FORGET to 
                            // update inst_id with the newly fetched inst_id.
                            FTPAccount.create({
                                username: FTP_account,
                                inst_id : 0,
                                hash: _ftp_hash,
                                last_login: null,
                                owner_id : req._uid,
                                default_password: FTP_default_password
                            }).then(
                                (data)=>{
                                    // output
                                    res._ftp_account = FTP_account;
                                    next();
                                },
                                (err)=>{
                                    console.log(err);
                                    res.error(500);
                                }
                            );

                        }
                    }
                )
            },
            (err) =>{
                console.log(err);
                res.error(500);
            }
        );
        
    },

    create_instance(req, res, next){
        // Here, we believe the params have been all checked 
        // and all data is valid.
        // Thus, we will insert data into database directly.
        const ServerInstance = model.get("ServerInstance");
        const FTPAccount = model.get("FTPAccount");
        // check variables
        const vars = ["_server_core_id", "_java_bin_id", "_max_RAM", "_inst_name",
            "_max_user", "_listening_port", "_ftp_account", "_inst_dir", "_inst_properties"];

        for(let i=0;i<vars.length;i++){
            if(res[ vars[i] ] == null){
                res.error(406);
            }
        }

        const _write_server_properties = () => {
            let server_properties = utils.resolve(res._inst_dir, "server.properties");
            let parser = new Parser(server_properties);
            parser.conf_items = res._inst_properties;
            parser.conf_items["server-port"] = res._listening_port;
            parser.conf_items["max-players"] = res._max_user;
            // export data
            parser.dumps();
            console.log(parser.conf_items);
        };

        _write_server_properties();

        ServerInstance.create({
            owner_id: req._uid,
            inst_name : res._inst_name,
            core_file_id : res._server_core_id,
            java_bin_id : res._java_bin_id,
            listening_port: self._listening_port,
            max_RAM: res._max_RAM,
            max_user: res._max_user,
            inst_dir: res._inst_dir
        }).then(
            (inst) => {
                const new_inst_id = inst.inst_id;
                // ftp account
                FTPAccount.update({inst_id: new_inst_id}, {where: {username: res._ftp_account, inst_id: 0}}).then(
                    (data) => {
                        res.success(200);
                    },
                    (err) => {
                        console.error(err);
                        res.error(500);
                    }
                );
            },
            (err) => {
                console.error(err);
                res.error(500);
            }
        );
    },
    /*edit instance and its properites*/
    edit_instance(req, res, next){

    },

    delete_instance(req, res, next){

    },

    start_instance(req, res, next){

    },

    stop_instance(req, res, next){

    },

    terminate_instance(req, res, next){

    },

    restart_instance(req, res, next){

    }
}