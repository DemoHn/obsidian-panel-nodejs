<template lang="html">
    <div class="edit_model_content">
    <div class="box box-default box-solid">
        <div class="box-header with-border">
            <h4 class="box-title">1. 上传整合包</h4>
            <div class="box-tools pull-right">
                <button type="button" class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-minus"></i></button>
            </div>
              <!-- /.box-tools -->
        </div>
        <!-- /.box-header -->
        <div class="box-body" style="display: block;">
            <span class="des">整合包是一个已经拥有全部配置、插件及MOD的服务器压缩包。用家可以直接以之为模板创建服务器。
            <b>注：目前只支持zip格式的压缩包。</b>
            </span>
            <div class="form_group">
                <div class="form_label">
                    整合包：
                </div>
                <div class="form_input">
                    <input type="text" class="form-control input-file-name" readonly v-model="original_filename"/>&nbsp;&nbsp;
                    <vue-file-upload
                        ref="pkgFileUploader"
                        url="/super_admin/core/upload_integrated_package"
                        name="files"
                        label="上传"
                        :filters = "filters"
                        :events = 'cbEvents'
                        :request-options = "reqopts"
                        @onAdd = "onAddItem"
                        ></vue-file-upload>
                    </div>
                </div>
            </div>

            <div class="progress-bar-frame">
                <progress-bar :progress="progress_bar_ratio"
                        label_uploading="正在上传"
                        label_success="上传成功"
                        label_fail="上传失败"
                        :status="progress_bar_status"
                        v-if="show_progress_bar"></progress-bar>
            </div>
        </div>
    
    <div class="box box-default box-solid collapsed-box">
        <div class="box-header with-border">
            <h4 class="box-title">2. 选择核心</h4>
            <div class="box-tools pull-right">
                <button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-plus"></i></button>
            </div>
        </div>
        <div class="box-body">
            <span class="des">核心文件为用于运行服务器的可执行文件，一般以jar格式为主。用家需要选择核心文件相对于此整合包的位置。
            </span>
            <div class="form_group small-margin">
                <div>
                    <span>核心文件：</span>
                    <input type="text" class="small-input-bar" v-model="exec_jar" placeholder=""/>
                </div>
            </div>
            <tree-view 
                :treeData="bundle_view_list" 
                :rootZip="original_filename" 
                :status="bundle_view_status"
                @file_click="changeExecJar"
            ></tree-view>
        </div>
    </div>

    <div class="box box-default box-solid collapsed-box">
        <div class="box-header with-border">
            <h4 class="box-title">3. 整合包信息</h4>
            <div class="box-tools pull-right">
                <button class="btn btn-box-tool" data-widget="collapse"><i class="fa fa-plus"></i></button>
            </div>
        </div>
        <div class="box-body">
            <div class="form_group">
                <div class="form_label">
                    整合包名称：
                </div>
                <div class="form_input">
                    <input type="text" class="form-control" v-model="package_bundle_name" placeholder="此整合包之名称，默认为文件名"/>
                </div>
            </div>
            <div class="form_group">
                <div class="form_label">MC版本：</div>
                <div class="form_input">
                    <input type="text" class="form-control" v-model="minecraft_version" placeholder="此整合包对应的MC客户端版本"/>
                </div>
            </div>
            <div class="form_group">
                <div class="form_label">
                    备注：
                </div>
                <div class="form_input">
                    <textarea class="form-control" v-model="note" placeholder="对这个整合包的更详细说明"></textarea>
                </div>
            </div>
            <div class="form_group">
                <div class="form_label">名称预览：</div>
                <div class="form_input">
                    <span><i>{{package_name_preview}}</i></span>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<script>
import VueFileUpload from 'vue-file-upload';
import ProgressBar from './progress-bar.vue';
import TreeView from "./tree-view.vue";
import WebSocket from '../../lib/websocket.js';

const UPLOADING = 0;
const UPLOAD_SUCCESS = 1;
const UPLOAD_FAIL = 2;

let ws = new WebSocket();

