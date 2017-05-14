<template lang="html">
 <li>
    <div
      :class="{bold: isFolder}"
      @click="toggle">
      <i v-if="isFolder && !root" :class="open ? 'fa fa-folder-open-o' : 'fa fa-folder-o'" style="margin-right: 0.6rem;"></i>
      <i v-if="!isFoleder && root" class="fa fa-file-archive-o" style="margin-right: 0.6rem;"></i>
      <i v-if="!isFolder && !root" class="fa fa-file-text-o" style="margin-right: 0.6rem;"></i>
      {{model.name}}
    </div>
    <ul v-show="open" v-if="isFolder">
      <c-tree-view
        class="item"
        v-for="model in model.children"
        :prefix="prefix + '/' + model.name"
        @item_click="bubble_item_click"
        :model="model">
      </c-tree-view>
    </ul>
  </li>
</template>

<script>
    export default {
        name: "c-tree-view",
        props: {
            model: Object,
            prefix: {
                default: ""
            },
            root: {
                default: false
            }
        },

        data() {
            return {
                open: false
            }
        },
        computed: {
            isFolder: function () {
                return this.model.children &&
                    this.model.children.length
            }
        },
        methods: {
            toggle: function () {
                let _file_location = this.prefix;
                if (this.isFolder) {
                    this.open = !this.open
                    _file_location += "/";
                }

                this.$emit("item_click", _file_location);
            },
            bubble_item_click: function (data) {
                // pass the event to upper floor
                this.$emit("item_click", data);
            }
        },
        mounted(){
            if(this.root){
                this.open = true;
            }
        }
    }
</script>

<style scoped>
.item {
  cursor: pointer;
}
.bold {
  font-weight: bold;
}
ul {
  padding-left: 2.5rem;
  line-height: 1.5em;
  list-style-type: none;
}

li{
    list-style-type: none;
}
</style>
