<template lang="html">
    <section class="content">
        <div class="row">
            <div class="col-md-6 col-lg-6">
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">核心文件管理</h3>
                        <div class="box-tools pull-right">
                            <button class="btn btn-box-tool" type="button" data-widget="collapse">
                                <i class="fa fa-minus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="box-body">
                        <div v-if="status == 2">
                            <load-error></load-error>
                        </div>
                        <div v-if="status == 0">
                            <c-loading></c-loading>
                        </div>
                        <div v-if="status == 1">
                            <div v-if="core_list.length == 0">
                                <div class="core_nothing">这里空空如也 <br /> 点击下面的「添加」按钮以添加核心</div>
                            </div>
                            <div class="core_list" v-for="(core_item,_index) in core_list">
                                <div class="edit-button">
                                    <a title="" data-placement="left" data-toggle="tooltip"  data-original-title="编辑" @click="edit_serv_core(_index)"><i class="ion-edit"></i></a>
                                    <a title="" data-placement="left" data-toggle="tooltip" data-original-title="删除" @click="delete_serv_core(_index)"><i class="ion-close-round"></i></a>

                                </div>
                                <div class="server_core_avatar">
                                    <img v-if="core_item.core_type=='vanilla'" class="proj_avatar" src="/static/img/minecraft.png"/>
                                    <img v-else-if="core_item.core_type=='spigot'" class="proj_avatar" src="/static/img/spigot.png"/>
                                    <img v-else-if="core_item.core_type=='torch'" class="proj_avatar" src="/static/img/torch.png"/>
                                    <img v-else-if="core_item.core_type=='bukkit'" class="proj_avatar" src="/static/img/bukkit.png"/>
                                    <div class="no-pic" v-else>暂无预览</div>
                                </div>

                                <div class="server_core_info">
                                    <div class="list_title">
                                        {{ core_item.file_name }}
                                    </div>
                                    <div class="list_row">
                                        <div class="half">
                                            <span class="ttl">类型: </span>
                                            <span class="default-text" v-if="core_item.core_type == 'other'">其他</span>
                                            <span class="text" v-else>{{ core_item.core_type }}</span>
                                        </div><div class="half">
                                            <span class="ttl">文件大小: </span>
                                            <span class="text">{{ core_item.file_size }}</span>
                                        </div>
                                    </div>
                                    <div class="list_row">
                                        <div class="half">
                                            <span class="ttl">MC版本: </span>
                                            <span class="text">{{ core_item.minecraft_version }}</span>
                                        </div><div class="half">
                                            <span class="ttl">文件版本: </span>
                                            <span class="default-text" v-if="core_item.core_version ==''">未知</span>
                                            <span class="text" v-else>{{ core_item.core_version }}</span>
                                        </div>
                                    </div>
                                    <div class="note" v-if="core_item.note === ''">
                                        (无备注)
                                    </div>
                                    <div class="note" v-else>
                                        {{ core_item.note }}
                                    </div>
                                </div>
                            </div>

                            <div class="add_button">
                                <button class="btn btn-primary btn-md" @click="add_serv_core"><i class="ion-plus-round"></i>&nbsp;&nbsp;&nbsp;添加核心</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- integrated package -->
            
            <div class="col-md-6 col-lg-6">
                <div class="box box-info">
                    <div class="box-header with-border">
                        <h3 class="box-title">整合包管理</h3>
                        <div class="box-tools pull-right">
                            <button class="btn btn-box-tool" type="button" data-widget="collapse">
                                <i class="fa fa-minus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="box-body">
                        <div v-if="int_pkg_status == 2">
                            <load-error></load-error>
                        </div>
                        <div v-if="int_pkg_status == 0">
                            <c-loading></c-loading>
                        </div>
                        <div v-if="int_pkg_status == 1">
                            <div v-if="int_pkg_list.length == 0">
                                <div class="core_nothing">这里空空如也 <br /> 点击下面的「添加」按钮以上传整合包</div>
                            </div>
                            <div class="core_list" v-for="(int_pkg_item,_index) in int_pkg_list">
                                <div class="edit-button">
                                    <a title="" data-placement="left" data-toggle="tooltip"  data-original-title="编辑" @click="edit_int_pkg(_index)"><i class="ion-edit"></i></a>
                                    <a title="" data-placement="left" data-toggle="tooltip" data-original-title="删除" @click="delete_int_pkg(_index)"><i class="ion-close-round"></i></a>
                                </div>
                                <div class="server_core_avatar">
                                    <!--<img v-if="int_pkg_item.core_type=='vanilla'" class="proj_avatar" src="/static/img/minecraft.png"/>
                                    <img v-else-if="int_pkg_item.core_type=='spigot'" class="proj_avatar" src="/static/img/spigot.png"/>
                                    <img v-else-if="int_pkg_item.core_type=='torch'" class="proj_avatar" src="/static/img/torch.png"/>
                                    <img v-else-if="int_pkg_item.core_type=='bukkit'" class="proj_avatar" src="/static/img/bukkit.png"/>
                                    <div class="no-pic" v-else>暂无图片</div>-->
                                    <div class="no-pic">暂无图片</div>
                                </div>

                                <div class="server_core_info">
                                    <div class="list_title">
                                        {{ int_pkg_item.package_name }}
                                    </div>
                                    <div class="list_row">
                                        <div>
                                            <span class="ttl">核心文件: </span>&nbsp;
                                            <span class="text">{{ int_pkg_item.exec_jar }}</span>
                                        </div>
                                    </div>
                                    <div class="list_row">
                                        <div class="half">
                                            <span class="ttl">文件大小: </span>
                                            <span class="text">{{ int_pkg_item.file_size }}</span>
                                        </div><div class="half">
                                            <span class="ttl">MC版本: </span>
                                            <span class="text">{{ int_pkg_item.minecraft_version }}</span>
                                        </div>
                                    </div>
                                    
                                    <div class="note" v-if="int_pkg_item.note === ''">
                                        (无备注)
                                    </div>
                                    <div class="note" v-else>
                                        {{ int_pkg_item.note }}
                                    </div>
                                </div>
                            </div>

                            <div class="add_button">
                                <button class="btn btn-primary btn-md" @click="add_int_pkg"><i class="ion-plus-round"></i>&nbsp;&nbsp;&nbsp;添加整合包</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- add core file-->
        <add-modal v-if="showAddModal"
                   @cancel="showAddModal = false"
                   @confirm="confirm_add"
                   :confirm_btn_disabled="!enable_upload">
            <span slot="header">添加核心</span>
            <div slot="body">
                <div>
                    <c-upload-file
                        @uploadFinish="closeAddFileModal"
                        @allowUpload="onAllowUpload"
                        ref="FileUploader"
                        ></c-upload-file>
                </div>
            </div>
            <span slot="cancel_text">取消</span>
            <span slot="confirm_text">上传</span>
        </add-modal>

        <!-- edit core file -->
        <edit-modal v-if="showEditModal" @cancel="showEditModal = false" @confirm="confirm_edit">
            <span slot="header">编辑</span>
            <div slot="body" class="edit_model_content">
                <div class="form_group">
                    <div class="form_label">
                        文件名：
                    </div>
                    <div class="form_input">
                        <input type="text" class="form-control" v-model="edit_form.file_name"/>
                    </div>
                </div>
                <div class="form_group">
                    <div class="form_label">
                        类型：
                    </div>
                    <div class="form_input">
                        <select name="" class="form-control" v-model="edit_form.core_type">
                            <option :value="'bukkit'">Bukkit</option>
                            <option :value="'spigot'">Spigot</option>
                            <option :value="'vanilla'">Vanilla</option>
                            <option :value="'forge'">Forge</option>
                            <option :value="'mcpc'">MCPC+</option>
                            <option :value="'kcauldron'">KCauldron</option>
                            <option :value="'thermos'">Thermos</option>
                            <option :value="'torch'">Torch</option>
                            <option :value="'other'">其他</option>
                        </select>
                    </div>
                </div>
                <div class="form_group">
                    <div class="form_label">MC版本：</div>
                    <div class="form_input">
                        <input type="text" class="form-control" v-model="edit_form.minecraft_version"/>
                    </div>
                </div>
                <div class="form_group">
                    <div class="form_label">
                        文件版本：
                    </div>
                    <div class="form_input">
                        <input type="text" class="form-control" v-model="edit_form.core_version"/>
                    </div>
                </div>
                <div class="form_group">
                    <div class="form_label">
                        备注：
                    </div>
                    <div class="form_input">
                        <textarea class="form-control" v-model="edit_form.note"></textarea>
                    </div>
                </div>
                <div class="error-hint" v-show="edit_modal_error">
                    编辑失败，请重试
                </div>
            </div>
        </edit-modal>

        <!-- delete confirmation prompt -->
        <del-modal v-if="showDeleteModal" @cancel="showDeleteModal = false" @confirm="confirm_delete">
            <span slot="header">删除</span>
            <div slot="body">
                确认删除「 <b>{{ delete_file_name }}</b> 」？此操作将不可逆，及可能影响以此为核心的服务器！
                <div class="error-hint" v-show="delete_modal_error">
                    删除失败，请重试
                </div>
            </div>
        </del-modal>

        <!-- INTEGRATED PACKAGE-->
        <!-- int_pkg add modal -->
        <add-pkg-modal 
            v-if="showAddIntPkgModal" 
            @cancel="cancel_add_pkg" 
            @confirm="confirm_add_pkg"
            >
            <span slot="header">添加整合包</span>
            <div slot="body">
                <div>
                    <c-upload-pkg
                        @uploadFinish="closeAddFileModal"
                        @allowUpload="onAllowUpload"
                        ref="PackageUploader"
                        ></c-upload-pkg>
                    <span class="error" style="color:red;" v-if="AddIntPkgFailed">添加整合包失败，请重试！</span>
                </div>
            </div>
            <span slot="cancel_text">取消</span>
            <span slot="confirm_text">添加</span>
        </add-pkg-modal>

         <!-- edit package -->
        <edit-pkg-modal v-if="showEditPkgModal" @cancel="showEditPkgModal = false" @confirm="confirm_edit_pkg">
            <span slot="header">编辑</span>
            <div slot="body" class="edit_model_content">
                <div class="form_group">
                    <div class="form_label">
                        整合包名：
                    </div>
                    <div class="form_input">
                        <input type="text" class="form-control" v-model="edit_pkg_form.package_name"/>
                    </div>
                </div>
                <div class="form_group">   
                  <div class="form_label">核心文件：</div>
                    <div class="form_input">
                        <input type="text" class="form-control" v-model="edit_pkg_form.exec_jar" placeholder=""/>
                    </div>
                </div>
                <div style="font-size:1.4rem;color:#666;">请在目录下面选择一个文件：</div>
                <tree-view 
                    :treeData="edit_pkg_form.bundle_view_list" 
                    :rootZip="'/'" 
                    :status="edit_pkg_form.bundle_view_status"
                    @file_click="changeExecJar"
                ></tree-view>
                                    
                <div class="form_group">
                    <div class="form_label">MC版本：</div>
                    <div class="form_input">
                        <input type="text" class="form-control" v-model="edit_pkg_form.minecraft_version"/>
                    </div>
                </div>

                <div class="form_group">
                    <div class="form_label">
                        备注：
                    </div>
                    <div class="form_input">
                        <textarea class="form-control" v-model="edit_pkg_form.note"></textarea>
                    </div>
                </div>
                <div class="error-hint" v-show="edit_pkg_modal_error">
                    编辑失败，请重试
                </div>
            </div>
        </edit-pkg-modal>

        <!-- delete pkg modal-->
        <del-pkg-modal v-if="showDeletePkgModal" @cancel="showDeletePkgModal = false" @confirm="confirm_delete_pkg">
            <span slot="header">删除</span>
            <div slot="body">
                确认删除整合包「 <b>{{ delete_pkg_name }}</b> 」？此操作将不可逆！
                <div class="error-hint" v-show="delete_pkg_error">
                    删除失败，请重试
                </div>
            </div>
        </del-pkg-modal>
    </section>
