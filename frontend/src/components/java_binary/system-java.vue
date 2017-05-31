<template lang="html">
    <div class="frame" style="">
        <div style="font-size: 1.6rem;"><i>添加系统Java</i></div>
        <div style="margin-top: 0.6rem;" v-if="status == 0">
            <span class="hint">检测系统java中... </span><button class="btn btn-primary btn-sm" disabled>添加</button>
        </div>
        <!-- NOT FOUND -->
        <div style="margin-top: 0.6rem;" v-if="status == 1">
            <span class="hint">未检测到系统java! </span><button class="btn btn-primary btn-sm" disabled>添加</button>
        </div>
        <!-- ERROR -->
        <div style="margin-top: 0.6rem;" v-if="status == 2">
            <span class="hint">检测出错! </span><button class="btn btn-primary btn-sm" @click="detect_system_java">重试</button>
        </div>
        <!-- CAN INSTALL -->
        <div style="margin-top: 0.6rem;" v-if="status == 3">
            <span class="hint">检测到系统java,可以安装! </span><button class="btn btn-primary btn-sm" @click="install_system_java">添加</button>
        </div>
        <!-- HAS_INSTALLED-->
        <div style="margin-top: 0.6rem;" v-if="status == 4">
            <span class="hint">系统java已安装! </span><button class="btn btn-primary btn-sm" disabled>添加</button>
        </div>
    </div>
</template>

<script>
    import WebSocket from "../../lib/websocket.js"
    const DETECTING = 0;
    const NOT_FOUND = 1;
    const DETECT_ERROR = 2;
    const CAN_INSTALL = 3;
    const HAS_INSTALLED = 4;
    export default{
        name:'system-java',
        props: {
        },
        data(){
            return {
                status: DETECTING
            }
        },
        methods:{
            detect_system_java(){
                this.status = DETECTING;
                let v = this;
                let ws = new WebSocket();
                ws.ajax("GET", "/super_admin/java/detect_system_java", (msg) => {
                    if(msg == 1){
                        v.status = HAS_INSTALLED;
                    }else if(msg == 0){
                        v.status = CAN_INSTALL;
                    }else if(msg == -1){
                        v.status = NOT_FOUND;
                    }else{
                        v.status = DETECT_ERROR;
                    }
                },(err) => {
                    v.status = DETECT_ERROR;
                });
            },

            install_system_java(){
                let ws = new WebSocket();
                let v = this;
                ws.ajax("GET", "/super_admin/java/add_system_java", (msg) => {
                    v.detect_system_java();
                },(err) => {
                    alert("安装系统java失败！");
                });
            }
        },
        mounted(){
            this.detect_system_java();
        }
    }
</script>

<style scoped>
div.frame{
    border: 1px dashed gray;
    padding: 0.5rem; 
    margin-top: 1rem;
}

span.hint{
    display: inline-block;
    margin-right: 1rem;
    line-height: 1.5;
    vertical-align: middle;
    font-size: 1.4rem;
    color: #666;
}

</style>
