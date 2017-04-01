const express = require("express");
const path    = require("path");
const logger  = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

let app = express();

// template engine
app.set('views', path.join(__dirname, '..', 'static', 'html'));
app.set('view engine', 'ejs');
app.engine("html", require('ejs').renderFile);

// body parser
// for parsing application/json
app.use(bodyParser.json());
// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// serve static resources
require("./views")(app);
require("./api")(app);

let server = require("http").Server(app);
//wrap io
let io = require("socket.io")(server);

module.exports = {
    app: app,
    server: server
}