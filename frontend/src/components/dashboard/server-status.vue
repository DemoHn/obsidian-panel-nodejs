<template lang="html">
    <div>
        <div class="frame-c" v-show="loading_status == 5"><c-loading></c-loading></div>
        <div class="frame-c" v-show="loading_status == 7"><c-error></c-error></div>
        <div v-show="loading_status == 6" class="frame">
            <!-- title -->
            <table class="full-width" style="height: 2rem;">
                <tr>
                    <td><div class="pg-title" style="color: #27b427;">运行状态</div></td>
                    <td><div class="pg-title" style="color: blue;">在线用户</div></td>
                    <td><div class="pg-title" style="color: #ff4f38;">RAM</div></td>
                    <td><div class="pg-title" style="color: #ff4f38;">CPU</div></td>
                </tr>
            </table>
            <!-- content -->
            <canvas id="canvas" ref="c" ></canvas>
            <!-- text info -->
            <table class="full-width" style="height: 3rem;">
                <tr>
                    <td>
                        <div class="pg-info">
                            <!-- status text-->
                            <span v-if="work_status == 0">未 启 动</span>
                            <span v-if="work_status == 1">启 动 中</span>
                            <span v-if="work_status == 2">运 行 中</span>
                        </div>
                    </td>
                    <td>
                        <div class="pg-info">
                            <span class="hint-text">在线人数： </span><span class="em_2_text">{{ current_player }}</span>
                        </div>

                        <div class="pg-info">
                            <span class="hint-text">最大容量： </span><span class="em_2_text">{{ total_player }}</span>
                        </div>
                    </td>
                    <td>
                        <div class="pg-info">
                            <span class="hint-text">已用内存： </span><span>{{ current_RAM }}</span>&nbsp;<span>G</span>
                        </div>

                        <div class="pg-info">
                            <span class="hint-text">最大内存： </span><span>{{ max_RAM }}</span>&nbsp;<span>G</span>
                        </div>
                    </td>
                    <td>
                        <div class="pg-info">
                            <span class="hint-text">CPU使用率： </span><span>{{ cpu_100 }}</span>&nbsp;<span>%</span>
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    </div>
</template>

<script>
const LOADING = 5;
const LOAD_SUCCESS = 6;
const LOAD_ERROR = 7;
const HALT = 0;
const STARTING = 1;
const RUNNING = 2;

import Loading from "../../components/c-loading.vue";
import LoadingError from "../../components/c-error.vue";
import WebSocket from "../../lib/websocket";
import SevenSegment from "../../lib/seven-segment.js";

