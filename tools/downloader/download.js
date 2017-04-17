const request = require("request");
const fs = require("fs");
const path = require("path");

const MIN_SEND_LEN = 1024 * 64;
const send_message = (event, hash, data) => {
    // i.e. This process is forked by main process and
    // its IPC channel was opened.
    if(process.send != undefined){
        const _data = {
            "event" : event,
            "hash" : hash,
            "result": data
        }
        process.send(_data);
    }
};

const download = (url, dest, spec, hash = "") => {
    return new Promise((resolve, reject)=>{
        let file = fs.createWriteStream(dest);
        let _hash;
        let download_options = {
            url: url,
            timeout: 15000
        };

        // set
        if(hash === ""){
            _hash = path.basename(dest);
        }else{
            _hash = hash;
        }

        if(spec === "jre"){
            download_options.headers = {
                "Cookie": "oraclelicense=accept-securebackup-cookie"
            };
        }

        request(download_options).on("response", (resp) => {
            if(resp.statusCode === 200){

                let content_length = resp.headers['content-length'];

                if(content_length == undefined){
                    content_length = null;
                }else{
                    content_length = parseInt(content_length);
                }
                
                // start downloading
                console.log(`<DOWNLOADER> url=${url}, dest=${dest}`);
                // send message
                send_message("_download_start", _hash, url);

                let _len = 0;
                let _total_download = 0;
                let min_send_len = MIN_SEND_LEN;
                resp.on('data', (data)=>{
                    let len = data.length;
                    _total_download += len;

                    _len += len;

                    if(content_length != null){
                        min_send_len = Math.floor(content_length / 512);
                    }
                    if(_len > min_send_len){
                        send_message("_get_progress", _hash, [_total_download, content_length]);
                        _len = 0;
                    }
                })

                resp.on("close", ()=>{
                    send_message("_download_finish", _hash, false);
                    reject(400);                    
                });

                resp.on("end", (data)=>{
                    send_message("_download_finish", _hash, true);
                });
                
                // ignore 3xx (redirect) status codes
            }else if(resp.statusCode >= 400){
                try{
                    fs.unlink(dest);
                }catch(e){

                }
                send_message("_download_start", null, null);

                reject(resp.statusCode); // 404 -> timeout 
                                         // 500 -> fatal error
            }
        }).pipe(file);
    });
};

module.exports = download;