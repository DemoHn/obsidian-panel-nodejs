const os = require("os");
const fs = require("fs");
const cp = require("child_process");

const utils = require("../../utils");
const model = require("../model");

const _utils = {
    WAIT : 1,
    DOWNLOADING : 2,
    EXTRACTING : 3,
    FINISH : 4,
    FAIL : 5,
    EXTRACT_FAIL : 6
};

class JavaBinaryPool {
    constructor(){
        this.tasks = {};
    }

    add(hash, dw_link){
        let _model = {
            "link": dw_link,
            "status": _utils.DOWNLOADING,
            "progress": 0
        };
        this.tasks[hash] = _model;
    }

    delete(hash){
        if(this.tasks[hash] != undefined){
            delete this.tasks[hash];
        }
    }

    update(hash, status = null, progress = null){
        if(this.tasks[hash] != null){
            let _model = this.tasks[hash];
            if(status != null){
                _model["status"] = status;
            }

            if(progress != null){
                _model["progress"] = progress;
            }
        }
    }

    get(hash){
        if(this.tasks[hash] != null){
            return this.tasks[hash];
        }else{
            return null;
        }
    }
        
    get_all(){
        let cpy_tasks = {};
        for(let item in this.tasks){
            cpy_tasks[item] = {
                "link": self.tasks[item]["link"],
                "status": self.tasks[item]["status"],
                "progress": self.tasks[item]["progress"],
            }
        }

        return cpy_tasks;
    }

    has_working_link(link){
        for(let item in this.tasks){
            if(this.tasks[item]['link'] == link && this.tasks[item]['status'] in (_utils.DOWNLOADING, _utils.EXTRACTING)){
                return true
            }
        }
        return false
    }
} 

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

// java download list
const java_download_list = () => {
    const base_link = [
        /*major,minor,link*/
        [8,112,"http://download.oracle.com/otn-pub/java/jdk/8u112-b15/e9e7ea248e2c4826b92b3f075a80e441/jre-8u112"],
        [8,102,"http://download.oracle.com/otn-pub/java/jdk/8u102-b14/e9e7ea248e2c4826b92b3f075a80e441/jre-8u102"],
        [8,101,"http://download.oracle.com/otn-pub/java/jdk/8u101-b13/e9e7ea248e2c4826b92b3f075a80e441/jre-8u101"],
        [7,80,"http://download.oracle.com/otn-pub/java/jdk/7u80-b15/e9e7ea248e2c4826b92b3f075a80e441/jre-7u80"],
    ];

    let _model_arr = [];
    for(let i in base_link){
        let item = base_link[i];
        let filename = "";
        if(os.platform() === "linux"){
            if(os.arch() === "x64"){
                filename = "-linux-x64.tar.gz";
            }else{
                filename = "-linux-i586.tar.gz";
            }
        }else if(/^win/.test(os.platform(0))){
            if(os.arch() === "x64"){
                filename = "-windows-x64.exe";
            }else{
                filename = "-windows-i586.exe";
            }
        }
        let _model = {
            "major" : item[0],
            "minor" : item[1],
            "link"  : item[2] + filename
        }
        _model_arr.push(_model);
    }

    return _model_arr;
};

// global variable
const java_binary_pool = new JavaBinaryPool();

// when a donwloading task start, those events will be triggered.
const download_events = {
    _get_progress : ()=>{},
    _extract_start: ()=>{},
    _extract_finish: ()=>{},
    _download_finish: ()=>{},
    _download_start: ()=>{}
};

module.exports = {
    _java_binary_pool: java_binary_pool,
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

    // get java donwload list
    // no params
    get_java_download_list : (req, res, next) => {
        res.success(java_download_list());
    },

    // add java version info database manually
    // method: POST
    // params:
    // 1. major 
    // 2. minor
    // 3. executable dir (or just 'java' if JAVA_ENV is set properly)
    add_java_version : (req, res, next) => {
        const JavaBinary = model.get("JavaBinary");
        JavaBinary.create({
            major_verison: req.body.major,
            minor_version: req.body.minor,
            bin_directory: req.body.exec_dir
        }).then( (data)=>{
            // success
            res.success(200);
        }, (err)=>{
            // fail
            console.error(err);
            res.error(500);
        });
    },
    
    // @param: query -> index
    start_download_java: (req, res, next) => {

        let index = req.query.index;

        if(!utils.types.likeNumber(index)){
            res.error(407);
        }
        // after sending start command,
        // it will fork a new downlaod process and receive data.
        const list = java_download_list();

        if(index >= list.length){
            res.error(407); // no such index!
        }else{
            const __url = list[index]["link"],
                  __download_dir = utils.resolve(utils.get_config()["global"]["data_dir"], "downloads");
                  __hash = utils.get_random_string(16),
                  __dest = utils.resolve(__download_dir, __hash);

            const cmd_args = `--spec=jre --url=${__url} --dest=${__dest}`;

            let proc = cp.fork("../../tools/downloader", cmd_args);
            res.success(200);
        }
    }
};