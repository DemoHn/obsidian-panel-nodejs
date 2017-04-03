// include all submodules
module.exports = (app)=>{
    app.use("/startup", require("./startup"));

    // super_admin
    app.use("/super_admin/info", require("./super_admin/info"));
    app.use("/super_admin/core", require("./super_admin/server_core"));
}