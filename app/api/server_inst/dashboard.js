const utils = require("../../../utils");
const model = require("../../model");
const express = require("express");
const path = require("path");

let check_login_ctrl = require("../../controller/login");
let inst_ctrl = require("../../controller/inst");
let dashboard_ctrl = require("../../controller/dashboard");

let router = express.Router();

// check user
router.use(check_login_ctrl.check_login);

// render index page

router.get("/", (req, res) => {
    const ServerInstance = model.get("ServerInstance");
    const version = utils.get_version();
    
    ServerInstance.findAll().then(
        (data) => {
            if(data == null){
                res.render("server_inst.html",{
                    version: version,
                    new_inst_page: 1
                });          
            }else{
                if(data.length == 0){
                    res.render("server_inst.html",{
                        version: version,
                        new_inst_page: 1
                    });
                }else{
                    res.render("server_inst.html",{
                        version: version,
                        new_inst_page: 0
                    });
                }
            }
        },
        (err) => {
            res.status(500).end();
        }
    );
});

router.get("/get_inst_list", dashboard_ctrl.get_inst_list);

router.get("/logo_src/:inst_id",
    check_login_ctrl.check_inst_id,
    dashboard_ctrl.server_logo_source);

router.get("/get_my_ip", dashboard_ctrl.get_my_ip);

router.get("/get_miscellaneous_info/:inst_id", 
    check_login_ctrl.check_inst_id,
    dashboard_ctrl.get_miscellaneous_info);

// inst operation
router.get("/get_instance_status/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.get_instance_status);

router.get("/get_instance_log/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.get_instance_log);

router.get("/start_instance/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.start_instance);

router.get("/stop_instance/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.stop_instance);

router.get("/terminate_instance/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.terminate_instance);

router.get("/restart_instance/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.restart_instance);

router.get("/send_command/:inst_id",
    check_login_ctrl.check_inst_id,
    inst_ctrl.send_command);

module.exports = router;