## Downloader Tool Documentation

_Author: Nigshoxiz_   
_Last Update: 16/04/2017_  

1. Overview

The `Downloader Tool` is written in pure javascript, which is an independent process downloading files from network.

To run it, there are two methods:  

a) _CMD line_  

First of all, this tool is bundled other components inside an executable file called `panel-bundle` (Linux) or `panel-bundle.exe` (Windows). Therefore, it's natural to run the tool by executing this executable file with approperate parameters:

```
panel-bundle -t downloader --url http://example.tar.gz
```

Detailed Usages are described in the following content.

b) _Node.js `child_process.fork`_

Another is to call it internally. The most advantage of this way is the ability of bi-directional communication.

2. CMD arguments

    - `--url`  (necessary)  
    Download URL.  
    e.g. : `--url=http://download.example.com/download.tar.gz`

    - `--dest` (necessary)  
    Download Destination path (with filename).  
    e.g. : `--dest=/tmp/hello.gz`

    - `--spec`  
    value: `jre`  
    Some download methods require special parameters. For example, downloading jre from orancle needs to pass cookie values.  
    e.g. : `--spec=jre`

    - `--hash`
    [Optional] a random string denoting the name of current downloading task. By default, it's the dest filename.
    e.g. : If dest_file = `/tmp/abc.de`, then `hash = abc.de`;