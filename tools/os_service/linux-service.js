var Service = require('node-service-linux').Service;
var utils = require("../../utils");
//
// Create a new service object
var svc = new Service({
    name:'obsidian_panel',
    description: 'An advanced Minecraft Server Panel.',
    execbin: process.execPath,
    outlog: utils.get_config()['global']['log_file'], 
    errlog: utils.get_config()['global']['log_file'] 
});

console.log(process.execPath)
module.exports = svc;
