const utils = require("../../utils");
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const mysql = require("mysql");

const _migrate = require("./_migration");

let db = {};

const _import_model = (sequelize, db, model_file) => {
    // if `model_name` is null, then import all models
    // import models from files
    fs.readdirSync(__dirname).filter(function(file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js") && (file.indexOf("_") !== 0);
    }).forEach(function(file) {

        if(model_file == null){
            let model = sequelize.import(path.join(__dirname, file));
            db[model.name] = model;
        }else if(model_file+".js" == file){
            let model = sequelize.import(path.join(__dirname, file));
            db[model.name] = model;            
        }
    });
};

const init_model = (model_file) => {
    let config, sequelize;
    // delete old model objects
    for(let item in db){
        if(item.indexOf("__") !== 0 && item.indexOf("get") !== 0){
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
                storage: utils.resolve(config["global"]["data_dir"], "sql", "ob-panel.sql"),
                logging: false
            });
        }else if(db_conf["type"] === "mysql"){
            sequelize = new Sequelize(db_conf['name'], db_conf["mysql_user"], db_conf["mysql_password"],{
                dialect: "mysql",
                host: db_conf["mysql_host"],
                port: db_conf["mysql_port"],
                logging: false
            });
        }
    } catch(err){
        console.error(err);
        return null;
    }

    _import_model(sequelize, db, model_file);
    return sequelize;
}

db.__init_model = init_model;

if(utils.get_startup_lock() === false){
    // before migration    
    db.__sequelize = db.__init_model();
}

// get model safely
db.get = (item) => {
    if(utils.get_startup_lock() === true){
        return null;
    }else{
        if(db[item] === undefined){
            db.__init_model();
        }
        return db[item];
    } 
}

module.exports = db;