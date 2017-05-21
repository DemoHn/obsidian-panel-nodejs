<template lang="html">
    <div class="box box-default box-solid">
        <!-- title -->
        <div class="box-header with-border drop-box-header" @click="toggle_body">
            <span class="header-title">
                <slot name="title">Default Title</slot>
            </span>
            <div class="box-tools pull-right">
                <i class="fa fa-plus drop-box-i" v-if="collapse == true"></i>
                <i class="fa fa-minus drop-box-i" v-if="collapse == false"></i>
            </div>
        </div>
        <!-- content -->
        <div class="box-body"> 
            <div class="drop-box-body" id="box_body">
                <slot name="body"><div>default body<br>default body<br>default body<br>default body<br></div></slot>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name:"drop-box",
        props:{
            shown: {
                default: false
            }
        },
        data(){
            return {
                collapse: !this.shown
            }
        },
        methods:{
            set_shown(status){
                if(status === this.collapse){
                    toggle_body();
                }
            },
            toggle_body(){
                const time = 400; // ms
                let elem = this.$el.querySelector("#box_body");
                
                this.collapse = !this.collapse;

                if(!this.collapse){
                    let height = window.getComputedStyle(elem).height;
                    elem.style.transition = "none";
                    elem.style.height = "auto";
                    let targetHeight = window.getComputedStyle(elem).height;
                    elem.style.height = height;
                    //elem.offsetWidth = elem.offsetWidth;

                    setTimeout(()=>{
                        elem.style.transition = "height "+ time +"ms";
                        elem.style.height = targetHeight;
                    },15);

                    setTimeout(()=>{
                        // after transition, set height to `auto`,
                        // so that the box is extendable.
                        elem.style.height = "auto";
                        elem.style.transition = "none";
                    },time*2);
                }else{
                    let height = window.getComputedStyle(elem).height;
                    elem.style.height = height;
                    setTimeout(()=>{
                        elem.style.transition = "height "+ 400 +"ms";
                        elem.style.height = "0px";    
                    },15);
                }
            }
        },
        mounted(){
            if(!this.shown){
                let elem = this.$el.querySelector("#box_body");
                elem.style.transition = "height "+ 400 +"ms";
                elem.style.height = "0px";
            }
        }
    }
</script>

<style scoped>
.header-title{
    font-size: 1.6rem;
}
div.drop-box-header{
    padding: 8px 10px !important;
    cursor: pointer;
    transition: background-color 100ms;
}

div.drop-box-header:hover{
    background-color: #cbcbcb !important;
}
i.drop-box-i{
    line-height: 2.2rem !important;
    font-size:1.2rem;
}

.drop-box-body{
    overflow-y:hidden;
    display:block;
    zoom:1;
}
</style>
