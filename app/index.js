const express = require("express");
const path    = require("path");
const logger  = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

let app = express();
let server = require("http").Server(app);
//wrap io
let io = require("socket.io")(server);

module.exports = {
    app: app,
    server: server
}