class MCWrapperConfig {
    constructor(mc_w_config){
        this.jar_file = mc_w_config['jar_file'];
        this.java_bin = mc_w_config['java_bin'];
        // unit: GB
        this.min_RAM  = mc_w_config['min_RAM'];
        this.max_RAM  = mc_w_config['max_RAM'];
        this.max_player = mc_w_config['max_player'];
        this.proc_cwd = mc_w_config['proc_cwd'];
        this.port = mc_w_config['port'];
    }
}

module.exports = MCWrapperConfig;