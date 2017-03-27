const utils = require("../../utils");
const fs = require("fs");
const Sequelize = require("sequelize");

// read config and init sequelize instance
let config = utils.get_config();
//  check keys
// 
let sequelize = new Sequelize(/*db_name*/,/*username*/,/*password*/,/*options*/);
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