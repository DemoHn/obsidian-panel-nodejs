const pm2 = require("pm2");
const utils = require("../../utils");
const os = require("os");
// node-getopt
let opt = require('../../utils/getopt').create([
  [''  , 'command=ARG' , 'What to do next?']
]).parseSystem(); 

let options = opt.options;
const command = options.command;

pm2.connect((err) => {
    if(err){
        console.log(err);
        process.exit(2);
    }

    if(command === "start"){
        let program_name = "obsidian";
        // for windows the program is called `obsidian.exe`
        if(/^win/.test(os.platform())){
            program_name = "obsidian.exe"
        }
        pm2.start({
            script: utils.resolve(process.cwd(), program_name),
            interpreter: "none",
            name:"obsidian-panel"
        }, (err) => {
            pm2.disconnect();
            if(err){
                console.log(err);
            }
        });
    }else if(command === "stop"){
        pm2.stop("obsidian-panel", (err) => {
            pm2.disconnect();
            if(err){
                console.log(err);
            }
        })
    }else if(command === "status"){

    }
});