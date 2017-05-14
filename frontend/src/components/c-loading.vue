<template lang="html">
    <div class="loading-mask">
        <div class="__child">
            <i class="fa fa-circle-o-notch fa-spin fa-3x fa-fw"></i>
            <div class="loading-text">{{ hint }}</div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            hint: {
                default: "loading..."                
            }
        },
        name:"c-loading"
    }
</script>

<style scoped>
div.loading-mask{
    height: 100%;
    width: 100%;
    text-align: center;
    display:table;
    color: #a3a3a3;
    background-color: rgba(213, 219, 230, 0.15);
}

div.loading-mask div.__child{
    display: table-cell;
    vertical-align: middle;
}

div.loading-mask div.loading-text{
    margin-top: 0.5rem;
    font-size: 1.6rem;
}
</style>
