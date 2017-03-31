const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const os   = require("os");

module.exports = {
    types : require("./types"),
    rtn : require("./rtn"),
    salt : Buffer.from([0x87, 0x93, 0xfb, 0x00, 0xfa, 0xc2, 0x88, 0xba, 0x24, 0x86, 0x98, 0x27, 0xba, 0xa8, 0xc6]),

    get_version : ()=>{
        const package_json_str = fs.readFileSync("package.json", {encoding:"utf8"});
        const jstr = JSON.parse(package_json_str);
        return jstr["version"];
    },
    // is debug
    is_debug : ()=>{
        if(process.env['NODE_ENV'] == "debug"){
            return true;
        }else{
            return false;
        }
    },
    // @require try-catch block maybe!
    get_config : (filename)=>{
        let config_file = path.resolve(__dirname, "..", "config.yml"); 
        try{
            if(filename !== undefined){
                config_file = filename;
            }

            let conf_str = fs.readFileSync(config_file, {encoding:"utf8"});
            // replace variables
            if(conf_str == null){
                return null;
            }else{
                let $root_dir = os.homedir();
                let $tmp_dir  = os.tmpdir();

                conf_str = conf_str.replace(/\$ROOT_DIR\$/g, $root_dir);
                conf_str = conf_str.replace(/\$TMP_DIR\$/g, $tmp_dir);
            }
            let doc = yaml.safeLoad(conf_str);
            return doc;
        } catch(e) {
            console.error(e);
            throw Error(`load config file '${config_file}' failed!`);
        }
    },
    // fs utils
    read : (filename)=>{
        const data = fs.readFileSync(filename, {encoding:"utf8"});
        return data;
    },
    write: (filename, data)=>{
        fs.writeFileSync(filename, data, {flag: 'w+'});
        return null;
    },
    exists: (filename)=>{
        try {
            fs.accessSync(filename);
        } catch (error) {
            return false;
        }
        return true;
    },
    //path route
    resolve: (root_dir, ...args)=>{
        return path.resolve(root_dir, ...args);
    }
}