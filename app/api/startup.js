const express = require('express');
const utils = require("../../utils");
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

//
module.exports = router;

