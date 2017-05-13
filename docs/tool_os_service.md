## OS-Service Tool Documentation

_Author: Nigshoxiz_   
_Last Update: 02/05/2017_  

1. Overview

This tool is designed to register the executable `obsidian` ( or `obsidian.exe` on Windows ) as a system service.

To run it, there are two methods:  

a) _CMD line_  

First of all, this tool is bundled other components inside an executable file called `panel-bundle` (Linux) or `panel-bundle.exe` (Windows). Therefore, it's natural to run the tool by executing this executable file with approperate parameters:

```
panel-bundle -t pm2
```

Detailed Usages are described in the following content.

b) _Node.js `child_process.fork`_

Another is to call it internally. The most advantage of this way is the ability of bi-directional communication.

2. CMD arguments

    - `--command`  (necessary)  
    What to do next?
    args: either `start`, `stop`, `debug`, `status`, `install`
    e.g. : `--command=install`

