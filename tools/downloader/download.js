const request = require("request");
const fs = require("fs");

const download = (url, dest, spec) => {
    return new Promise((resolve, reject)=>{
        let file = fs.createWriteStream(dest);

        let download_options = {
            url: url,
            timeout: 15000
        };

        if(spec === "jre"){
            download_options.headers = {
                "Cookie": "oraclelicense=accept-securebackup-cookie"
            };
        }

        request(download_options).on("response", (resp) => {
            if(resp.statusCode === 200){
                resp.on('data', (data)=>{
                    console.log(data.length);
                })

                resp.on("close", ()=>{
                    reject(400);                    
                })

                resp.on("end", (data)=>{
                    console.log("end");
                })
                // ignore 3xx (redirect) status codes
            }else if(resp.statusCode >= 400){
                reject(resp.statusCode); // 404 -> timeout 
                                         // 500 -> fatal error
            }
            console.log(resp.headers['content-length']) // 'image/png'
        }).pipe(file);
/*        
        , (err, res, body) => {
            console.log(download_options);
            res.pipe(file);

            res.on('data', (data)=>{
                console.log(data.length);
            })

            res.on("close", (data)=>{
                console.log(data);
            })
            // download finish
            res.on('finish', (err)=>{
                console.log(err);
                file.close(()=>{
                    resolve("finish");
                });
            });
        }).on("error", (err)=>{
            fs.unlink(dest);
            console.error(err);
            reject("error");
        });*/
    });
};

module.exports = download;