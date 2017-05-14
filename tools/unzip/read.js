const fs = require("fs");
const unzip = require("unzip2");
const tar = require("tar");
const mkdirp = require("mkdirp");
const zlib = require("zlib");

// read file contents in the target
let dir_tree = {};

const _append_dir = (dir_name, dir_type, file_size) => {
    // init
    let dir_arr = dir_name.split("/");
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
    if(type === "zip"){
        let target_in = fs.createReadStream(target);

        target_in.pipe(unzip.Parse()).on('entry', (entry) => {
            _append_dir(entry.path, entry.type, entry.size);
            entry.autodrain();
        }).on('close', ()=> {
            callback(dir_tree);
        });

    }else if(type === "tar"){
        let target_in = fs.createReadStream(target);
        target_in.pipe(zlib.createGunzip()).pipe(tar.list()).on('entry', (entry)=>{
            _append_dir(entry.path, entry.type, entry.size);
        }).on('end', ()=>{
            callback(dir_tree);
        });
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};