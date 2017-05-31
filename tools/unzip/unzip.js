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
        exec_name = "./7za";
    }

    if(type === "zip" || type === "tar"){
        let cmd = `${exec_name} x ${target} -o${dest} -aoa`; // extract command          
        let proc = cp.exec(cmd, (err, stdout, stderr) => {
            console.log(stdout); 
            console.log(stderr);          
        });

        proc.on("exit", (code)=> {            
            return code;
        })
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};