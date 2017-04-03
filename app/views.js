const utils = require("../utils");
const express = require("express");
module.exports = (app)=>{
    // serve static files
    const static_dir = utils.resolve(__dirname, "..", "static");
    const version = utils.get_version();

    const login_ctrl = require("./controller/login");
    // 1. serve static directory
    app.use('/static', express.static(static_dir));

    // 2. serve js files (trivial js-file version control)
    app.get(`/vendors-${version}.js`, (req, res, next)=>{
        res.sendFile(utils.resolve(__dirname, "..", "static", "js", `vendors-${version}.build.js`));
    });

    app.get(`/super_admin.app-${version}.js`, (req, res, next)=>{
        res.sendFile(utils.resolve(__dirname, "..", "static", "js", `super_admin.app-${version}.build.js`));
    });

    app.get(`/server_inst.app-${version}.js`, (req, res, next)=>{
        res.sendFile(utils.resolve(__dirname, "..", "static", "js", `server_inst.app-${version}.build.js`));
    });

    app.get(`/startup.app-${version}.js`, (req, res, next)=>{
        res.sendFile(utils.resolve(__dirname, "..", "static", "js", `startup.app-${version}.build.js`));
    });
    
    // 3. index & login file
    app.get("/", (req, res, next)=>{
        // while panel is still on startup stage
        if(utils.get_startup_lock() === true){
            res.redirect("/startup");
        }else{
            // go to dashboard directory
            res.redirect("/server_inst/dashboard");
        }
    });

    app.get("/login", (req, res, next)=>{
        let login_flag;
        // while panel is still on startup stage
        if(utils.get_startup_lock() === true){
            login_flag = 0;
        }else{
            login_flag = 1;
        }
        res.render("startup.html", {
            version: version,
            login_flag : login_flag
        });
    });

    // handle login
    app.post("/login", login_ctrl.log_in);

    app.post("/logout", login_ctrl.log_out);
}

