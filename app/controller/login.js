const crypto = require("crypto");
const utils = require("../../utils");
const model = require("../model");

module.exports = {
    // check whether a user has privilege to operate its own account
    // or something else.
    // for every API (except startup APIs), this middleware method should
    // be loaded at first.
    // of course for root-privleged APIs, use `check_super_admin` instead.
    check_login: (req, res, next) => {
        const session_token = req.cookies["session_token"];

        if(utils.get_startup_lock() === true){
            res.redirect("/startup");
        }else if(session_token == null || session_token == ""){
            res.redirect("/login");
        }else{
            let Token = model.get("Token");
            let User  = model.get("User");
            User.hasMany(Token, {foreignKey: "uid"});
            Token.belongsTo(User, {foreignKey: "uid"});

            // search token in token table
            Token.findOne({
                include: [ User ],
                where: {
                    token : session_token
                }
            }).then(
                (data)=>{
                    // no such token!
                    if(data == null){
                        res.redirect("/login");
                    } else {
                        // every registered user could continue all.
                        req._uid = data.uid;
                        req._priv = data.User.privilege;
                        next();
                    }
                },
                (err)=>{
                    res.error(500);
                }
            )
        }  
    },

    check_super_admin: (req, res, next) => {
        const session_token = req.cookies["session_token"];

        if(utils.get_startup_lock() === true){
            res.redirect("/startup");
        }else if(session_token == null || session_token == ""){
            res.redirect("/login");
        }else{
            let Token = model.get("Token");
            let User  = model.get("User");
            User.hasMany(Token, {foreignKey: "uid"});
            Token.belongsTo(User, {foreignKey: "uid"});

            // search token in token table
            Token.findOne({
                include: [ User ],
                where: {
                    token : session_token
                }
            }).then(
                (data)=>{
                    // no such token!
                    if(data == null){
                        res.redirect("/login");
                    } else if(data.User.privilege & utils.ROOT_USER){
                        // only root user could continue
                        req._uid = data.uid;
                        req._priv = data.User.privilege;
                        next();
                    } else {
                        res.redirect("/login");
                    }
                },
                (err)=>{
                    res.error(500);
                }
            )
        }
    },

    log_in: (req, res, next) => {
        const User  = require("../model").get("User");
        const Token = require("../model").get("Token");

        // find if user exists
        const query_username = (username, password, remember_me) => {
            return new Promise((resolve, reject) => {
                try {
                    User.findOne({where: { username : username }}).then(
                        // if success
                        (data)=>{
                            if(data != null){
                                resolve({
                                    data: data,
                                    password: password,
                                    remember_me: remember_me
                                });
                            }else{
                                res.send(utils.rtn.error(502));
                            }
                        },
                        // if error
                        (err)=>{
                            console.log(err);
                            reject(500);
                        }
                    );
                } catch (error) {
                    console.log(error);
                    reject(500);
                }
            });
        };
        // authenticate password 
        const auth_password = (params) => {
            const data = params.data;
            const password = params.password;
            const remember_me = params.remember_me;

            return new Promise((resolve, reject) => {
                try {
                    // calculate hash
                    const _hash = crypto.createHash("md5");

                    if(password == null){
                        password = "";
                    }
                    _hash.update(
                        Buffer.concat([Buffer.from(password), utils.salt])
                    );
                    const real_hash = _hash.digest("hex");
                    if(data.hash === real_hash){
                        resolve({
                            data: data,
                            remember_me: remember_me
                        });
                    }else{
                        reject(504);
                    }   
                } catch (error) {
                    console.error(error);
                    reject(500);
                }
                
            });
            
        };
        // write token (is auth success);
        const write_token = (params) => {   
            const user_data = params.data;
            const remember_me = params.remember_me;

            const _make_token = (blocks)=>{
                let text = "";
                let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
                for( var i=0; i < blocks; i++ )
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                return text;
            }
            const token = _make_token(32);

            try {
                Token.create({
                    token: token,
                    uid: user_data.id, // uid
                    last_login: new Date()
                }).then(
                    ()=>{
                        if(remember_me){
                            res.cookie("session_token", token, {
                                maxAge: 24*10*3600*1000 // 10 days
                            });
                        }else{
                            res.cookie("session_token", token, {
                                expires: null
                            });
                        }
                        res.send(utils.rtn.success(200));
                    },
                    (err)=>{
                        console.error(err);
                        res.send(utils.rtn.error(500));
                    }
                );               
            } catch (error) {
                console.error(error);
                res.send(utils.rtn.error(500));
            }

        };

        const end_error = (error) => {
            res.send(utils.rtn.error(error));
        };

        const username = req.body.username;
        const passwd = req.body.password;
        const remember_me = req.body.remember_me;
        // action
        query_username(username, passwd, remember_me)
            .then(auth_password, end_error)
            .then(write_token, end_error);
    },

    // logout and redirect to login page
    log_out: (req, res, next) => {
        res.clearCookie("session_token");
        res.redirect("/login");
    }
}