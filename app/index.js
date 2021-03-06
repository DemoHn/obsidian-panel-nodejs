const express = require("express");
const path    = require("path");
const cp      = require("child_process");
const logger  = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const _rtn = require("../utils/rtn");
let app = express();

let server = require("http").Server(app);
//wrap io
let io = require("socket.io")(server);

// template engine
app.set('views', path.join(__dirname, '..', 'static', 'html'));
app.set('view engine', 'ejs');
app.engine("html", require('ejs').renderFile);

// body parser
// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// cookie parser
app.use(cookieParser());
// logger
app.use(logger('dev'));

// add rtn.success and rtn.error method
app.use((req, res, next) => {
    res.success = (info, code=200)=>{
        let rtn = {
            status: "success",
            code: code,
            info: info
        };
        res.send(JSON.stringify(rtn));
    }

    res.error = (code, info=null) => {
        if(info === null){
            _info = _rtn.error_code[code];
        }else{
            _info = info;
        }
        let rtn = {
            status: "error",
            code: code,
            info: _info
        };
        res.send(JSON.stringify(rtn));
    }
    next();
});

// use socket.io
app.use((req, res, next) => {
    res.io = io;
    next();
});

// start ftp_manager
let ftp_manager = undefined;

// that means, this process is running main instance instead of independent modules
if(process.argv[2] !== "-t"){
    ftp_manager = cp.fork(path.join(__dirname, "../ftp_manager"));
}

// serve static resources
require("./views")(app);
require("./api")(app);

module.exports = {
    app: app,
    server: server,
    io: io,
    ftp_manager: ftp_manager
}