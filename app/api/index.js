// include all submodules
module.exports = (app)=>{
    app.use("/startup", require("./startup"));
}