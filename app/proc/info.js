const model = require("../model");

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

    format_log(pipe, log_binary){
        if(Buffer.isBuffer(log_binary)){
            // protocol v1
            const _header_length = 7;
            let _len = log_binary.length;

            if(_len > 65535 - _header_length){
                _len = 65535 - _header_length; // max length of raw content
            }
            const buf = Buffer.allocUnsafe(_header_length + _len);

            buf.writeUInt16BE(_len + _header_length, 0); // BUF_LENGTH
            buf.writeUInt8(0x01, 2); // protocol ID
            buf.writeUInt8(0x01, 3); // protocol Version. Current: 0x01
            buf.writeUInt16BE(this.inst_id, 4);
            buf.writeUInt8(pipe, 6);

            log_binary.copy(buf, _header_length, 0, _len - 1); // copy log string to dest
            return buf;

        }else{
            console.log("[LOG] log format is not binary!");
            return null;
        }
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