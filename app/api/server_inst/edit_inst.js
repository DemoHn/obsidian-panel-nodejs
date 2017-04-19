const express = require("express");
let check_login_ctrl = require("../../controller/login");
let inst_ctrl = require("../../controller/inst");
const utils = require("../../../utils");
const path = require("path");
const multer = require("multer");

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

router.post("/edit_config/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.edit_instance);

// edit LOGO
const data_dir = utils.get_config()["global"]["data_dir"];
const upload_dir = utils.resolve(data_dir, "uploads");
const _upload = multer({
    dest : upload_dir,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname) !== '.png') {
            return cb(null, false);
        }
        cb(null, true);
    }
});

router.post("/upload_logo/:inst_id", 
    check_login_ctrl.check_inst_id,
    _upload.single('file'),
    inst_ctrl.upload_logo_to_inst);

router.get("/delete_logo/:inst_id", 
    check_login_ctrl.check_inst_id,
    inst_ctrl.delete_logo);

router.get("/has_logo/:inst_id", 
    check_login_ctrl.check_inst_id,
    inst_ctrl.if_logo_exists);

module.exports = router;