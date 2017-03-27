const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

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
    // @require try-catch block!
    get_config : ()=>{
        const config_file = path.resolve(__dirname, "..", "config.yml"); 
        try{
            let doc = yaml.safeLoad(
                fs.readFileSync(config_file,{encoding:'utf8'})
            );
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
        fs.wrieFileSync(filename, data, {flag: 'w+'});
        return null;
    },
    exists: (filename)=>{
        try {
            fs.accessSync(filename);
        } catch (error) {
            return false;
        }
        return true;
    }
}