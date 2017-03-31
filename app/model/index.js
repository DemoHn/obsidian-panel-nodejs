const utils = require("../../utils");
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");

let config, sequelize;
// read config and init sequelize instance
try{
    config = utils.get_config();
    let db_conf = config["db"];

    if(db_conf["type"] == "sqlite"){
        sequelize = new Sequelize(db_conf['name'],null, null, {
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
    return ;
}

let db = {};

// import models from files
fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
}).forEach(function(file) {
    let model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
});

db.sequelize = sequelize;
module.exports = db;