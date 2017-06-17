## Upgrade Tool Documentation

_Author: Nigshoxiz_   
_Last Update: 17/06/2017_  

1. Overview

This tool is designed to upgrade panel from existing bundle.
As a matter of fact, I was not going to add it until I realized that to replace the old `obsidian` exectuable, it's necessary to shut down the current running panel!
Of course, when panel is shut down, further operations can't be accomplished.
Thus, those operations shall be accomplished by this tool which exists as a standalone process.

To run it, there are two methods:  

a) _CMD line_  

First of all, this tool is bundled other components inside an executable file called `panel-bundle` (Linux) or `panel-bundle.exe` (Windows). Therefore, it's natural to run the tool by executing this executable file with approperate parameters:

```
panel-bundle -t upgrade
```

Detailed Usages are described in the following content.

b) _Node.js `child_process.fork`_

Another is to call it internally. The most advantage of this way is the ability of bi-directional communication.

2. CMD arguments

    - `--bundle`  (necessary)  
    The file location of bundle.
    e.g. : `--bundle=C:\Projects\obsidian-panel.zip`

    - `--type`  (necessary)  
    The type of bundle. Either 'zip' or 'tar'.
    e.g. : `--type=tar`