export default{
    name: "upload-pkg",
    data(){
        let v = this;
        let rtn = {
            bundle_view_list: {},
            bundle_view_status: 0,
            // vue-file-upload variables
            file: null,
            // file filter, jar file only
            latest_stored_filename: null,
            original_filename: "",
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
            // callback functions binding
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
            // request options
            reqopts: {
                responseType:'json',
                formData: {
                    replace: null
                },
                withCredentials:false
            },
            // internal v-modal
            show_progress_bar : false,
            progress_bar_ratio : 0.0,
            progress_bar_status: UPLOADING,

            // package info
            // package_name = <package_bundle_name>-<minecraft_version>
            package_bundle_name: "",
            // minecraft version
            minecraft_version: "",

            // executable jar file
            exec_jar: "/",

            // additional note for this package
            note: ""
        }

        return rtn;
    },
    computed:{
        _enable_upload(){
            /*if(this.file_name.length > 0 && (""+this.minecraft_version).length > 0){
                return true;
            }else{
                return false;
            }*/
            return true;
        },

        package_name_preview(){
            if(this.minecraft_version != ""){
                return `${this.package_bundle_name}-${this.minecraft_version}`;
            }else{
                return `${this.package_bundle_name}`;
            }
        }   
    },
    methods:{
        onAddItem(files){
            this.file = files[files.length-1];
            this.show_progress_bar = true;

            if(this.latest_stored_filename != null)
                this.reqopts["formData"]["replace"] = this.latest_stored_filename;

            // reset other values
            this.resetForm();
            this.file.upload();
        },
        // used when showing the modal
        resetForm(){
            this.package_bundle_name = "";
            this.bundle_view_status = 0; // loading
            this.minecraft_version = "";
            this.note = "";
            this.show_progress_bar = false;
            this.progress_bar_ratio = 0.0;
            this.progress_bar_status = UPLOADING;
        },
        // upload related method
        _onCompeleteUpload(status, response){
            if(status){
                this.progress_bar_ratio = 1;
                this.progress_bar_status = UPLOAD_SUCCESS;

                this.original_filename = response.info.file_name;
                this.latest_stored_filename = response.info.path;
                // notify other components that file has finished uploading!
                // this.$emit("uploadFinish");
                this.readBundleDirectory();
            }else{
                this._enable_upload = true;
                this.progress_bar_ratio = 0.0;
                this.progress_bar_status = UPLOAD_FAIL;
            }
        },
        _onErrorUpload(){
            this._enable_upload = true;
            this.progress_bar_ratio = 0.0;
            this.progress_bar_status = UPLOAD_FAIL;
        },
        _onProgressUpload(progress){
            this.progress_bar_ratio = progress / 100;
        },

        readBundleDirectory(){
            let v = this;

            let file_name = this.latest_stored_filename;
            ws.ajax("GET", `/super_admin/core/read_bundle_directory?file=${file_name}`, (msg)=>{
                v.bundle_view_status = 1;
                try{
                    let msg_json = JSON.parse(msg);
                    v.bundle_view_list = msg_json;
                }catch(e){

                }
            },(code)=>{
                
            });
        },

        changeExecJar(exec_jar){
            this.exec_jar = exec_jar;
        }
    },
    components:{
        'vue-file-upload': VueFileUpload,
        'progress-bar' : ProgressBar,
        'tree-view': TreeView
    },
    // when everything is ready
    mounted(){
        let v = this;
        this.$watch('original_filename', (val, oldVal)=>{
            if(val !== oldVal && val != "")
                v.package_bundle_name = v.original_filename.split(".")[0];
        });
        // add callback events

    }
}
</script>

<style scoped>
span.des{
    font-size: 1.25rem;
    color: gray;
}
div.edit_model_content div.form_group{
    line-height: 2em;
    font-size: 1.5rem;
    margin-top: 1.2rem;
    margin-bottom: 1.2rem;
}

div.edit_model_content div.form_label{
    position: relative;
    float:left;
    min-width: 8rem;
    width: 25%;
}

div.edit_model_content div.form_input{
    width: 100%;
    padding-left: 25%;
}

div.error-hint{
    font-size: 1.25rem;
    text-align: right;
    color: red;
}

div.progress-bar-frame{
    padding:0 1rem;
}

input.input-file-name{
    width: 55%;
    display:inline-block;
}

i.notice-icon{
    color: cornflowerblue;
}

i.red-multiple{
    color: red;
}

i.red-multiple:before{
    content: "*"
}

input.small-input-bar{
    width: 80%;
    font-size: 1.2rem;
    padding: 0.2rem 0.5rem;
    height: 2.4rem;
    display: inline-block;
}

div.small-margin{
    margin-top: 0.25rem !important;
    margin-bottom: 0.4rem !important;
}

</style>
