const utils = require("../../utils");
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const mysql = require("mysql");
let db = {};

const init_model = () => {
    let config, sequelize;
    // delete old model objects
    for(let item in db){
        if(item.indexOf("__") !== 0){
            delete db[item];
        }
    }
    // read config and init sequelize instance
    try{
        config = utils.get_config();
        let db_conf = config["db"];

        if(db_conf["type"] == "sqlite"){
            sequelize = new Sequelize(db_conf['name'], null, null, {
                dialect: "sqlite",
                storage: utils.resolve(config["global"]["data_dir"], "sql", "ob-panel.sql")
            });
        }else if(db_conf["type"] === "mysql"){
            sequelize = new Sequelize(db_conf['name'], db_conf["mysql_user"], db_conf["mysql_password"],{
                dialect: "mysql",
                host: db_conf["mysql_host"],
                port: db_conf["mysql_port"]
            });
        }
    } catch(e){
        console.error(e);
        return null;
    }

    // import models from files
    fs.readdirSync(__dirname).filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    }).forEach(function(file) {
        let model = sequelize.import(path.join(__dirname, file));
        db[model.name] = model;
    });

    return sequelize;
}

db.__init_model = init_model;

if(utils.get_startup_lock() === false){
    db.__sequelize = db.__init_model();
}
module.exports = db;