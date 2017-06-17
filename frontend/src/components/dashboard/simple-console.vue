<template lang="html">
    <div>
        <div class="choose-bar">
            <!-- TODO: output encoding -->
            <!-- <span class="right-margin">输出编码</span>
            <select style="font-size: 1.1rem;" v-model="encoding"> 
                <option value="auto">自动</option>
                <option value="utf8">UTF-8</option>
                <option value="gb2312">GB2312</option>
                <option value="gbk">GBK</option>
                <option value="big5">BIG-5</option>
            </select> -->
            <!-- -->
            <span class="right-margin"></span><span class="right-margin"></span>
            <span class="right-margin">缓冲区大小</span>
            <select style="font-size: 1.1rem;" v-model="buffer_size"> 
                <option value="200">200</option>
                <option value="500">500</option>
                <option value="1000">1000</option>
                <option value="2000">2000</option>
                <option value="5000">5000</option>
            </select>
            
        </div>
        <div class="embeded-console">
            <pre class="console-pre"><code v-for="line in content_arr" :class="line['type']">{{ line["log"] }}</code></pre>
        </div>
        <div class="input_cmd_bar">
            <input type="text" class="input_cmd" v-model="command_content" @keyup.13="input_command"/>
            <div class="input_hint"><i class="ion-chevron-right"></i></div>
            <button class="btn_enter" @click="input_command">输入</button>
        </div>
    </div>
</template>

<script>
    export default {
        name:"simple-console",
        data(){
            return {
                content_arr : [],
                command_content : "",
                input_disabled : false,
                buffer_size: 2000,
                encoding: "auto"
            }
        },
        methods:{
            scroll_to_bottom(){
                let container = this.$el.querySelector("div.embeded-console");
                container.scrollTop = container.scrollHeight;
            },
            // $ref API
            init_history_log(history_log){
                this.content_arr = history_log;
                let v = this;
                this.$nextTick(()=>{
                    v.scroll_to_bottom();
                })
            },
            // $ref API
            append_log(log_data){
                    
                let log_obj = {
                    'type' : "O",
                    'log':''
                }

                // using log buffer protocol v2
                // parse log
                if(log_data[0] == "1"){
                    if(/^[0-9][0-9]{5}[IOE]/.test(log_data)){
                        let _length = parseInt(log_data.slice(1, 6));
                        let _type   = log_data[6];
                        let _log    = log_data.slice(7, 7+_length);

                        log_obj['type'] = _type;
                        log_obj['log'] = _log;
                        
                        this.content_arr.push(log_obj);
                    }
                }

                // shift out oldest line when buffer is full
                let _array_size = this.content_arr.length;
                let _buffer_size = parseInt(this.buffer_size);

                if(_array_size > _buffer_size){
                    let _shift_line_num = _array_size - _buffer_size;
                    while(_shift_line_num > 0){
                        this.content_arr.shift();
                        _shift_line_num -= 1;
                    }
                }
                let v = this;
                this.$nextTick(()=>{
                    v.scroll_to_bottom();
                })

            },
            input_command(){
                let command = this.command_content;
                if(command != null){
                    if(command.length > 0){
                        this.$emit("input", command);

                        let _log_obj = {
                            "type" : "I",
                            "log" : "⟹ " + command + "\n"
                        }

                        this.append_log(_log_obj)
                    }
                }
                //clear input
                this.command_content = "";
            }
        },
        mounted(){
        }
    }
</script>

<style scoped>
div.choose-bar{
    height: 2.5rem;
    line-height: 2.5rem;
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    padding-left: 1rem;
    padding-right: 1rem;
}

span.right-margin{
    margin-right: 1rem;
}
div.embeded-console{
    width: 100%;
    height: 25rem;
    overflow-y: auto;
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
    border-right: 1px solid #ccc;
    background-color: rgba(245,245,245, 0.8);
}

div.embeded-console pre{
    background-color: rgba(245,245,245, 0.8);
    border:none;
    border-radius: 0;
    margin: 0 !important;
    padding: 0.25rem 1rem !important;
    text-align:left;
    overflow-y: hidden;
    box-sizing: border-box;
    line-height: 1.3em;
}

code{
    font-size: 12px;
}

/* styles */
code.O{
    color: black;
}

code.E{
    color:#e50404;
}

code.I{
    color:blue;
}
div.input_cmd_bar{
    height: 3rem;
    width: 100%;
    position: relative;
}

input.input_cmd{
    position:absolute;
    display: block;
    outline: none;
    height: 100%;
    border: none;
    width: 100%;
    box-sizing: border-box;
    background-color: #fcfcfc;
    border: 1px solid #ccc;
    line-height: 2em;
    font-size: 13px;
    padding-left: 2.5rem;
    font-family: "Monaco", "Consolas", monospace;
}

div.input_hint{
    position: absolute;
    width: 20px;/*ace's width*/
    padding-right:0.3rem;
    height: 100%;
    line-height: 3rem;
    text-align: right;
    font-size: 12px;
    color: gray;
}

button.btn_enter{
    position:absolute;
    right: 0;
    outline: 0;
    border: 1px solid #aaa;
    border-radius: 5px;
    font-size: 13px;
    display: inline-block;
    height: 2.2rem;
    margin: 0.3rem;
    margin-top:0.35rem;
    background-color: transparent;
}
</style>
