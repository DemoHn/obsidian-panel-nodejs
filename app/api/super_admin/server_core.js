const multer = require("multer"),
      express = require("express"),

      utils = require("../../../utils"),
      core_ctrl = require("../../controller/core_java"),
      check_login_ctrl = require("../../controller/login");

const data_dir = utils.get_config()["global"]["data_dir"];
const upload_dir = utils.resolve(data_dir, "cores");

const upload = multer({
    dest: upload_dir
});

let router = express.Router();

router.use(check_login_ctrl.check_super_admin);

// render index page
router.get("/", (req, res) => {
    const version = utils.get_version();
    
    res.render("super_admin.html",{
        version: version
    });
});

// get core info
router.get("/get_core_file_info", core_ctrl.get_all_cores);

// edit params
router.post("/edit_core_file_params/:core_file_id", core_ctrl.edit_core_params);

// delete core file
router.get("/delete_core_file/:core_file_id", core_ctrl.delete_core_file);

// upload & save core file
router.post("/upload_core_file", upload.single('files'), core_ctrl.save_core_file_data);

module.exports = router;