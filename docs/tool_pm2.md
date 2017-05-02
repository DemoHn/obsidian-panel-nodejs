## PM2 Tool Documentation

_Author: Nigshoxiz_   
_Last Update: 02/05/2017_  

1. Overview

`PM2` is an advanced process monitor for Node.js applications. This tool is designed to monitor the whole panel.

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
    args: either `start`, `stop`, `debug`, `status`
    e.g. : `--method=start  `