</template>

<script>
const LOADING = 0;
const ERROR   = 2;
const SUCCESS = 1;

const TYPE_UPLOAD = 16;
const TYPE_FROM_SOURCE = 32;
import WebSocket from "../../lib/websocket.js"
import Loading from '../../components/c-loading.vue';
import LoadError from '../../components/c-error.vue';
import TreeView from '../../components/server_core/tree-view.vue';
import cModal from '../../components/c-modal.vue';
import UploadFile from '../../components/server_core/upload-file.vue';
import UploadPkg from '../../components/server_core/upload-pkg.vue';
export default {
    components: {
        'c-loading': Loading,
        'load-error': LoadError,
        'edit-modal': cModal,
        'edit-pkg-modal': cModal,
        'del-modal': cModal,
        'del-pkg-modal': cModal,
        'add-modal': cModal,
        'add-pkg-modal': cModal,
        'c-upload-file' : UploadFile,
        'c-upload-pkg': UploadPkg,
        'tree-view': TreeView
    },
    name : "ServerCore",
    data(){
        return {
            core_list : [],
            int_pkg_list: [],
            status: LOADING,
            // 整合包 Integrated Package
            int_pkg_status: LOADING,
            edit_form:{
                file_name: "",
                core_type: 'vanilla',
                minecraft_version: "",
                core_version: "",
                note: ""
            },
            edit_pkg_form:{
                package_name: "",                
                minecraft_version: "",
                exec_jar: "",
                note: "",

                // tree-view
                bundle_view_list: {},
                bundle_view_status: 0
            },
            showEditModal : false,
            _edit_index: null,
            edit_modal_error: false,
            // delete modal
            showDeleteModal: false,
            _delete_index: null,
            delete_file_name: null,
            delete_modal_error: false,

            // add modal
            showAddModal: false,
            add_core_type: TYPE_UPLOAD,
            enable_upload: false,
            /* integrated package */
            // add pkg modal
            showAddIntPkgModal: false,
            enable_int_pkg_upload: false,
            AddIntPkgFailed: false,

            // edit pkg modal
            showEditPkgModal : false,
            _edit_pkg_index: null,
            edit_pkg_modal_error: false,

            // delete pkg modal
            showDeletePkgModal: false,
            _delete_pkg_index: null,
            delete_pkg_name: null,
            delete_pkg_error: false
        }
    },
    methods: {
        // fetch data from remote
        aj_load_core_list(){
            let ws = new WebSocket();
            ws.ajax("GET",'/super_admin/core/get_core_file_info', this.init_core_list, this.on_load_error);
        },

        aj_load_int_pkg_list(){
            let ws = new WebSocket();
            ws.ajax("GET",'/super_admin/core/get_int_pkg_info', this.init_int_pkg_list, this.on_load_int_pkg_error);
        },
        // click methods
        edit_serv_core(index){
            this.edit_form["file_name"] = this.core_list[index]["file_name"];
            this.edit_form["core_type"] = this.core_list[index]["core_type"];
            this.edit_form["minecraft_version"] = this.core_list[index]["minecraft_version"];
            this.edit_form["core_version"] = this.core_list[index]["core_version"];
            this.edit_form["note"] = this.core_list[index]["note"];
            // init modal params
            this.showEditModal = true;
            this._edit_index = index;
            this.edit_modal_error = false;
        },

        // on confirm
        confirm_edit(){
            const ajax_data = {
                "file_name" : this.edit_form.file_name,
                "file_version" : this.edit_form.core_version,
                "description" : this.edit_form.note,
                "core_type" : this.edit_form.core_type,
                "mc_version" : this.edit_form.minecraft_version
            }
            let ws = new WebSocket();
            let _index = this._edit_index;
            let core_file_id = this.core_list[_index]["core_id"];
            let v = this;
            ws.ajax("POST", "/super_admin/core/edit_core_file_params/"+core_file_id, ajax_data, (msg)=>{
                for(let key in v.edit_form)
                    v.core_list[_index][key] = v.edit_form[key];
                v.showEditModal = false;
                v.edit_modal_error = false;
            },(code)=>{
                v.edit_modal_error = true;
            })
        },

        delete_serv_core(index){
            this.showDeleteModal = true;
            this._delete_index = index;
            this.delete_modal_error = false;
            this.delete_file_name = this.core_list[index]["file_name"];
        },

        confirm_delete(){
            let ws = new WebSocket();
            let _index = this._delete_index;
            let core_file_id = this.core_list[_index]["core_id"];
            let v = this;

            ws.ajax("GET", "/super_admin/core/delete_core_file/"+core_file_id, (msg)=>{
                // on success
                v.showDeleteModal = false;
                v.core_list.splice(_index, 1);
                v.delete_modal_error = false;
            },(code)=>{
                // on error
                v.delete_modal_error = true;
            })
        },

        // add modal
        add_serv_core(){
            this.showAddModal = true;
        },
        onAllowUpload(value){
            this.enable_upload = value;
        },
        confirm_add(){
            this.$refs.FileUploader.uploadItem();
        },
        // triggered after file finish
        closeAddFileModal(){
            this.aj_load_core_list();
            this.showAddModal = false;
        },
        // init list (cores & integrated packages)
        init_core_list(data){
            this.status = SUCCESS;
            this.core_list = data;
        },

        init_int_pkg_list(data){
            this.int_pkg_status = SUCCESS;
            this.int_pkg_list = data;
        },

        on_load_error(data){
            this.status = ERROR;
        },

        on_load_int_pkg_error(data){
            this.status = ERROR;
        },

        // add int_pkg modal
        add_int_pkg(){
            this.showAddIntPkgModal = true;
        },

        // click methods
        edit_int_pkg(index){
            let ws = new WebSocket();
            this.edit_pkg_form["package_name"] = this.int_pkg_list[index]["package_name"];
            this.edit_pkg_form["exec_jar"] = this.int_pkg_list[index]["exec_jar"];
            this.edit_pkg_form["minecraft_version"] = this.int_pkg_list[index]["minecraft_version"];
            this.edit_pkg_form["note"] = this.int_pkg_list[index]["note"];
            // init modal params
            this.showEditPkgModal = true;
            this._edit_pkg_index = index;
            this.edit_pkg_modal_error = false;
            
            let pkg_id = this.int_pkg_list[index]["pkg_id"];
            let v = this;
            ws.ajax("GET", "/super_admin/core/read_bundle_directory_by_package_id/"+pkg_id, (msg)=>{
                try{
                    let msg_obj = JSON.parse(msg);
                    v.edit_pkg_form.bundle_view_status = 1; // success
                    v.edit_pkg_form.bundle_view_list = msg_obj;
                }catch(e){
                    v.edit_pkg_form.bundle_view_status = 2; // failed
                }                
            }, (code) => {
                v.edit_pkg_form.bundle_view_status = 2; // failed
            })
        },

        changeExecJar(file){
            this.edit_pkg_form.exec_jar = file;
        },
        
        confirm_edit_pkg(){
            const ajax_data = {
                "package_name" : this.edit_pkg_form.package_name,
                "exec_jar" : this.edit_pkg_form.exec_jar,
                "minecraft_version" : this.edit_pkg_form.minecraft_version,
                "note" : this.edit_pkg_form.note,                
            };

            let ws = new WebSocket();
            let _index = this._edit_pkg_index;
            let package_id = this.int_pkg_list[_index]["pkg_id"];
            let v = this;
            ws.ajax("POST", "/super_admin/core/edit_int_pkg_params/"+package_id, ajax_data, (msg)=>{
                for(let key in v.edit_form)
                    v.int_pkg_list[_index][key] = v.edit_pkg_form[key];
                v.showEditPkgModal = false;
                v.edit_pkg_modal_error = false;
            },(code)=>{
                v.edit_pkg_modal_error = true;
            })
        },

        delete_int_pkg(index){
            this.showDeletePkgModal = true;
            this._delete_pkg_index = index;
            this.delete_pkg_error = false;
            this.delete_pkg_name = this.int_pkg_list[index]["package_name"];
        },

        confirm_delete_pkg(){
            let ws = new WebSocket();
            let _index = this._delete_pkg_index;
            
            let package_id = this.int_pkg_list[_index]["pkg_id"];
            let v = this;
            ws.ajax("GET", "/super_admin/core/delete_int_pkg/"+package_id, (msg)=>{
                // on success
                v.showDeletePkgModal = false;
                v.int_pkg_list.splice(_index, 1);
                v.delete_pkg_error = false;
            },(code)=>{
                // on error
                v.delete_pkg_error = true;
            })
        },

        cancel_add_pkg(){
            this.AddIntPkgFailed = false;
            this.showAddIntPkgModal = false;
            this.$refs.PackageUploader.resetData();
        },

        confirm_add_pkg(){
            let ws = new WebSocket();
            let v = this.$refs.PackageUploader;

            let payload = {
                file: v.latest_stored_filename,
                exec_jar: v.exec_jar,
                package_name: v.package_bundle_name,
                minecraft_version: v.minecraft_version,
                note: v.note
            };

            let self = this;
            ws.ajax("POST", `/super_admin/core/add_integrated_package`, payload, (msg) => {
                self.aj_load_int_pkg_list();
                setTimeout(()=>{
                    this.showAddIntPkgModal = false;
                },1000);
                
            }, (code) => {
               self.AddIntPkgFailed = true;
            });    
        }
    },
    mounted() {
        this.aj_load_core_list();
        this.aj_load_int_pkg_list();
    }
}
</script>

