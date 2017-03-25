const error_code = {
    403: "Not authenticated.",
    404: "Not found.",
    500: "Fatal Error."
};

module.exports = {
    success: (info, code=200)=>{
        let rtn = {
            status: "success",
            code: code,
            info: info
        };
        return JSON.stringify(rtn); 
    },

    error: (code, info=null)=>{
        if(info === null){
            _info = error_code[code];
        }else{
            _info = info;
        }
        let rtn = {
            status: "error",
            code: code,
            info: _info
        };
        return JSON.stringify(rtn); 
    }
}