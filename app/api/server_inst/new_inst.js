const utils = require("../../../utils");
const express = require("express");
const path = require("path");
const multer = require("multer");
let check_login_ctrl = require("../../controller/login");
let inst_ctrl = require("../../controller/inst");

let router = express.Router();

const data_dir = utils.get_config()["global"]["data_dir"];
const upload_dir = utils.resolve(data_dir, "uploads");

// check super admin
router.use(check_login_ctrl.check_login);

// render index page
router.get("/", (req, res) => {
    const version = utils.get_version();
    
    res.render("server_inst.html",{
        version: version,
        new_inst_page: 1
    });
});

router.get("/prepare_data", inst_ctrl.prepare_data);

router.get("/assert_input", inst_ctrl.assert_input);

// LOGO
const upload = multer({
    dest : upload_dir,
    fileFilter: function (req, file, cb) {
        if (path.extname(file.originalname) !== '.png') {
            return cb(null, false);
        }
        cb(null, true);
    }
});
router.post("/upload_logo", upload.single('file'), inst_ctrl.upload_logo);

router.get("/preview_logo/:logo", inst_ctrl.preview_logo);

router.post("/create_instance",inst_ctrl._creat_inst_name,
                               inst_ctrl._creat_inst_dir,
                               inst_ctrl._creat_inst_properties,
                               inst_ctrl._creat_listening_port,
                               inst_ctrl._creat_java_bin,
                               inst_ctrl._creat_server_core,
                               inst_ctrl._creat_alloc_RAM,
                               inst_ctrl._creat_max_user,                               
                               inst_ctrl._creat_ftp_account,
                               inst_ctrl._move_logo,
                               inst_ctrl.create_instance);

module.exports = router;