const model = require("../../model");

const multer = require("multer"),
      express = require("express"),
      utils = require("../../../utils");
      
      check_login_ctrl = require("../../controller/login"),
      upgrade_ctrl = require("../../controller/upgrade");
      
const data_dir = utils.get_config()["global"]["data_dir"];
const files_dir = utils.resolve(data_dir, "files");

const files_upload = multer({
    dest: files_dir
});

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

router.post("/passwd", (req, res, next) => {
    const User = model.get("User");
    const ori_password = req.body["ori_password"],
          new_password = req.body["new_password"];
    
    User.findOne({
        where: {
            id: req._uid
        }
    }).then(
        (data) => {
            const ori_hash = data.hash;
            if(utils.calc_hash(ori_password) === ori_hash){
                User.update({hash: utils.calc_hash(new_password)}, {where:{id: req._uid}}).then(
                    (data) => { res.success(true); },
                    (err) => { res.error(500); }
                );
            }else{
                res.error(503);
            }
        },
        (err) => {
            res.error(500);
        }
    );
});

router.get('/get_current_version', (req, res, next) => {
    let version = utils.get_version();
    res.success(version);
});

// upload package manually
router.post("/upload_upgrade_package", files_upload.single('files'), upgrade_ctrl.verify_upgrade_bundle);

// execute upgrade script
router.get("/execute_upgrade_script", upgrade_ctrl.execute_upgrade_script);

module.exports = router;