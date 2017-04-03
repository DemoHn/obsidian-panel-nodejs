const os = require("os");
const cp = require("child_process");

module.exports = {
    get_server_info: (req, res, next) => {
        let _model = {
            "cpu" : {
                "vendor" : "",
                "model" : "",
                "cores" : "",
                "freq" : ""
            },
            "OS" : {
                "arch" : "",
                "kernel" : "",
                "name" : "",
                "distro" : ""
            },
            "memory" : ""
        }
        // CPU
        _model.cpu.model = os.cpus()[0]['model'];
        _model.cpu.cores = os.cpus().length;
        _model.cpu.freq  = os.cpus()[0]["speed"];

        // OS
        _model.OS.arch = os.arch()
        _model.OS.name = os.platform()
        // memory
        const total_mem = os.totalmem() / 1024 / 1024 / 1000;
        _model.memory = total_mem.toFixed(2);

        // *NIX only
        if(os.platform() === "linux"){
            // CPU
            let cpuinfo = require('proc-cpuinfo')();
            _model.cpu.vendor = cpuinfo["vendor_id"].join(" ")

            // OS (read kernel info)
            try {
                const data = cp.execSync("uname -rms", {encoding:"utf8"});
                _arr = data.trim().split(" ");
                _arr.splice(-1, 1);
                _model.OS.kernel = _arr.join(" ");
            } catch (error) {
                
            }

            require("getos")((e, os)=>{
                _model.OS.distro = os.dist;
                res.success(_model);
            });
        }else{
            // windows
            res.success(_model);
        }
        
    }
}