<style>
div.core_nothing{
            text-align: center;
            font-size: 1.8rem;
            padding-top:4rem;
            color: #999;
        }

        div.add_button{
            margin-top:3rem;
            margin-bottom:3rem;
            text-align:center;
        }

        div.edit-button{
            position: absolute;
            right: 1rem;
            top: 0.75rem;
        }

        div.edit-button i{
            font-size: 1.6rem;
            color: gray;
        }

        div.edit-button a{
            margin-left:1rem;
            cursor: pointer;
        }

        div.core_list{
            border-bottom: 1px solid #dedede;
            min-height: 10.8rem;
            padding:1rem 0.5rem;
            position: relative;
        }

        div.core_list:hover{
            background-color: #f6f6f6;
        }
        div.core_list div.server_core_avatar{
            width: 6rem;
            height: 6rem;
            border: 1px solid #999;
            border-radius: 0.75rem;
            position: relative;
            float: left;
        }

        div.server_core_avatar div.no-pic{
            position:absolute;
            width: 5.8rem;
            height: 5.8rem;
            font-size:1.3rem;
            text-align: center;
            padding-top:0.6rem;
            color: gray;
        }
        div.server_core_avatar img.proj_avatar{
            display: block;
            position: absolute;
            left: 0.12rem;
            top: 0.12rem;
            width:5.6rem;
            height: 5.6rem;
        }
        div.server_core_info{
            padding-left: 8rem;
            width: 100%;
        }

        div.server_core_info div.list_title{
            font-size:2rem;
            font-weight: bold;
            line-height: 1em;
            margin-bottom:0.7rem;
        }

        div.list_row{
            line-height: 1.4em;
            width: 100%;
        }
        div.list_row div.half{
            display: inline-block;
            width: 45%;
        }

        div.half span.ttl{
            margin-right: 0.5rem;
            display: inline-block;
        }
        div.note{
            width: 100%;
            color: #999;
        }

        span.default-text{
            color: #999;
        }

        input.form-control,
        select.form-control{
            width: 75%;
        }

        div.form_input textarea{
            width: 75%;
            height: 8rem;
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
</style>
