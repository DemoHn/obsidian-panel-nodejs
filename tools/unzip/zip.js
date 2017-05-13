const fs = require("fs");
const archiver = require("archiver");
const zlib = require("zlib");
const mkdirp = require("mkdirp");

module.exports = (target, dest, type) => {
    
    if(type === "zip" || type === "tar"){
        const output = fs.createWriteStream(dest);
        const archive = archiver(type);

        output.on('close', function() {
            console.log("[zip] " + archive.pointer() + ' total bytes');
            console.log('[zip] archiver has been finalized and the output file descriptor has closed.');
        });

        if(type === "zip"){
            archive.pipe(output);
        }else{
            archive.pipe(zlib.createGzip()).pipe(output);
        }
    
        archive.directory(target, false);
        archive.finalize();

        return 0;
    }else{
        console.log(`no such --type option '${type}' !`);
        return -1;
    }
};