const fs = require("fs");
const os = require("os");
const path = require("path");
const mkdirp = require("mkdirp");
const jschardet = require("jschardet");
const iconv = require("iconv-lite");
const cp = require("child_process");
const utils = require("../../utils");

// read file contents in the target
let dir_tree = {};

const _append_dir = (dir_name, dir_type, file_size) => {
    // init
    let dir_arr = dir_name.split(path.sep);
    let tree_iter = dir_tree;
    for(let i=0;i<dir_arr.length-1;i++){
        if(tree_iter[ dir_arr[i] ] === undefined){
            tree_iter[ dir_arr[i] ] = {};
        }
        tree_iter = tree_iter[ dir_arr[i] ];
    }

    if(dir_type === "File"){
        let last_item = dir_arr[dir_arr.length-1];
        //tree_iter[last_item] = file_size;
        tree_iter[last_item] = 0;
    }else if(dir_type === "Directory"){
        let last_item = dir_arr[dir_arr.length-1];
        if(last_item != "")
            tree_iter[last_item] = {};        
    }
};


module.exports = (target, type, callback) => {
    if(type === "zip" || type === "tar"){
        let exec_name;
        if(/^win/.test(os.platform())){
            exec_name = "7za.exe";
        }else{
            // and get linux arch
            if(/64/.test(process.arch)){
                exec_name = utils.resolve(utils.get_cwd(), "7za-x64");
            }else{
                exec_name = utils.resolve(utils.get_cwd(), "7za-x86");
            }
        }

        let proc = cp.exec(`${exec_name} l ${target}`, {encoding: null}, (err, stdout, stderr) => {
            // detect encoding
            let detect_info = jschardet.detect(stdout);

            // if the possibility of one encoding is really large
            // then accept the conclusion.
            // else use the default encoding 'utf8' instead
            if(detect_info.confidence > 0.8){
                stdout = iconv.decode(stdout, detect_info.encoding);
            }else{
                stdout = iconv.decode(stdout, 'utf8');
            }
            if(stdout != ""){
                let stdout_arr = stdout.split(/(\r?\n)/);
                for(let line in stdout_arr) {
                    if(/^\d\d\d\d/.test(stdout_arr[line])){
                        let line_arr = stdout_arr[line].split(" ");                    
                        let _attr, _dir;
                        // filtering
                        if(line_arr.length > 5){
                            let _index = 0;
                            for(let item in line_arr){
                                if(line_arr[item] == "" || line_arr[item] == null){
                                    continue;
                                }else{                                    
                                    if(_index == 2){
                                        _attr = line_arr[item];
                                    }else if(_index == 5){
                                        _dir = line_arr[item];                                        
                                    }
                                    _index += 1;
                                }
                            }
                        }    
                        //console.log(`${_attr} ${_dir}`);
                        if(/^D/.test(_attr)){
                            _append_dir(_dir, "Directory", null);
                        }else if(/A$/.test(_attr)){
                            _append_dir(_dir, "File", null);
                        }
                    }
                }                
                callback(dir_tree);
            }            
        });

        proc.on("exit", (code)=>{
            // according to 7z's doc, when return code is 0, it works correctly 
            // but when code > 0, that means there're some errors;
            if(code != 0){
                callback(code);
            }            
        })
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};
