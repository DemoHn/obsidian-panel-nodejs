const fs = require("fs");
const os = require("os");
const cp = require("child_process");
const path = require("path");
const mkdirp = require("mkdirp");

module.exports = (target, dest, type) => {
    let exec_name;
    if(/^win/.test(os.platform())){
        exec_name = "7za.exe";
    }else{
        // and get linux arch
        if(/64/.test(process.arch)){
            exec_name = "./7za-x64";
        }else{
            // 32 bit
            exec_name = "./7za-x86"
        }
    }

    if(type === "zip" || type === "tar"){
        let cmd = `${exec_name} a ${dest} ${target}${path.sep}*`;        
        let proc = cp.exec(cmd, (err, stdout, stderr) => {
            console.log(stdout);            
        });

        proc.on("exit", (code)=> {            
            return code;
        })
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};