const fs = require("fs");
const targz = require('tar.gz');
const unzip = require("unzip");
const mkdirp = require("mkdirp");

var request = require('request');

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
        } catch (error) {
            console.log(error);
            return -2;
        }
    }else if(type === "tar"){
        let target_in = fs.createReadStream(target);
        let dest_dir = targz().createWriteStream(dest);
        
        try{
            target_in.pipe(dest_dir);
            return 0;
        }catch(err){
            console.log(err);
            // uncompress file fails!
            return -2;
        }
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};