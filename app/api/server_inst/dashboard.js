const utils = require("../../../utils");
const model = require("../../model");
const express = require("express");
const path = require("path");

let check_login_ctrl = require("../../controller/login");
let inst_ctrl = require("../../controller/inst");

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

module.exports = router;
//router.get("/prepare_data", inst_ctrl.prepare_data);