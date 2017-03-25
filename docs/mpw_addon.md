## Minecraft Process Watcher C++ Addon Documentation

_Author: Nigshoxiz_   
_Last Update: 19/03/2017_

1. API
- __require__  
    `const watcher = require('./lib/process_watcher')`

- __dummy test__
    ```js
    watcher.test()
    // return 2333
    ```
- __run watcher (uv loop)__  
   `watcher.run_watcher()`

- __set period of checking CPU & memory tick__  
    `watcher.set_check_period(time=5000)`  
    unit: ms

- __Process class__    
    `let proc = watcher.Process(mc_w_config)`
    - mc_config: An object describes all necessary params of launching a MC process.  
    ```
    mc_w_config = {
        java_bin : java executable location. (by default is /usr/bin/java)
        min_RAM   : minimum RAM allocated for this process. (unit : MB)
        max_RAM   : maximum RAM allocated for this process. (unit: MB)
        jar_file : MC server core jar file. (e.g. : `minecraft_server_1.7.10.jar`)
        proc_cwd : literally, it means MC server's working directory. But here, it's where to save world's data.
    }
    ```

- __start MC process__  
    `proc.start_process()`  

- __stop MC process__  
    `proc.stop_process()`  
    
    When `stop_process()` is executed, it will send "stop" command to the running MC process and wait for exiting.
    Thus, it's an async method that we don't guarantee that the MC process is actually terminated.

- __terminate MC process (send SIGKILL signal)__  
    `proc.terminate_process()`

- __send command__  
    `proc.send_command(command)`  
    - command: a string without "\n"   
    e.g. : `proc.send_command("help")`

- __get pid of current MC process__  
    `proc.get_pid()`  
    *NOTICE* : return null if there is no pid find.

- __process events__
    - proc.on_stdout_read(data, err)
    - proc.on_stderr_read(data, err)
    - proc.on_exit(status, signal)

- __global events__
    - watcher.on_memory_change(pid, memory)
    - watcher.on_CPU_load_change(pid, CPU_load)

2. Example

```js
// after compilation, process_watcher will automatically put into
// ./process_watcher/lib/ (dev)
// ./lib/ (producation)
const watcher = require("./lib/process_watcher")

// 1. just a dummy test whether it works well.
console.log(watcher.test()) // = 2333

```