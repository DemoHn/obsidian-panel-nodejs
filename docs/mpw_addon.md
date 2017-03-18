## Minecraft Process Watcher C++ Addon Documentation

_Author: Nigshoxiz_   
_Last Update: 19/03/2017_

1. API
    - __require__  
    `const watcher = require('./lib/process_watcher')`
    
    - __start watcher (uv loop)__  
   `watcher.start_watcher()`

2. Example

```js
// after compilation, process_watcher will automatically put into
// ./process_watcher/lib/ (dev)
// ./lib/ (producation)
const watcher = require("./lib/process_watcher")

// 1. just a dummy test whether it works well.
console.log(watcher.test()) // = 2333

```