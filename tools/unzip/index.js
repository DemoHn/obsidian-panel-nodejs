const unzip = require("./unzip");
const zip = require("./zip");
const read = require("./read");
const extract_file = require("./extract_file");

// node-getopt
let opt = require('../../utils/getopt').create([
  [''  , 'method=ARG' , '`unzip` or `zip`'],
  [''  , 'target=ARG' , 'target file'],
  [''  , 'dest=ARG'  , 'where to extract / compress files?'],
  [''  , 'file=ARG'  , 'which file to extract. (Only for "extract_file" method)'],
  [''  , 'type=ARG'  , '`tar` or `zip`?']
]).parseSystem(); 

let options = opt.options;
const method = options.method;
const target = options.target;
const dest = options.dest;
const type = options.type;
const file = options.file;

if(method === "unzip"){
    unzip(target, dest, type);
}else if(method === "zip"){
    zip(target, dest, type);
}else if(method === "read"){
    read(target, type, (list) => {
        // output
        console.log(JSON.stringify(list));
    });
}else if(method === "extract_file"){
    extract_file(target, dest, file, type);
}else{
    console.log("no such option!");
    return -1;
}