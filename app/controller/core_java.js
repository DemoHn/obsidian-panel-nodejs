const os = require("os");
const fs = require("fs");
const utils = require("../../utils");
const model = require("../model");

const _query_core_file_id = (res, core_file_id) => {
    const ServerCore = model.get("ServerCore");
    return new Promise((resolve, reject) => {
        ServerCore.findOne({where: {core_id : core_file_id}}).then( 
            (data)=>{
                if(data == null)
                    res.error(411)
                else
                    resolve(data);
            },
            (err)=>{
                reject(res, 500);
            }
        );  
    });
};

const _reject_end = (res, err_code) => {
    res.error(err_code);
};

module.exports = {
    // server_core
    get_all_cores: (req, res) => {
        const ServerCore = model.get("ServerCore");
        const _filesize_format = (size) => {
            if(size > 1e9){
                return `${(size/1e9).toFixed(1)} G`;
            }else if(size > 1e6){
                return `${(size/1e6).toFixed(1)} M`;
            }else if(size > 1e3){
                return `${(size/1e3).toFixed(1)} K`;
            }else{
                return `${(size).toFixed(1)} B`;
            }
        }

        let _model_arr = [];
        // get all cores
        ServerCore.findAll().then(
            (data)=>{
                if(data == null){
                    res.success(_model_arr);
                    return ;
                }
                for(let i=0;i<data.length;i++){
                    let item = data[i];
                    let _model = {
                        "core_id" : item.core_id,
                        "file_name" : item.file_name,
                        "core_type" : item.core_type,
                        "core_version" : item.core_version,
                        "minecraft_version" : item.minecraft_version,
                        "file_size" : _filesize_format(item.file_size),
                        "note" : item.note
                    };
                    _model_arr.push(_model);
                }
                res.success(_model_arr);
            },
            (error)=>{
                console.error(error);
                res.error(500);
            }
        );
    },
    // @params
    // core_file_id
    edit_core_params: (req, res) => {
        const ServerCore = model.get("ServerCore");

        const mc_version = req.body.mc_version;
        const file_version = req.body.file_version;
        const description = req.body.description;
        const core_type = req.body.core_type;
        const file_name = req.body.file_name;
        
        // as param
        let core_file_id;
        try {
            core_file_id = parseInt(req.params.core_file_id); 
        } catch (error) {
            console.error(error);
            res.error(407);
        }

        // first find if inst id exists
        _query_core_file_id(res, core_file_id)
            .then((data)=> {
                let update_dict = {};
                update_dict["note"] = description;
                update_dict["core_version"] = file_version;
                update_dict["core_type"] = core_type;
                update_dict["minecraft_version"] = mc_version;
                // rename file
                if(file_name != null){
                    let ori_filename = data.file_name;
                    let upload_dir = data.file_dir;

                    update_dict["file_name"] = file_name;
                    fs.renameSync(
                        utils.resolve(upload_dir, ori_filename),
                        utils.resolve(upload_dir, file_name)
                    );
                }
                // update core_file content
                ServerCore.update(update_dict, {where: {core_id: core_file_id}}).then(
                    ()=>{
                        res.success(200);
                    },(err)=>{
                        console.error(err);
                        res.error(500);
                    }
                )
            },/*error*/_reject_end);
    },

    delete_core_file: (req, res) => {
        const ServerCore = model.get("ServerCore");
        // core_file_id as param
        let core_file_id;
        try {
            core_file_id = parseInt(req.params.core_file_id); 
        } catch (error) {
            console.error(error);
            res.error(407);
        }

        _query_core_file_id(res, core_file_id).then((data)=>{
            // TODO delete file
            ServerCore.destroy({where:{core_id : core_file_id}}).then( ()=>{
                res.success(200);
            },(err)=>{
                console.error(err);
                res.error(500);
            });
        }, _reject_end);
    },

    save_core_file_data: (req, res) => {
        // after upload file by multer middleware,
        // the next task is to save file info info database

        const file_size = req.file.size;
        const uid = req._uid;
        const data_dir = utils.get_config()["global"]["data_dir"];
        const upload_dir = utils.resolve(data_dir, "cores");
        
        const ServerCore = model.get("ServerCore");

        // rename file (prevent name confliction)
        const _files = fs.readdirSync(upload_dir);
        let _filename = req.file.originalname;
        let _ori_filename = _filename;
        let __counter = 0;

        while(true){
            if(_files.indexOf(_filename) >= 0){
                __counter += 1;
                _filename = `x${__counter}-${_ori_filename}`;
            }else{
                break;
            }
        }

        fs.renameSync(
            req.file.path,
            utils.resolve(upload_dir, _filename)
        );

        ServerCore.create({
                file_name   : _filename,
                file_size   : file_size,
                file_dir    : upload_dir,
                create_time : new Date(),
                file_hash   : "",
                core_type   : req.body.core_type,
                core_version : req.body.file_version,
                minecraft_version : req.body.mc_version,
                file_uploader : uid,
                note : req.body.description
        }).then(()=>{
            res.success(200);
        },(err)=>{
            console.error(err);
            res.error(500);
        });

    },
    // java_binary
};