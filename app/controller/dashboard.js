const fs = require("fs-extra");
const request = require("request");

const utils = require("../../utils");
const model = require("../model");
const Parser = require("../proc/parser");

module.exports = {
    get_my_ip(req, res, next){
        const _url = "http://whatismyip.akamai.com/";
        // get external IP
        request(_url, (err, resp, body) => {
            res.success(body);
        });
    },

    server_logo_source(req, res, next){
        const ServerInstance = model.get("ServerInstance");
        ServerInstance.findOne({
            where: {
                // req._inst_id is set when calling `check_inst_id` middleware
                inst_id : req._inst_id
            }
        }).then((inst) => {
            const inst_dir = inst.inst_dir;
            const logo_file_name = utils.resolve(inst_dir, "server-icon.png");

            if(utils.exists(logo_file_name)){
                res.sendFile(logo_file_name);
            }else{
                res.status(404).end();
            }
        },(err) => {
            console.log(err);
            res.error(500);
        });
    },

    // don't forget check_inst_id before calling this function!
    get_miscellaneous_info(req, res, next){
        const ServerInstance = model.get("ServerInstance"),
              ServerCore = model.get("ServerCore"),
              FTPAccount = model.get("FTPAccount");
        
        let properties_params = {
            "motd": null,
            "image_source": null,
            "mc_version": null,
            "listen_port": null,
            "ftp_account_name": null,
            "default_ftp_password": null,
            "server_properties": null
        };

        ServerCore.hasMany(ServerInstance, {foreignKey: "core_file_id"});
        ServerInstance.belongsTo(ServerCore, {foreignKey: "core_file_id"});

        ServerInstance.findOne({
            include : [ ServerCore ],
            where: {
                inst_id: req._inst_id
            }
        }).then((data) => {
            // get necessary column info from db
            const inst_dir = data.inst_dir,
                  mc_version = data.ServerCore.minecraft_version,
                  listening_port = data.listening_port;
            
            FTPAccount.findOne({
                where: {
                    inst_id : req._inst_id
                }
            }).then((data) => {
                const ftp_account_name = data.username,
                      default_ftp_password = data.default_password;

                // process data and output
                // 1. get server.properties & motd
                let file_server_properties = utils.resolve(inst_dir, "server.properties");

                if(utils.exists(file_server_properties)){
                    let parser = new Parser(file_server_properties);
                    let conf_items = parser.loads();
                    properties_params.server_properties = conf_items;
                    properties_params.motd = conf_items["motd"];
                }

                // 2. image source
                let image_source = "";
                let logo_file = utils.resolve(inst_dir, "server-icon.png");
                if(utils.exists(logo_file)){
                    image_source = `/server_inst/dashboard/logo_src/${req._inst_id}`;
                }

                properties_params.image_source = image_source;
                
                // 3 & 4. mc version & listen_port
                properties_params.mc_version = mc_version;
                properties_params.listen_port = listening_port;

                // 5 & 6. ftp
                properties_params.ftp_account_name = ftp_account_name;
                properties_params.default_ftp_password = default_ftp_password;

                res.success(properties_params);
            }, (err) => {
                console.log(err);
                res.error(500);
            });
        },(err) => {
            console.log(err);
            res.error(500);
        })
    },

    get_inst_list(req, res, next){
        const ServerInstance = model.get("ServerInstance");

        let user_list = {
            "current_id" : null,
            "list" : []
        }
        ServerInstance.findAll({
            where: {
                // req._inst_id is set when calling `check_inst_id` middleware
                owner_id: req._uid
            }
        }).then((insts) => {
            if(insts.length > 0){
                user_list["current_id"] = insts[0].inst_id;
            }

            let star_flag = false;
            for(let _i=0;_i<insts.length;_i++){
                let inst = insts[_i];
                let _model = {
                    "inst_name": inst.inst_name,
                    "star": inst.star,
                    "inst_id": inst.inst_id
                }

                user_list["list"].push(_model);

                if(inst.star == true && star_flag == false){
                    user_list["current_id"] = inst.inst_id;
                    star_flag = true;
                }
            }

            res.success(user_list);
        },(err) => {
            console.log(err);
            res.error(500);
        });
    },

    get_instance_status(req, res, next){

    },

    get_instance_log(req, res, next){

    }
};