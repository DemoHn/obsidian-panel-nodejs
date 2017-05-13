const utils = require("../../utils");
const cp = require("child_process");
const os = require("os");

// node-getopt
let opt = require('../../utils/getopt').create([
  ['', 'command=ARG', 'What to do next?']
]).parseSystem();

let options = opt.options;
const command = options.command;

const return_result = (command, data) => {
  const model = {
    "command" : command,
    "data" : data
  };
  console.log(JSON.stringify(model));
}

if (os.platform() === "win32") {
  // On Windows, we use nssm.exe as Service Manager, which is an external executable
  const service_name = "obsidian-panel";
  const nssm_dir = utils.resolve(utils.get_cwd(), "nssm.exe");
  const exec_dir = process.execPath;

  // return data model:
  /* e.g: 
  {
    command: "install",
    data: 0 // success
          -1 // error
  }
   */
  if (command === "install") {
    cp.exec(`${nssm_dir} install ${service_name} ${exec_dir}`, (err, stdout, stderr) => {
      if(stderr != null && stderr != ""){
        return_result("install", -1);
      }else{
        return_result("install", 0);
      }
    });

  } else if (command === "start") {
    cp.exec(`${nssm_dir} start ${service_name} ${exec_dir}`, (err, stdout, stderr) => {
      if(stderr != null && stderr != ""){
        return_result("start", -1);
      }else{
        return_result("start", 0);
      }
    });
  } else if (command === "stop") {
    cp.exec(`${nssm_dir} stop ${service_name} ${exec_dir}`, (err, stdout, stderr) => {
      if(stderr != null && stderr != ""){
        return_result("stop", -1);
      }else{
        return_result("stop", 0);
      }
    });
  } else if (command === "status") {
    cp.exec(`${nssm_dir} status ${service_name}`, (err, stdout, stderr) => {
      // stopped || running
        if(stderr != null && stderr != ""){
          return_result("status", -1);
        }else if(stdout.indexOf("SERVICE_STOPPED")){
          return_result("status", "stopped");
        }else if(stdout.indexOf("SERVICE_RUNNING")){
          return_result("status", "running");
        }else{
          return_result("status","stopped");
        }
    });
  } else if(command === "remove"){
    cp.exec(`${nssm_dir} remove ${service_name} confirm`, (err, stdout, stderr) => {
      
      if(stderr != null && stderr != ""){
        return_result("remove", -1);
      }else{
        return_result("remove", 0);
      }
    });
  }
} else {
  // Linux Version

  if (command === "install") {

  } else if (command === "start") {

  } else if (command === "stop") {

  } else if (command === "status") {

  }
}


