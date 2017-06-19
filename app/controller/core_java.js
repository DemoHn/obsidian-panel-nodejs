const os = require("os");
const fs = require("fs");
const cp = require("child_process");
const mkdirp = require("mkdirp");

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
                "link": this.tasks[item]["link"],
                "status": this.tasks[item]["status"],
                "progress": this.tasks[item]["progress"]
            };
        }

        return cpy_tasks;
    }

    has_working_link(link){
        for(let item in this.tasks){
            if(this.tasks[item]['link'] == link && this.tasks[item]['status'] in (_utils.DOWNLOADING, _utils.EXTRACTING)){
                return true;
            }
        }
        return false;
    }
} 

const _query_core_file_id = (res, core_file_id) => {
    const ServerCore = model.get("ServerCore");
    return new Promise((resolve, reject) => {
        ServerCore.findOne({where: {core_id : core_file_id}}).then( 
            (data)=>{
                if(data == null)
                    res.error(411);
                else
                    resolve(data);
            },
            (err)=>{
                reject(res, 500);
            }
        );
    });
};

const _query_int_pkg_id = (res, package_id) => {
    const IntegratedPackage = model.get("IntegratedPackage");
    return new Promise((resolve, reject) => {
        IntegratedPackage.findOne({where: {pkg_id : package_id}}).then( 
            (data)=>{
                if(data == null)
                    res.error(411);
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

const _install_java_binary = (major_version, minor_version, res, hash, java_binary_pool, __dest) => {
    const JavaBinary = model.get("JavaBinary");

    // version name (XuYY format)
    // e.g. : 8u112
    const version = `${major_version}u${minor_version}`;
    const __bin_dir = utils.resolve(utils.get_config()["global"]["data_dir"], "exes", version);

    mkdirp.sync(__bin_dir);
    if(os.platform() === "linux"){ // linux - to extract
        // start extracting file
        /*
        const unzip_cmd_args = `--method=unzip --type=tar --target=${__dest} --dest=${__bin_dir}`;

        const unzip_module = utils.resolve(
            __dirname,
            "../../tools/unzip"
        );        
        let proc = cp.fork(unzip_module, unzip_cmd_args.split(" "));
        */

        // use `tar` command
        let proc = cp.exec(`tar -xzf ${__dest} -C ${__bin_dir}`, (err, stdout,stderr) => {
            console.log(stdout);
            console.log(stderr);
        });
        // send msg to client
        res.io.emit("message", {hash: hash, event: "_extract_start",result: true});
        java_binary_pool.update(hash, _utils.EXTRACTING, null);

        proc.on('exit', (result) => {
            if(result === 0){
                //extract success
                res.io.emit("message", {hash: hash, event: "_extract_finish",result: true});

                JavaBinary.create({
                    "major_version" : major_version,
                    "minor_version" : minor_version,
                    "bin_directory" : utils.resolve(__bin_dir, `jre1.${major_version}.0_${minor_version}`, "bin", "java"),
                    "install_time" : new Date()
                });
                // we suppose this record would insert successfully.
            }else{
                //extract fail
                res.io.emit("message", {hash: hash, event: "_extract_finish",result: false});
                java_binary_pool.update(hash, _utils.EXTRACT_FAIL, null);
            }
        });

    }else if(/^win/.test(os.platform()) === true){ // windows - run installer
        const installer_args = `INSTALL_SILENT=Enable INSTALLDIR=${__bin_dir} STATIC=1 REBOOT=Disable AUTO_UPDATE=Disable`;

        // for windows, if you want to execute a exe file
        // file extension name shall exists
        // thus, to execute it, a tricky way is to rename the
        // file and add ".exe"
        let __dest_rename = __dest + ".exe";
        fs.renameSync(__dest, __dest_rename);

        let proc = cp.exec(`${__dest_rename} ${installer_args}`);

        res.io.emit("message", {hash: hash, event: "_extract_start",result: true});
        java_binary_pool.update(hash, _utils.EXTRACTING, null);
        console.log(`Installing JRE ${version}`);

        proc.on('exit', (result) => {
            if(result == 0){
                //extract success
                res.io.emit("message", {hash: hash, event: "_extract_finish",result: true});

                JavaBinary.create({
                    "major_version" : major_version,
                    "minor_version" : minor_version,
                    "bin_directory" : utils.resolve(__bin_dir, "bin", "java.exe"),
                    "install_time" : new Date()
                });
                // rename back to original file
                fs.renameSync(__dest_rename, __dest);
            }else{
                //extract fail
                res.io.emit("message", {hash: hash, event: "_extract_finish",result: false});
                java_binary_pool.update(hash, _utils.EXTRACT_FAIL, null);
            }
        });
    }
};

// java download list
const java_download_list = () => {
    const base_link = [
        /*major,minor,link*/
        [8,131,"http://download.oracle.com/otn-pub/java/jdk/8u131-b11/d54c1d3a095b4ff2b6607d096fa80163/jre-8u131"],
      /*  [8,121,"http://download.oracle.com/otn-pub/java/jdk/8u121-b13/e9e7ea248e2c4826b92b3f075a80e441/jdk-8u121"],
        [8,111,"http://download.oracle.com/otn-pub/java/jdk/8u111-b14/jdk-8u111"],
        [7,80,"http://download.oracle.com/otn-pub/java/jdk/7u80-b15/jre-7u80"],*/
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
            const file_path = utils.resolve(data.file_dir, data.file_name);

            // delete file
            try {
                fs.unlink(file_path);   
            } catch (error) {
                
            }

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
    // get all data of integrated pakcages
    get_all_integrated_packages: (req, res) => {
        const IntegratedPackage = model.get("IntegratedPackage");

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
        IntegratedPackage.findAll().then(
            (data)=>{
                if(data == null){
                    res.success(_model_arr);
                    return ;
                }
                for(let i=0;i<data.length;i++){
                    let item = data[i];
                    let _model = {
                        "pkg_id" : item.pkg_id,
                        "package_name" : item.package_name,
                        "minecraft_version" : item.minecraft_version,
                        "exec_jar": item.exec_jar,
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
    // params:
    // @replace : <old pkg path>
    // replace the old int_pkg to new int_pkg
    //
    // returns:
    // @path: the stored path of uploaded file
    // @file_name: the original name of uploaded file. Used for the default value of package name
    save_int_pkg_data: (req, res, next) => {
        // get uploaded file info
        const ori_file_name = req.file.originalname;
        const replace = req.body.replace;
    
        const data_dir = utils.get_config()["global"]["data_dir"];
        const upload_dir = utils.resolve(data_dir, "cores");
        
        if(replace != null && replace != ""){
            try {
                fs.unlinkSync(utils.resolve(upload_dir, replace));    
            } catch (error) {
                // I don't core if unlink old file raises an error!
            }
        }

        let rtn_data = {
            "path": req.file.filename,
            "file_name": ori_file_name
        };
        res.success(rtn_data);
    },

    // queries:
    // @file : <string>
    // file name to read (notice: here, the file_name is a 32-byte random ascii string)
    //
    // returns:
    // <string> directory info (see ref for details)
    read_bundle_directory: (req, res, next) => {
        const file = req.query.file;

        const data_dir = utils.get_config()["global"]["data_dir"];
        const upload_dir = utils.resolve(data_dir, "cores");

        if(file == null || file == ""){
            res.error(406);
        }else{
            // execute tool
            const __target = utils.resolve(upload_dir, file);
            const cmd_args = `--method=read --target=${__target} --type=zip`;

            // launch downloader process!
            const unzip_module = utils.resolve(
                __dirname,
                "../../tools/unzip"
            );
            let proc = cp.fork(unzip_module, cmd_args.split(" "), {silent: true});

            // get result from stdout
            proc.stdout.on('data', (buf) => {
                let dir_info = buf.toString().trim();
                res.success(dir_info);
            });
        }
    },

    // params:
    // @pkg_id: <integer>
    // get the content of directory
    // 
    // returns:
    // <string> directory info
    read_bundle_directory_by_package_id: (req, res, next) => {
        const IntegratedPackage = model.get("IntegratedPackage");
        const package_id = req.params.package_id;

        IntegratedPackage.findOne({where: {pkg_id : package_id}}).then( 
            (data)=>{
                if(data == null){
                    res.error(411);
                }else{
                    let file_path = data.file_path;
                    if(file_path == null || file_path == ""){
                        res.error(406);
                    }else{
                        // execute tool
                        const __target = file_path;
                        const cmd_args = `--method=read --target=${__target} --type=zip`;

                        // launch downloader process!
                        const unzip_module = utils.resolve(
                            __dirname,
                            "../../tools/unzip"
                        );
                        let proc = cp.fork(unzip_module, cmd_args.split(" "), {silent: true});

                        // get result from stdout
                        proc.stdout.on('data', (buf) => {
                            let dir_info = buf.toString().trim();
                            res.success(dir_info);
                        });
                    }
                }
            },
            (err)=>{
                res.error(500);
            }
        );
    },
    // after all preparation, it's time to add this package into database!
    // params
    // @file: stored file name
    // @exec_jar: executable jar location (relative to the zip file)
    // @package_name: package name
    // @minecraft_version: MC version
    // @note: additional note
    add_integrated_package: (req, res, next) => {
        const IntegratedPackage = model.get("IntegratedPackage");
        
        const data_dir = utils.get_config()["global"]["data_dir"];
        const upload_dir = utils.resolve(data_dir, "cores");

        // all params
        const file = req.body.file,
              exec_jar = req.body.exec_jar,
              package_name = req.body.package_name,
              minecraft_version = req.body.minecraft_version,
              note = req.body.note;
        
        // check all values
        // 1. if file is null
        if(file == null || file == ""){
            res.error(406);
            return ;
        }
        // 2. if package name is null
        if(package_name == null || package_name == ""){
            res.error(406);
            return ;
        }
        // 3. exec_jar shall be started with "/", and not ended with "/"
        // e.g. [valid] /server.jar
        // e.g. [invalid] kcaldron.jar
        // e.g. [invalid] /bin/something.jar/
        if(exec_jar == null || exec_jar == ""){
            res.error(406);
            return ;
        }else if(exec_jar[0] != "/" || exec_jar[exec_jar.length-1] == "/"){
            res.error(406);
            return ;
        }

        // 4. initialize other variables
        if(note == null){
            note = "";
        }

        if(minecraft_version == null){
            minecraft_version = "";
        }

        let file_path = utils.resolve(upload_dir, file);
        // stat file and ready to add package into db
        fs.stat(file_path, (err, stat) => {
            if(err){
                // mostly because of file not found!
                res.error(407);
                return ;
            }else{
                const file_size = stat.size;
                let _exec_jar = exec_jar.substr(1);

                IntegratedPackage.create({
                    file_size: file_size,
                    file_path : file_path,
                    file_uploader: req._uid,
                    create_time: new Date(),
                    exec_jar: _exec_jar,
                    minecraft_version: minecraft_version,
                    note: note,
                    package_name: package_name
                }).then((data)=>{
                    res.success(200);
                },(err) => {
                    console.log(err);
                    res.error(406);
                })
            }
        });
    },
    // edit int package
    // @params
    // pkg_id
    edit_int_pkg_params: (req, res) => {
        const IntegratedPackage = model.get("IntegratedPackage");        
        let package_id;
        try {
            package_id = parseInt(req.params.package_id); 
        } catch (error) {
            console.error(error);
            res.error(407);
        }

        // first find if inst id exists
        _query_int_pkg_id(res, package_id)
            .then((data)=> {
                let update_dict = {};
                update_dict["note"] = req.body.note;
                update_dict["exec_jar"] = req.body.exec_jar;
                update_dict["package_name"] = req.body.package_name;
                update_dict["minecraft_version"] = req.body.minecraft_version;

                // update core_file content
                IntegratedPackage.update(update_dict, {where: {pkg_id: package_id}}).then(
                    ()=>{
                        res.success(200);
                    },(err)=>{
                        console.error(err);
                        res.error(500);
                    }
                )
            },/*error*/_reject_end);
    },

    delete_int_pkg: (req, res) => {
        const IntegratedPackage = model.get("IntegratedPackage");
        // core_file_id as param
        let package_id;
        try {
            package_id = parseInt(req.params.package_id); 
        } catch (error) {
            console.error(error);
            res.error(407);
        }

        // TODO
        _query_int_pkg_id(res, package_id).then((data)=>{
            try {
                fs.unlink(data.file_path);
            } catch (error) {
                
            }
            // TODO delete file
            IntegratedPackage.destroy({where:{pkg_id : package_id}}).then( ()=>{
                res.success(200);
            },(err)=>{
                console.error(err);
                res.error(500);
            });
        }, _reject_end);
    },
    /* 
     *     
     * java_binary 
     * 
     * 
     * */
    // get java donwload list
    // no params
    get_java_download_list : (req, res, next) => {
        /*
        dw_list model:
        {
            "major" : ***,
            "minor" : ***,
            "link" : ***,
            "dw" : {
                "progress",
                "status",
                "current_hash",
            }
        }
        */
        const JavaBinary = model.get("JavaBinary");

        let _list = java_download_list();
        let dw_list = [];

        JavaBinary.findAll().then(
            (binary) => {
                for(let i=0;i<_list.length;i++){
                    let item = _list[i];
                    let _dw = {
                        "progress" : 0,
                        "status": _utils.WAIT,
                        "current_hash" : ""
                    };

                    // read from tasks
                    let all_tasks = java_binary_pool.get_all();
                    for(let task in all_tasks){
                        if(all_tasks[task]["link"] == item["link"]){
                            _dw["progress"] = all_tasks[task]["progress"];
                            _dw["status"] = all_tasks[task]["status"];
                            _dw["current_hash"] = task;
                            break;
                        }
                    }

                    // read if registered
                    if(binary != null){
                        for(let _i=0;_i<binary.length;_i++){
                            let bin = binary[_i];
                            if(bin.major_version === item["major"] + "" 
                            && bin.minor_version === item["minor"] + ""){
                                _dw["status"] = _utils.FINISH;
                                break;
                            }
                        }
                    }

                    // conclusion
                    let _model = {
                        major: item["major"],
                        minor: item["minor"],
                        link: item["link"],
                        dw: _dw
                    }
                    dw_list.push(_model);
                }
                
                res.success(dw_list);
            },
            (err) => {
                console.log(err);
                res.error(500);
            }
        );
        
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
            major_version: req.body.major,
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
        const JavaBinary = model.get("JavaBinary");
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

            // launch downloader process!
            const downloader_module = utils.resolve(
                __dirname,
                "../../tools/downloader"
            );

            let proc = cp.fork(downloader_module, cmd_args.split(" "));

            // after that, handover consecutive operations to event hooks!
            proc.on("message", (data)=>{
                let event = data.event;
                // send websocket data
                res.io.emit("message", data);

                // handle events
                if(event === "_download_start"){
                    java_binary_pool.add(data.hash, data.result);
                }else if(event === "_get_progress"){
                    let _dw = data.result[0];
                    let _fz = data.result[1];
                    let _prog = 0.0;
                    if(_fz == null){
                        _prog = 0;
                    }else{
                        _prog = _dw / _fz;
                    }
                    java_binary_pool.update(data.hash, _utils.DOWNLOADING, _prog);
                }else if(event === "_download_finish"){
                    if(data.result === true){
                        _install_java_binary(
                            list[index]["major"], list[index]["minor"],
                            res, data.hash, java_binary_pool, __dest
                        );
                        
                    }else{
                        java_binary_pool.update(data.hash, _utils.FAIL, null);
                    }
                }
            });

            res.success(200);
        }
    },

    // system java
    // While downloading java from Oracle's Official link (which always changes!)
    // we also provide you a way to insert system java executable into list.

    // To add system java, you have to install it globally at the beginning. 
    detect_system_java: (req, res, next) => {
        const JavaBinary = model.get("JavaBinary");
        let java_exec = "java";

        if(/^win/.test(os.platform())){ // if windows
            java_exec = "java.exe";
        }

        cp.exec(java_exec + " -version", (err, stdout, stderr) => {
            if(err){
                console.log(err);
                res.error(500);
            }else if(/version "(.+)"/i.test(stderr) === true){ // system java has installed
                // and check if it has been installed already
                JavaBinary.findOne({where: {bin_directory: java_exec}}).then((data)=>{
                    if(data != null)
                        res.success(1); // has installed
                    else
                        res.success(0); // can install
                },(err)=>{
                    res.error(500);
                });                
            }else{
                res.success(-1); // no such version
            }
        });
    },

    add_system_java: (req, res, next) => {
        const JavaBinary = model.get("JavaBinary");

        let java_exec = "java";
        if(/^win/.test(os.platform())){ // if windows
            java_exec = "java.exe";
        }

        cp.exec(java_exec + " -version", (err, stdout, stderr) => {
            if(err){
                console.log(err);
                res.error(500);
            }else if(/java version "(.+)"/i.test(stderr) === true){ // system java has installed
                const re = /java version ".+\.(.+)\..+_(.+)"/.exec(stderr);
                const major_ver = re[1];
                const minor_ver = re[2];

                JavaBinary.create({
                    major_version: major_ver,
                    minor_version: minor_ver,
                    bin_directory: java_exec
                }).then( (data)=>{
                    // success
                    res.success(200);
                }, (err)=>{
                    // fail
                    console.error(err);
                    res.error(500);
                })
            }else{
                res.success(false);
            }
        });
    }
};
