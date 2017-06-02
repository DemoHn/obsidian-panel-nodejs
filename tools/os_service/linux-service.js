var Service = require('node-service-linux').Service;

// Create a new service object
var svc = new Service({
    name:'obsidian-panel',
    description: 'An advanced Minecraft Server Panel.',
    script: '/path/to/helloworld.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
    svc.start();
});

svc.install();