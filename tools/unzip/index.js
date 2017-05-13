const unzip = require("./unzip");
const zip = require("./zip");
const read = require("./read");

// node-getopt
let opt = require('../../utils/getopt').create([
  [''  , 'method=ARG' , '`unzip` or `zip`'],
  [''  , 'target=ARG' , 'target file'],
  [''  , 'dest=ARG'  , 'where to extract / compress files?'],
  [''  , 'type=ARG'  , '`tar` or `zip`?']
]).parseSystem(); 

let options = opt.options;
const method = options.method;
const target = options.target;
const dest = options.dest;
const type = options.type;

if(method === "unzip"){
    unzip(target, dest, type);
}else if(method === "zip"){
    zip(target, dest, type);
}else if(method === "read"){
    read(target, type);
}else{
    console.log("no such option!");
    return -1;
}