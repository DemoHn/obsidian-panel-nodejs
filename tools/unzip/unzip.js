const fs = require("fs");
const unzip = require("unzip2");
const tar = require("tar");
const mkdirp = require("mkdirp");
const zlib = require("zlib");

module.exports = (target, dest, type) => {
    try {
        mkdirp.sync(dest);    
    } catch (error) {
        console.log(error);
        return -3;
    }
    
    if(type === "zip"){
        try {
            let target_in = fs.createReadStream(target);
            target_in.pipe(unzip.Extract({path : dest }));
            return 0;
        } catch (error) {
            console.log(error);
            return -2;
        }
    }else if(type === "tar"){
        try {
            let target_in = fs.createReadStream(target);
            target_in.pipe(zlib.createGunzip()).pipe(tar.x({
                C: dest
            }));
        } catch (error) {
            console.log(error);
            return -2;
        }
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};