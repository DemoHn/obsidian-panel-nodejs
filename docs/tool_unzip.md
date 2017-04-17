## Unzip Tool Documentation

_Author: Nigshoxiz_   
_Last Update: 16/04/2017_  

1. Overview

`Unzip Tool` is an independent utility helping users zip and unzip compressed bundle. Currently, it only supports `.tar.gz` and `.zip` file extensions.  

To run it, there are two methods:  

a) _CMD line_  

First of all, this tool is bundled other components inside an executable file called `panel-bundle` (Linux) or `panel-bundle.exe` (Windows). Therefore, it's natural to run the tool by executing this executable file with approperate parameters:

```
panel-bundle -t unzip --method unzip
```

Detailed Usages are described in the following content.

b) _Node.js `child_process.fork`_

Another is to call it internally. The most advantage of this way is the ability of bi-directional communication.

2. CMD arguments

    - `--method`  (necessary)  
    Whether a user is willing to extract tarballs or bundle files?  
    Operations are Either `unzip` or `zip`.   
    e.g. : `--method=zip`

    - `--target` (necessary)  
    For `--method=unzip`, it means which file you want to extract;  
    For `--method=zip`, it means which __directory__ you want to bundle.

    - `--dest` (necessary)  
    For `--method=unzip`, it means the destination __directory__ putting extracted files;  
    For `--method=zip`, it means which file you want to put the compressed file.

    - `--type` (optional)
    Extract or compress file type.  
    Options: Either `tar` or `zip`.  
    e.g.: `--type=tar`
