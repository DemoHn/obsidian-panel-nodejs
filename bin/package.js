const fs = require("fs-extra");
const path = require("path");
const yaml = require("js-yaml");
const utils = require("../utils");
const cp = require("child_process");

// this file is designed to export final bundles for its platform.
// we suppose the binary has been compiled and exported. (i.e. : `npm run build` has been executed!)

// 1. verify if dist/ exists
try {
    fs.statSync(path.resolve(__dirname, "..", "dist"));
} catch (error) {
    console.log(error);
    return -1;
}
// 2. copy dist/ -> obsidian-panel/
const _dist = path.resolve(__dirname, "..", "dist"),
      _new_dist = path.resolve(__dirname, "..", "obsidian-panel");

fs.copySync(_dist, _new_dist);
// 3. add .UPDATES.yml
const _updates_yml = path.resolve(_new_dist, ".UPDATES.yml");

const current_date = new Date(); 
const yaml_config = {
    "version": utils.get_version(),
    "min_requirement" : "0.0.0",
    "release_date": `${current_date.getFullYear()}/${current_date.getMonth()+1}/${current_date.getDate()}`
}

utils.write(_updates_yml, yaml.dump(yaml_config));

// 4. zip them
console.log("Zip files...");
/*
let cmd = `${exec_name} a ${dest} ${target}${path.sep}*`;

let proc = cp.exec(cmd, (err, stdout, stderr) => {
    console.log(stdout);            
});

proc.on("exit", (code)=> {
    if(callback != null){
        callback(code);
    }else{
        return code;
    }
})
*/
