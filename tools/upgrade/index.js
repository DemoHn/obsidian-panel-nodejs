const unzip = require("../unzip/unzip");
const fs  = require("fs-extra");
const mkdirp = require("mkdirp");
const os  = require("os");
const path = require("path");

// node-getopt
let opt = require('../../utils/getopt').create([
  [''  , 'bundle=ARG' , 'bundle name'],
  [''  , 'type=ARG' , 'bundle type']
]).parseSystem(); 

let options = opt.options;
const bundle = options.bundle;
const type = options.type;

const _copy_filter = (src, dst) => {
    const src_arr = src.split(path.sep);
    let src_last = src_arr[src_arr.length - 1];

    if(src_last.indexOf("data") >= 0 || 
       src.indexOf("config.yml") >= 0 ||
       src.indexOf(".startup.lck") >= 0 ||
       src.indexOf("ob-panel.log") >= 0){
        return false;
    }else{
        return true;
    }
}

const _copy_files = () => {
    // Step 2: remove old bundle
    const upgrade_dir = path.resolve(os.tmpdir(), "upgrade-obsidian-panel");

    if(fs.existsSync(upgrade_dir)){
        fs.removeSync(upgrade_dir);
    }

    // Step 3: extract bundle to upgrade dir
    mkdirp.sync(upgrade_dir);

    if(fs.existsSync(bundle)){
        unzip(bundle, upgrade_dir, type, (rtn_code) => {
            if(rtn_code === 0){
                // Step 4: copy files 
                const copy_source = path.resolve(upgrade_dir, "obsidian-panel");
                const copy_dest   = path.resolve(process.execPath, "..", "..");

                fs.copySync(copy_source, copy_dest, {filter: _copy_filter});
                return 0;
            }else{
                console.log("<Fatal error, upgrade process will stop>(UNZIP)");
                return -1;
            }
        });
    }else{
        console.log("<Fatal error, upgrade process will stop>(BUNDLE)");
        return -2;
    }
}

_copy_files();