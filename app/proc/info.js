const model = require("../model");
const jschardet = require("jschardet");
const iconv = require("iconv-lite");

class MCInstanceInfo{
    constructor(owner=null, inst_id=null){
        // constants
        this.LOG_BLOCK_SIZE = 512;

        this.RAM = null;
        this.CPU = null;
        this.current_player = null;
        this.owner = owner;
        this.inst_id = inst_id;
        // access log on memory
        this.log = [];
    }
    /*reset*/
    reset(){
        this.RAM = null;
        this.current_player = null;
        this.CPU = null;
    }

    /* append log to log stack*/
    append_log(pipe, log_data){
        // pipe = 1 --> 'type' --> 'O'
        // pipe = 2 --> 'type' --> 'E'
        let _model = {
            "type" : 'O',
            'log' : log_data
        };
        if(pipe == 0)
            _model['type'] = 'I';
        else if(pipe === 1)
            _model['type'] = 'O';
        else if(pipe === 2)
            _model['type'] = 'E';

        this.log.push(_model);
    }

    format_log(pipe, log_binary, encoding){
        // log encoding
        const _supported_encodings = ["auto", "utf8", "gb2312", "gbk", "big5"];

        let _encoded_str = "";
        switch(_supported_encodings.indexOf(encoding)){
            case 0: // auto
                let detect_info = jschardet.detect(log_binary);
                
                if(detect_info.confidence > 0.8){
                    _encoded_str = iconv.decode(log_binary, detect_info.encoding);
                }else{
                    _encoded_str = iconv.decode(log_binary, 'utf8');
                }

                break;
            case 1: // utf8
                _encoded_str = iconv.decode(log_binary, 'utf8');
                break;
            case 2: // gb2312
                _encoded_str = iconv.decode(log_binary, 'GB2312');
                break;
            case 3: // gbk
                _encoded_str = iconv.decode(log_binary, 'GBK');
                break;
            default: // big5
                _encoded_str = iconv.decode(log_binary, 'Big5');
                break;
        }

        let _pad = (size, num) => {
            var s = String(num);
            while (s.length < (size || 2)) {s = "0" + s;}
            return s;
        }

        let _type;
        switch(pipe){
            case 0:
                _type = "I";break;
            case 1:
                _type = "O";break;
            case 2:
                _type = "E";break;
            default:
                _type = "O";break;
        }

        let _protocol = '1';
        let format_str = `${_protocol}${_pad(5, _encoded_str.length)}${_type}${_encoded_str}`;
        return format_str;
    }

    /* set xxx */
    set_RAM(RAM){
        this.RAM = RAM;
    }

    set_CPU(CPU){
        this.CPU = CPU;
    }
    
    set_current_player(current_player){
        this.current_player = current_player;
    }

    incr_current_player(current_player){
        if(this.current_player == null)
            this.current_player = 0;

        this.current_player += 1;        
    }

    decr_current_player(current_player){
        if(this.current_player == null)
            this.current_player = 1;

        this.current_player -= 1;
    }
    /* get xxx */
    get_RAM(){
        return this.RAM;
    }
    
    get_CPU(){
        return this.CPU;
    }
    
    get_current_player(){
        return this.current_player;
    }

    get_owner(){
        return this.owner;
    }

    get_log(){
        return this.log;
    }

    _store_log_to_db(){
        
    }

    _read_log_from_db(){

    }
}

module.exports = MCInstanceInfo;