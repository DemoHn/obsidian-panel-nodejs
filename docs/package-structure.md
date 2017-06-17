# File Tree of Final Package.

1. Introduction

Since `v0.6.1`, obsidian-panel takes `standalone package`, instead of `source code`, to publish it. The most important benefit by doing so is obvious: Users are not required to install 
all prequisities by himself / herself. 

However, this means the previously-used update method, by running 'git clone', can't be used anymore. When users want to update the software, they have to download the newest version manually and upload it to the panel. Thus, we have to constraint the file tree of this standalone package to prevent failing to update or wiping out all data.

2. File Tree

a) Linux x86 (or Linux x64):

-- obsidian-panel/ 
 |--- bin/
    |--- **obsidian** [1]
    |--- 7za-x86 [2]
    |--- 7za-x64
    |--- config.yml [3]
    |--- node_sqlite3.node [4]
    |--- .startup.lck [5]   

 |--- data/
    |--- backups
    |--- cores
    |--- downloads
    |--- exes
    |--- files
    |--- servers
    |--- sql
    |--- uploads
  
  |--- ob-panel.sh [6]
  |--- .UPDATES.yml [7]
  |--- ob-panel.log [8]

[1] Main executable binary.
[2] 7z executable. Used in `unzip` tools.
[3] Main configuration file. **Necessary!** If missing, the process won't start!
[4] Node.js native module.
[5] Startup Lock. The existance of this file indicates that database is not initialized yet.
    After initialization, this file will delete.
[6] Startup script. It's the official way to start this panel. (For details, please check User Guide)
[7] Mark update info. Used for verification when uploading the package.
[8] Process log. 

b) Windows:

-- obsidian-panel/ 
 |--- bin/
    |--- **obsidian.exe** [1]
    |--- 7za.exe [2]
    |--- nssm.exe
    |--- config.yml [3]
    |--- node_sqlite3.node [4]
    |--- .startup.lck [5]   

 |--- data/
    |--- backups
    |--- cores
    |--- downloads
    |--- exes
    |--- files
    |--- servers
    |--- sql
    |--- uploads
  
  |--- ob-panel.exe [6]
  |--- YamlDotNet.dll
  |--- .UPDATES.yml [7]
  |--- ob-panel.log [8]


[1] Main executable binary.
[2] 7z executable. Used in `unzip` tools.
[3] Main configuration file. **Necessary!** If missing, the process won't start!
[4] Node.js native module.
[5] Startup Lock. The existance of this file indicates that database is not initialized yet.
    After initialization, this file will delete.
[6] Startup script. It's the official way to start this panel. (For details, please check User Guide)
[7] Mark update info. Used for verification when uploading the package.
[8] Process log. 


3. An example of `.UPDATES.yml`

```
version: 0.6.3
min_requirement: 0.0.0
release_date: 2017-06-16
note: 
  - 修复BUG
  - Fix bugs
  - 香港记者跑得快
  - hong kong journalists run fast
```

