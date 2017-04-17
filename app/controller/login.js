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
                        req._username = data.User.username;
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
                        req._username = data.User.username;
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

    // Check if User has permission to do operations on this inst_id.
    
    // get inst_id automatically from serveral sources:
    // 1. req.params.inst_id
    // 2. req.query.inst_id
    // [TODO] 3. req.params.inst_nickname -> [translate] to inst_id 
    // [TODO] 4. req.query.inst_nickname -> [translate] to inst_id

    // NOTICE this opeation shall be called after `check_login` (check_super_admin)
    // since it requires req._uid

    check_inst_id: (req, res, next) => {
        if(req._uid == null){
            res.error(403);
        }
        
        // get inst id
        let _inst_id = null;
        if(req.params.inst_id == null){
            if(req.query.inst_id == null){
                res.error(403);
            }else{
                _inst_id = req.query.inst_id;
            }
        }else{
            _inst_id = req.params.inst_id;
        }

        if(utils.types.likeNumber(_inst_id)){
            _inst_id = parseInt(_inst_id)
        }else{
            res.error(403);
        }

        const ServerInstance = model.get("ServerInstance");
        ServerInstance.findOne({
            where: {
                inst_id : _inst_id,
                owner_id: req._uid
            }
        }).then(
            (data) => {
                if(data == null){
                    res.error(403);
                }else{
                    req._inst_id = _inst_id;
                    next();
                }
            },
            (err) => {
                console.log(err);
                res.error(500);
            }
        )
    },

    log_in: (req, res, next) => {
        const User  = model.get("User");
        const Token = model.get("Token");

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
                    /*
                    const _hash = crypto.createHash("md5");

                    if(password == null){
                        password = "";
                    }
                    _hash.update(
                        Buffer.concat([Buffer.from(password), utils.salt])
                    );
                    const real_hash = _hash.digest("hex");*/
                    const real_hash = utils.calc_hash(password);
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