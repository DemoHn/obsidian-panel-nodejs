const express = require("express"),
      utils = require("../../../utils"),
      core_ctrl = require("../../controller/core_java"),
      check_login_ctrl = require("../../controller/login");

let router = express.Router();

router.use(check_login_ctrl.check_super_admin);

// render index page
router.get("/", (req, res) => {
    const version = utils.get_version();
    res.render("super_admin.html",{
        version: version
    });
});

// get java download list
router.get("/get_java_download_list", core_ctrl.get_java_download_list);

// start download java by clicking a button of one version
router.get("/start_download_java", core_ctrl.start_download_java);

// NOTICE: only for test NOW!
router.post("/__add_java_version", core_ctrl.add_java_version);

// detect system java
router.get("/detect_system_java", core_ctrl.detect_system_java);

// add system java
router.get("/add_system_java", core_ctrl.add_system_java);
module.exports = router;