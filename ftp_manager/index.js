const ftpd = require("ftpd");
const utils = require("../utils");

const account_pool = require("./account_pool");

let _port = utils.get_config()["ftp"]["listen_port"];
let _host = utils.get_config()["ftp"]["host"];

// params from CMD line
let port, host;
if(_port == null){
    port = 21;
}else{
    port = parseInt(_port);
}

if(_host == null){
    host = "0.0.0.0";
}else{
    host = _host;
}

// init server instance
let server = new ftpd.FtpServer(host, {
    getInitialCwd: function() {
        return '/';
    },
    getRoot: function(connection, callback) {
        const user = connection.username;
        let account_obj = account_pool.get(user);
            callback(null, account_obj["inst_dir"]);
        if(account_obj == null){
            callback(new Error("can't get inst_dir from username!"), null);
        }        
    },
    pasvPortRangeStart: 1025,
    pasvPortRangeEnd: 1050,
    tlsOptions: null,
    allowUnauthorizedTls: true,
    useWriteFile: false,
    useReadFile: false,
    uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
});

server.on('error', function(error) {
    console.log('FTP Server error:', error);
});

server.on('client:connected', function(connection) {
    let current_user = null;
    connection.on('command:user', function(user, success, failure) {
        if (account_pool.get(user) != null) {
            current_user = user;
            success();
        } else {
            failure();
        }
    });

    connection.on('command:pass', function(pass, success, failure) {
        if(current_user == null){
            failure();
        }else{
            // auth
            if(utils.calc_hash(pass) === account_pool.get(current_user)["hash"]){
                success(current_user);
            }else{
                failure();
            }
        } 
    });
});

// receive update message
process.on("message", (data)=> {
    if(data === "update_ftp_manager"){
        account_pool.update();
    }
});

account_pool.update();
// listen to the server
server.listen(port);

console.log('[FTP] Listening on port ' + port);

