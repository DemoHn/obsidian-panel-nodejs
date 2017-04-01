const express = require('express');
const utils = require("../../utils");
const startup_ctrl = require("../controller/startup");

let router = express.Router();

// only on startup
router.use((req, res, next)=>{
    if(utils.get_startup_lock() == false){
        res.status(403).end();
    }else{
        next();
    }
});

// main page
router.get("/", (req, res)=>{
    const version = utils.get_version();
    res.render("startup.html",{
        version: version,
        login_flag: 0
    })
});

// test mysql connection
router.post("/test_mysql_connection", startup_ctrl.test_mysql_db);

// submit data
router.post("/submit_config", 
    startup_ctrl.set_port_config,
    startup_ctrl.set_db_config,
    startup_ctrl.init_main_db,
    startup_ctrl.init_super_admin
);

module.exports = router;

