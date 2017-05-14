<template lang="html">
    <div class="tree-frame">
        <c-loading v-if="status == 0" hint="正在读取文件目录"></c-loading>
        <c-error v-if="status == 2" hint="读取目录失败"></c-error>
        <ul v-if="status == 1" class="list">
            <c-tree-view :model="data" :root="true" @item_click="on_item_click"></c-tree-view>
        </ul>
    </div>
</template>

<script>
    import LoadingComponent from "../c-loading.vue";
    import ErrorComponent from "../c-error.vue";
    import CTreeView from "../c-tree-view.vue";
    
    const LOADING = 0;
    const LISTING = 1;
    const LOAD_ERROR = 2;

const _translate = (root_zip, data) => {
    let tree_data = {};
    // add root node
    tree_data['name'] = root_zip;
    tree_data['children'] = [];

    const __append_node = (tree_node, data_node) => {
        for(let v in data_node){
            if(typeof data_node[v] === "object"){
                let with_child_leaf = {
                    name : v,
                    children: []
                };
                let _index = tree_node.push(with_child_leaf);
                __append_node(tree_node[_index-1]["children"], data_node[v]);

            }else{
                let leaf = {name: v};
                tree_node.push(leaf);
            }
        }
    }

    __append_node(tree_data["children"], data);
    return tree_data;
};

export default{
    name:'tree-view',
    props: {
        status: {
            default: 0
        },
        treeData: Object,
        rootZip: String
    },
    components: {
        'c-loading': LoadingComponent,
        'c-error': ErrorComponent,
        'c-tree-view': CTreeView
    },
    data(){
        return { }
    },
    computed: {
        data(){
            return _translate(this.rootZip, this.treeData);
        }
    },
    methods: {
        on_item_click(data){
            this.$emit("file_click", data);
        }
    }
}
</script>

<style scoped>
div.tree-frame{
    border: 1px solid #aaa;
    height: 10rem;
    overflow-y: auto;
}

ul.list{
    padding-left: 1rem !important;
    padding-top: 0.25rem !important;
    cursor: pointer;
}
</style>
