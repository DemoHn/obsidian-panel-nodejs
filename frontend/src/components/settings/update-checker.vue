<template lang="html">
    <div class="wrap">
        <div><span class="lb">当前版本：</span> <span class="version">{{ "v"+ current_version }}</span></div>
        <div v-if="check_status == 0">
            <span class="des" v-if="upload_status == 0">点击以上传新版本之压缩包</span>
            <span class="des" v-if="upload_status == 1">上传中 ({{ upload_progress + "%" }})</span>
            <span class="des des-error" v-if="upload_status == -1">校验失败，请重新上传！</span>
            <span class="des des-error" v-if="upload_status == -2">压缩包对应面板版本过低，无法安装！</span>
            <span class="des des-error" v-if="upload_status == -3">面板版本过低，无法安装！</span>
            <span class="des des-error" v-if="upload_status == -4">未知错误，请重新上传！</span>
            <vue-file-upload
                    ref="vueFileUploader"
                    url="/super_admin/settings/upload_upgrade_package"
                    name="files"
                    label="选择文件"
                    :filters = "filters"
                    :events = 'cbEvents'
                    @onAdd = "onAddItem"
                    ></vue-file-upload>
        </div>
        <div v-if="check_status == 1">
            <span class="lb">更新至：</span><span class="version">{{ "v" + update_version }}</span><br>
            <span class="lb">发行日期：</span><span class="version">{{ release_date }}</span><br>
            <span class="lb">是否更新？</span>
            <button class="btn btn-primary btn-sm" @click="execute_update">确定</button>&nbsp;&nbsp;
            <button class="btn btn-secondary btn-sm" @click="cancel_update">取消</button>
        </div>
        <div v-if="check_status == 2">
            <div v-if="upgrade_status == 0"><span class='lb-gray'>更新面板中...</span> <span>{{ count_down }}</span></div>
            <div v-if="upgrade_status == 1"><span class='lb-gray'>更新已完成，即将重新登录！</span> </div>
        </div>
    </div>
</template>

<script>
/*
    check_status = 0 -> uploading bundle
                 = 1 -> confirm upgrade
                 = 2 -> upgrading and jumping
*/
    import WebSocket from "../../lib/websocket.js"
    import VueFileUpload from 'vue-file-upload';

    let ws = new WebSocket();
    export default {
        name : 'update-checker',
        components:{
            'vue-file-upload': VueFileUpload
        },
        data(){
            let v = this;
            let rtn = {
                current_version : "",
                check_status : 0,
                upload_status : 0,
                upload_progress: 0.0,
                // check_status -> 0
                filters:[
                    {
                        name:"zipFilter",
                        fn(file){
                            var extension = file.name.slice(file.name.lastIndexOf('.') + 1);
                            if(extension === "zip"){
                                return true;
                            }else{
                                return false;
                            }
                        }
                    }
                ],
                file: null,
                cbEvents: {
                    onCompleteUpload(file,response,status,header){
                        let success = false;
                        if(status == 200 && response.code == 200){
                            success = true;
                        }
                        v._onCompeleteUpload(success, response);
                    },
                    onErrorUpload(file, response){
                        v._onErrorUpload();
                    },
                    onProgressUpload(file, progress){
                        v._onProgressUpload(progress);
                    }
                },
                // check_status -> 1
                upgrade_version: null,
                release_date: null,
                // check_status -> 2
                update_status: 0,
                count_down : 30,

                _filename: null
            }

            return rtn;
        },
        methods:{
             onAddItem(files){
                // reset other values
                this.file = files[files.length-1];

                this.upload_status = 1
                // update dropbox's height            
                this.file.upload();
            },
            // upload related method
            _onCompeleteUpload(status, response){
                let code = response.code;
                if(code == 701){
                    this.upload_status = -1;
                }else if(code == 702){
                    this.upload_status = -3;
                }else if(code == 703){
                    this.upload_status = -2; 
                }else if(code == 200){
                    this.upload_status = 0;
                    // write down version info data
                    this.update_version = response.info.version;
                    this.release_date = response.info.release_date;
                    this._filename = response.info.filename;
                    this.check_status = 1;
                }else{
                    this.upload_status = -4;
                }
            },
            _onErrorUpload(){
                this.upload_status = -4;
            },
            _onProgressUpload(progress){
                this.upload_progress = progress;
            },

            get_current_version(){
                let v = this;
                this.aj_get_current_version((msg)=>{
                    v.current_version = msg;
                });
            },
            // update
            execute_update(){
                let v = this;
                v.check_status = 2;
                v.upgrade_status = 0;
                let _f = setInterval(()=>{
                    if(v.count_down == 0){
                        v.upgrade_status = 1;
                        v.exexute_redirect();
                        clearInterval(_f);
                    }else{
                        v.count_down -= 1;
                    }
                }, 1000);
                //TODO
                this.aj_execute_update();
            },
            cancel_update(){
                this.check_status = 0;
            },

            execute_redirect(){
                // after upgrading, it's time to upgrade 
            },
            aj_execute_update(){
                ws.ajax("GET","/super_admin/settings/execute_upgrade_script?bundle="+this._filename);
            },

            aj_get_current_version(callback){
                ws.ajax("GET","/super_admin/settings/get_current_version",(msg)=>{
                    if(typeof(callback) === "function"){
                        callback(msg);
                    }
                })
            }
        },
        mounted(){
            this.get_current_version();
            //this.check_update();
        }
    }
</script>

<style scoped>
div.wrap{
    margin-top: 1rem;
}

span.des{
    color: #666;
    margin-right: 1rem;
}

span.des-error{
    color: red !important;
}
span.lb{
    line-height: 2.5rem;
    font-size: 1.5rem;
}

span.lb-gray{
    line-height: 2.5rem;
    color: #888;
    font-size: 1.5rem;
}

div.version-info{
    padding-left: 1rem;
}

div.lb-blue{
    line-height: 2rem;
    color: navy;
    font-size: 1.3rem;
}
div.info_note{
     padding-left: 3rem;
}
a.toggle_a{
    cursor: pointer;
}
</style>
