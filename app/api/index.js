// include all submodules
module.exports = (app)=>{
    app.use("/startup", require("./startup"));
    // server_inst
    app.use("/server_inst/new_inst", require("./server_inst/new_inst"));
    app.use("/server_inst/dashboard", require("./server_inst/dashboard"));
    app.use("/server_inst/edit_inst", require("./server_inst/edit_inst"));
    // super_admin
    app.use("/super_admin/info", require("./super_admin/info"));
    app.use("/super_admin/core", require("./super_admin/server_core"));
    app.use("/super_admin/java", require("./super_admin/java_binary"));
    app.use("/super_admin/settings", require("./super_admin/settings"));
}