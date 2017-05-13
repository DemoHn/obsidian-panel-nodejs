const fs = require("fs");
const unzip = require("unzip2");
const tar = require("tar");
const mkdirp = require("mkdirp");
const zlib = require("zlib");

// read file contents in the target
module.exports = (target, type) => {
    if(type === "zip"){
        let target_in = fs.createReadStream(target);
        target_in.pipe(unzip.Parse()).on('entry', (entry) => {
            console.log(entry.path);
            entry.autodrain();
        });
    }else if(type === "tar"){
        
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};