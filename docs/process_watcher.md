## Minecraft Process Watcher Node.js submodule Documentation

_Author: Nigshoxiz_   
_Last Update: 24/03/2017_  

1. Example  
```js
// app/api/**.js

const proc = require("../../proc");

proc.init().then(()=>{
    proc.start_process(1); // start process instantly
    // proc.send_command(1,"help"); // send command
});
```

2. API
- __require__  
    `const proc = requrie("/path/to/proc");`

- __init__  
    method: `@method proc.init()`  
    return: `new Promise()`

    Initialize when starting process watcher.

    When application starts, it's necessary to read instances' state from database.

    Since fetching data from database is an async operation, this method returns a Promise object, that is, you can use the following code:

    ```js
    proc.init().then((success)=>{
        // on success
    },(fail)=>{
        // on fail
    });
    ```

- __start__  
    method: `proc.start_process(inst_id)`  
    return: `undefined || new Error('inst id not exists!');`  

    Start a new MC process. This method only spawn a process asynchonously thus it won't stuck waiting for finishing the launch process.

    Also, it will return an Error if inst_id doesn't exist in instance pool.

    __NOTICE__: this method (and the following ones) won't check if the caller has privilege to operate this inst_id. This authentication work is supposed to accomplished by API server.

- __stop__  
    method: `proc.stop_process(inst_id)`   
    return: `undefined || new Error('inst_id doesn't exist!');` 

    Stop MC process by sending "stop" command.

- __stop brutally__  
    method: `proc.terminate_process(inst_id)`   
    return: `undefined || new Error('inst id doesn't exist!');` 
    
    Stop MC process by sending SIGINT. This will terminate the process immediately.
    
    __NOTICE__: It may lose most recent game data! Since MC didn't save the most recent changes to the disk!

- __restart__  
    method: `proc.restart_process(inst_id)`   
    return: `undefined || new Error('inst id doesn't exist!');` 

    Restart MC process by sending "stop" command.

- __get instance info__  
    method: `proc.get_instance_info(inst_id)`  
    return: 
    ```js
            {
                "current_player" : <player num>,
                "total_player" : <total player>,
                "RAM": <allocated RAM>,
                "total_RAM" : <total RAM>,
                "status" : SERVER_STATE.HALT | RUNNING | STARTING
            } || new Error("inst_id doesn't exist!");
    ```

    Get all current information of an instance.