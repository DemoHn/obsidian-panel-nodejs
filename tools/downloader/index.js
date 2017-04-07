const download = require("./download");

// node-getopt
let opt = require('node-getopt').create([
  [''  , 'spec=ARG' , 'spec'],
  [''  , 'dest=ARG' , 'download destination'],
  [''  , 'url=ARG'  , 'downlod url'],
]).parseSystem(); 

let options = opt.options;
const url = options.url;
const dest = options.dest;
const spec = options.spec;

download(url, dest, spec).then(
    (data)=>{
        console.log(data);
    },
    (error)=>{
        console.log(error);
    }
);