"use strict";

const fs = require("fs");

class KVParser{
    constructor(file){
        this.file = file;
        this.conf_items = {};
    }
    /* load file */
    loads(){
        // try to access file
        // if not, try to create it.
        try {
            fs.accessSync(this.file, fs.constants.F_OK);
        } catch (error) {
            console.error(`can't access ${this.file}, please check!`);
            return null;
        }
        const read_data = fs.readFileSync(this.file, {encoding: 'utf8'});
        let kv_array = read_data.split("\n");

        for(let index in kv_array){
            let line = kv_array[index];
            if(line.indexOf("#") == 0){
                continue;
            }else{
                const pattern = /^([a-zA-Z\-_ ]+)=([^#]*)/;
                if(pattern.test(line)){
                    let result = pattern.exec(line);
                    let key    = result[1];
                    let val    = result[2];
                    this.conf_items[key] = val;
                }
            }
        }
        return this.conf_items;
    }
    /* dumps all configs to file*/
    dumps(){
        const write_options = {
            "encoding" : "utf8",
            "flag" : "w+"
        };
        let file_content = [];

        for(let item in this.conf_items){
            // cast item key
            if(this.conf_items[item] === null || 
            this.conf_items[item] == undefined){
                this.conf_items[item] = "";
            }
            file_content.push(`${item}=${this.conf_items[item]}`);
        }
        // with '\n'
        const write_str = file_content.join("\n");
        // write data
        fs.writeFileSync(this.file, write_str, write_options);
    }
    /* add item */
    add(key, value){
        if(this.conf_items[key] == undefined){
            // trim string
            if(typeof value === "string"){
                value = value.replace(/\s+$/g, "");
            }
            this.conf_items[key] = value;
        }
    }

    remove(key, value){
        if(this.conf_items[key] != undefined)
            delete this.conf_items[key];
    }

    replace(key, new_value){
        if(typeof new_value === "string"){
            new_value = new_value.replace(/\s+$/g, "");
        }
        this.conf_items[key] = new_value;
    }
    /* get item */
    get(self, key){
        if(this.conf_items[key] != undefined){
            return this.conf_items[key];
        }else{
            return null;
        }
    }
}

module.exports = KVParser;