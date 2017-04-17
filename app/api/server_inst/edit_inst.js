const express = require("express");
let check_login_ctrl = require("../../controller/login");
let inst_ctrl = require("../../controller/inst");
const utils = require("../../../utils");

let router = express.Router();

// check login
router.use(check_login_ctrl.check_login);

// render index page
router.get("/:inst_id", check_login_ctrl.check_inst_id, (req, res) => {
    const version = utils.get_version();
    
    res.render("server_inst.html",{
        version: version,
        new_inst_page: 0
    });
});

router.get("/init_edit_data/:inst_id", 
    check_login_ctrl.check_inst_id,
    inst_ctrl.prepare_edit_data
);

router.post("/edit_config/:inst_id", inst_ctrl.edit_instance);

//router.post("/upload_logo/:inst_id", inst_ctrl.upload_logo);
//router.post("/delete_logo/:inst_id", inst_ctrl.upload_logo);
//router.post("/has_logo/:inst_id", inst_ctrl.upload_logo);
module.exports = router;