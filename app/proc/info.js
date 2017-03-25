class MCInstanceInfo{
    constructor(owner=null, inst_id=null){
        this.RAM = null;
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
    /* set xxx */
    set_RAM(RAM){
        this.RAM = RAM;
    }

    set_current_player(current_player){
        this.current_player = current_player;
    }

    incr_current_player(current_player){
        if(this.current_player == null){
            this.current_player = 0;
        }else{
            this.current_player += 1;
        }
    }

    decr_current_player(current_player){
        if(this.current_player == null){
            this.current_player = 0;
        }else{
            this.current_player += 1;
        }
    }
    /* get xxx */
    get_RAM(){
        return this.RAM;
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
}

module.exports = MCInstanceInfo;