let ws = new WebSocket();
let vm = {
    components:{
        'c-loading' : Loading,
        'c-error': LoadingError
    },
    name: "server-status",
    data(){
        return {
            work_status: null,
            current_player: null,
            total_player: null,
            current_RAM: null,
            max_RAM: null,
            RAM_percent: null,
            CPU_percent: null,
            loading_status : LOAD_SUCCESS,

            _canvas: null,
            _current_animation_flag: null,
            _canvas_width : null
        }
    },
    watch:{
        work_status(val, old_val){
            this._set_status(val);

            if(old_val != null){
                if(val == HALT || val == STARTING){
                    this.current_player = "--";
                    this.current_RAM = "--";
                    this.CPU_percent = "--";
                }else if(val == RUNNING && old_val == STARTING){
                    this.current_player = 0;
                    this.current_RAM = 0;
                    this.CPU_percent = 0;
                }
            }            
        },

        current_player(val){
            this._set_online_player(val);
        },

        current_RAM(val){
            this._set_RAM(val);
        },

        CPU_percent(val){
            this._set_CPU(val);
        }
    },

    computed:{
        cpu_100(){
            let _cpu;
            try{
                _cpu = parseFloat(this.CPU_percent);
            }catch(e){
                return "--"; // no data
            }
            if(isNaN(_cpu)){
                return "--";
            }else{
                return Math.round(_cpu * 100);
            }
        }
    },
    methods:{
        // retrieve data from list
        // val = msg.val

        // $ref API
        set_status(status){
            if(status == STARTING || status == RUNNING){
                this.work_status = status;
            }else{
                this.work_status = HALT;
            }
            // _set_status(); <-- this function will be triggered when variable changed.
        },

        // $ref API
        set_online_player(player){
            this.current_player = player;
        },

        // $ ref API
        set_RAM(RAM){
            RAM = String(RAM);

            if(RAM.indexOf("-") >= 0){
                this.current_RAM = RAM;
            }else{
                this.current_RAM = parseFloat(RAM).toFixed(2);
            }
        },

        set_CPU(CPU){
            CPU = String(CPU);
            if(CPU.indexOf("-") >= 0){
                this.CPU_percent = CPU;
            }else{
                this.CPU_percent = parseFloat(CPU).toFixed(2);
            }
        },

        // status: "loading"
        set_loading_status(is_loading){
            if(is_loading){
                this.loading_status = LOADING;
            }else{
                this.loading_status = LOAD_SUCCESS;
            }
        },

        // $ref API
        init_status_list(val){
            this.loading_status = LOAD_SUCCESS;
            //$watch function will help us do some update work
            
            if(val.current_player != -1){
                this.set_online_player(val.current_player);
            }else{
                this.set_online_player("--");
            }

            if(val.total_player != -1){
                this.total_player = val.total_player;
            }

            if(val.total_RAM != -1){
                this.max_RAM = val.total_RAM;
            }

            if(val.RAM != -1){
                this.set_RAM(val.RAM);
            }else{
                this.set_RAM("--");
            }

            if(val.CPU != -1){
                this.set_CPU(val.CPU);
            }else{
                this.set_CPU("--");
            }

            this.work_status = val.status;
        },

        _redraw_canvas(){
            this._canvas.width = this._canvas.offsetWidth;
            this._canvas.height = this._canvas.offsetHeight;
            // flush
            this._flush_canvas_part(1);
            this._flush_canvas_part(2);
            this._flush_canvas_part(3);
            this._flush_canvas_part(4);

            // draw
            this._set_status(this.work_status);
            this._set_online_player(this.current_player);
            this._set_RAM(this.current_RAM);
            this._set_CPU(this.CPU_percent);
        },

        _flush_canvas_part(part_num){
            const canvas = this._canvas;
            const _width = canvas.width / 4,
                  _height = canvas.height,
                  _part_index = parseInt(part_num) - 1;
            
            const ctx = canvas.getContext('2d');
            ctx.clearRect(_part_index * _width, 0, (_part_index + 1) * _width, _height);

            return [_width, _height, _part_index * _width]; // [<width>, <height>, <start_x>]
        },

        _draw_arc(center_x, center_y, radius, color, angle, line_width = 10, bg_color = "#efefef", start_angle = 90){ // angle: 0-360deg

            const context = this._canvas.getContext('2d'); 

            // draw bg_arc
            context.beginPath();
            context.arc(center_x, center_y, radius, 1.5*Math.PI, 3.5 * Math.PI, false);
            context.lineWidth = line_width;

            // line color
            context.strokeStyle = bg_color;
            context.stroke();

            // draw value arc
            context.beginPath();
            context.arc(center_x, center_y, radius, (start_angle + 180) / 180 * Math.PI, (angle +start_angle + 180)/180 * Math.PI, false);
            context.lineWidth = line_width;

            // line color
            context.strokeStyle = color;
            context.stroke();
        },

        _draw_percent(start_x, start_y, color = "#333"){
            const canvas = this._canvas;
            const ctx = canvas.getContext("2d");

            ctx.fillStyle = color;
            ctx.lineWidth = 1;
                        
            ctx.font = "14px Arial";
            ctx.fillText("%", start_x, start_y);
        },

        // index = 0 ==> online players, index = 1 ==> RAM usages
        _update_graph(index, value, ratio){
            let _v;
            let seg_config = {
                HW_ratio : 2.1,
                // about stroke
                stroke_width: 3.5,
                stroke_gap: 0.8,

                // digit
                digit_width: 16.0,
                digit_gap: 2.0,

                // color
                color: "blue",
                background_color: "#fafafa"
            };

            value = String(value);
            ratio = String(ratio);

            let v = this;

            switch(index){
                case 0:
                    break;
                case 1: // update current user
                    
                    let update_graph_1 = () => {
                        let coor_arr = v._flush_canvas_part(2);
                        let start_x = coor_arr[2],
                            _height = coor_arr[1],
                            _width  = coor_arr[0];
                        
                        let angle = 0;
                        let _radius = _width > _height ? _height/2-18 : _width/2-18;

                        if(ratio !== null && /\-/.test(ratio) === false){
                            angle = parseFloat(ratio) * 360;
                        }
                        let   _center_x = start_x + _width / 2,
                            _center_y = _height / 2;
                        v._draw_arc(_center_x, _center_y, _radius, "#0011FF", angle, 8, "#fafafa");

                        // draw digit
                        seg_config["color"] = "#0011FF";
                        let seg = new SevenSegment(v._canvas, _center_x, _center_y, seg_config);
                        seg.draw_digits(value); // to ensure value is a string
                    };
                    update_graph_1();
                    break;
                case 2:
                    let update_graph_2 = () => {
                        let coor_arr = v._flush_canvas_part(3),
                             start_x = coor_arr[2],
                             _height = coor_arr[1],
                             _width  = coor_arr[0];
                        
                        let angle = 0;
                        let _radius = _width > _height ? _height/2-18 : _width/2-18;

                        if(ratio !== null && ratio.indexOf("-") < 0){
                            angle = parseFloat(ratio) * 360;
                        }

                        let _center_x = start_x + _width / 2,
                            _center_y = _height / 2;
                        v._draw_arc(_center_x, _center_y, _radius, "red", angle, 8, "#fafafa");

                        // draw digit
                        seg_config["color"] = "red";
                        let seg = new SevenSegment(v._canvas, _center_x - 2, _center_y, seg_config);
                        let _v;
                        if(value.indexOf("-") < 0){
                            _v = Math.round(parseFloat(value) * 100) + "";
                        }else{
                            _v = value;
                        }
                        let [_end_w, _h] = seg.draw_digits(_v); // to ensure value is a string
                        this._draw_percent(_end_w + 3, _center_y + _h/2);
                    }
                    update_graph_2();
                    break;
                case 3:
                    let update_graph_3 = () => {
                        let coor_arr = v._flush_canvas_part(4),
                             start_x = coor_arr[2],
                             _height = coor_arr[1],
                             _width  = coor_arr[0];
                        
                        let angle = 0;
                        let _radius = _width > _height ? _height/2-18 : _width/2-18;

                        if(ratio !== null && ratio.indexOf("-") < 0){
                            angle = parseFloat(ratio) * 360;
                        }

                        let _center_x = start_x + _width / 2,
                            _center_y = _height / 2;
                        v._draw_arc(_center_x, _center_y, _radius, "green", angle, 8, "#fafafa");

                        // draw digit
                        seg_config["color"] = "green";
                        let seg = new SevenSegment(v._canvas, _center_x - 2, _center_y, seg_config);
                        let _v;
                        if(value.indexOf("-") < 0){
                            _v = Math.round(parseFloat(value) * 100) + "";
                        }else{
                            _v = value;
                        }
                        let [_end_w, _h] = seg.draw_digits(_v); // to ensure value is a string
                        //console.log(_end_w, _h)
                        this._draw_percent(_end_w + 3, _center_y + _h * 0.5);

                    }
                    update_graph_3();
                    break;
                default:
                    break;
            }
        },

        _UI_animation(work_status){
            let v = this;
            let ctx = this._canvas.getContext("2d");

            // stroke width
            ctx.stroke_width = 1;
            // clear animation flag to make sure it is working
            if(this._current_animation_flag != null)
                clearInterval(this._current_animation_flag);
            
            let coor_arr = this._flush_canvas_part(1);
            let start_x = coor_arr[2],
                _height = coor_arr[1],
                _width  = coor_arr[0];
            
            switch (work_status){
                case 0:
                    let status_0 = () => {
                        let _state = "START"; // or "CIRCLE" or "LINE" or "END"
                        let _ratio = 0;

                        let _radius = _width > _height ? _height/2-18 : _width/2-18;

                        this._current_animation_flag = setInterval(() => {
                            // flush the canvas to get a better circle
                            if(_state != "END")
                                this._flush_canvas_part(1);

                            if(_state === "START"){
                                _state = "CIRCLE";
                                _ratio = 0.0;
                            }else if(_state === "CIRCLE"){
                                _ratio += 0.02;
                                
                                v._draw_arc(start_x + _width / 2, _height / 2, _radius, "#27b427", _ratio * 360, 1, "transparent");
                                if(_ratio >= 1){
                                    _state = "LINE";
                                    _ratio = 0;
                                }
                            }else if(_state === "LINE"){
                                // don't forget the original circles
                                v._draw_arc(start_x + _width / 2, _height / 2, _radius, "#27b427", 360, 1, "transparent");

                                _ratio += 0.08;

                                let circle_width = _radius;
                                ctx.strokeStyle = "#27b427";
                                ctx.beginPath();
                                ctx.moveTo(start_x + _width / 2 - circle_width/2, _height / 2);
                                ctx.lineTo(start_x + _width / 2 - circle_width/2 + circle_width * _ratio , _height / 2);
                                ctx.stroke();
                                if(_ratio >= 1)
                                    _state = "END";
                            }else if(_state === "END"){
                                clearInterval(this._current_animation_flag);
                            }
                        },20);
                    };
                    status_0();
                    break;
                case 1:
                    let status_1 = () => {
                        let _state = "START"; // or "CIRCLE" or "FLUSH_CIRCLE" or "END"
                        let _ratio = 0;
                        let _wait_count = 20;
                        let _radius = _width > _height ? _height/2-18 : _width/2-18;

                        this._current_animation_flag = setInterval(() => {
                            // flush the canvas to get a better circle

                            if(_state === "START"){
                                _state = "CIRCLE";
                                _ratio = 0.0;
                            }else if(_state === "CIRCLE"){
                                if(_ratio >= 1){
                                    _state = "FLUSH_CIRCLE_WAIT";
                                    _ratio = 0;
                                }else{
                                    this._flush_canvas_part(1);
                                }
                                _ratio += 0.02;
                                v._draw_arc(start_x + _width / 2, _height / 2, _radius, "#27b427", _ratio * 360, 1, "transparent");
                                //small circles
                                v._draw_arc(start_x + _width / 2 - _radius*0.6, _height / 2, _radius / 5, "#27b427", _ratio * 360, 1, "transparent");
                                v._draw_arc(start_x + _width / 2, _height / 2, _radius / 5, "#27b427", _ratio * 360, 1, "transparent");
                                v._draw_arc(start_x + _width / 2 + _radius*0.6, _height / 2, _radius / 5, "#27b427", _ratio * 360, 1, "transparent");
                                
                            }else if(_state === "FLUSH_CIRCLE_WAIT"){
                                if(_wait_count <= 0){
                                    _wait_count = 20;
                                    _state = "FLUSH_CIRCLE";
                                }
                                _wait_count -= 1;
                            }else if(_state === "FLUSH_CIRCLE"){
                                _ratio += 0.02;   
                                v._draw_arc(start_x + _width / 2, _height / 2, _radius, "white", _ratio * 360, 2, "transparent");
                                //small circles
                                v._draw_arc(start_x + _width / 2 - _radius*0.6, _height / 2, _radius / 5, "white", _ratio * 360, 2, "transparent");
                                v._draw_arc(start_x + _width / 2, _height / 2, _radius / 5, "white", _ratio * 360, 2, "transparent");
                                v._draw_arc(start_x + _width / 2 + _radius*0.6, _height / 2, _radius / 5, "white", _ratio * 360, 2, "transparent");
                                if(_ratio >= 1){
                                    _state = "CIRCLE";
                                    _ratio = 0;
                                }
                            }
                        },20);
                    };
                    status_1();
                    break;
                case 2:
                    let status_2 = () => {
                        let _state = "START"; // or "CIRCLE" or "LINE_A" or "LINE_B" or "END"
                        let _ratio = 0;

                        let _radius = _width > _height ? _height/2-18 : _width/2-18;

                        this._current_animation_flag = setInterval(() => {
                            // flush the canvas to get a better circle
                            if(_state == "CIRCLE")
                                this._flush_canvas_part(1);

                            if(_state === "START"){
                                _state = "CIRCLE";
                                _ratio = 0.0;
                            }else if(_state === "CIRCLE"){
                                _ratio += 0.035;
                                
                                v._draw_arc(start_x + _width / 2, _height / 2, _radius, "#27b427", _ratio * 270, 1, "transparent", 180);
                                if(_ratio >= 1){
                                    _state = "LINE_A";
                                    _ratio = 0;
                                }
                            }else if(_state === "LINE_A"){
                                _ratio += 0.2;

                                let circle_width = _radius;
                                ctx.strokeStyle = "#27b427";
                                ctx.beginPath();
                                ctx.moveTo(start_x + _width / 2 - circle_width/2, _height / 2);
                                ctx.lineTo(start_x + _width / 2 - circle_width/2 + circle_width/2 * _ratio , _height / 2 + circle_width/2 * _ratio);
                                ctx.stroke();
                                if(_ratio >= 1){
                                    _state = "LINE_B";
                                    _ratio = 0;
                                }
                            }else if(_state === "LINE_B"){
                                _ratio += 0.12;
                                let circle_width = _radius;
                                ctx.strokeStyle = "#27b427";
                                ctx.beginPath();
                                ctx.moveTo(start_x + _width / 2, _height / 2 + circle_width / 2);
                                ctx.lineTo(start_x + _width / 2 + circle_width * _ratio , _height / 2 + circle_width/2 - circle_width * _ratio);
                                ctx.stroke();

                                if(_ratio >= 1){
                                    _state = "END";
                                    _ratio = 0;
                                }
                            }else if(_state === "END"){
                                clearInterval(this._current_animation_flag);
                            }
                        },20);
                    };
                    status_2();
                    break;
                default:
                    break;
            }
        },

        // update variable
        _set_status(status){
            this._UI_animation(status);
        },

        _set_RAM(RAM){
            RAM = String(RAM);
            if(RAM.indexOf("-") >= 0){ 
                this._update_graph(2, RAM, 0);
            }else if(Number.isInteger(this.max_RAM)){
                let ratio = (parseFloat(RAM) / this.max_RAM);
                this.RAM_percent = (ratio*100).toFixed(0);
                this._update_graph(2, ratio, ratio);               
            }else{
                this._update_graph(2, 0, 0);                
            }
        },

        _set_CPU(CPU){
            CPU = String(CPU);
            if(CPU.indexOf("-") >= 0){
                this._update_graph(3, CPU, 0);
            }else{
                this._update_graph(3, CPU, CPU); 
            }
        },

        _set_online_player(player){
            let _ratio = (player / this.total_player);
            
            this._update_graph(1, player, _ratio);
        }
    },
    mounted(){
        const canvas = this.$refs.c;
        this._canvas = canvas;
        // init size
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        // resize canvas when window.onresize triggers
        this.$nextTick(function() {
            window.addEventListener('resize', this._redraw_canvas);
        });
    },

    beforeDestroy(){
        window.removeEventListener('resize', this._redraw_canvas);
    }
}
export default vm;
</script>

<style>
table.full-width{
    width: 100%;
    table-layout: fixed;
}

table.full-width > tr > td{
    vertical-align:middle;
    text-align: center;
    width: 2%;
}

div.frame-c{
    height: 16rem;
}

div.frame{
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
}

canvas#canvas{
    height: 120px;
    width: 100%;
}

div.central-number{
    font-size:18px;
    position: absolute;
    line-height: 25px;
    text-align: center;
}

span.em_2_text{
    width: 2em;
    display: inline-block;
}

div.pg-info span.hint-text{
    color:gray;
    font-size: 13px;
    margin-top: 0;
}
</style>
