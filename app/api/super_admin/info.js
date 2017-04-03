const utils = require("../../../utils");
const express = require("express");
let check_login_ctrl = require("../../controller/login");
let info_ctrl = require("../../controller/info");

let router = express.Router();

// check super admin
router.use(check_login_ctrl.check_super_admin);

// render index page
router.get("/", (req, res) => {
    const version = utils.get_version();
    
    res.render("super_admin.html",{
        version: version
    });
});

router.get("/get_server_info", info_ctrl.get_server_info);

module.exports = router;