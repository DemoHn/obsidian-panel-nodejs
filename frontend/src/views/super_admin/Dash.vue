<template lang="html">
  <div class="wrapper">
    <header class="main-header">
      <a href="/" class="logo">
        <!-- LOGO -->
        <b>Obsidian</b> Panel
      </a>
      <!-- Header Navbar -->
      <nav class="navbar navbar-static-top" role="navigation">
        <a href="#" class="sidebar-toggle" role="button" data-toggle="offcanvas"><span class="sr-only"></span></a>

        <!-- Navbar Right Menu -->
        <div class="navbar-custom-menu">
            <ul class="nav navbar-nav">
                <li>
                    <a class="bottom" title="" id="_logout" data-placement="bottom" data-toggle="tooltip" href="/super_admin/logout" data-original-title="退出">
                        <i class="fa fa-power-off"></i>
                    </a>
                </li>
                <li><span>&nbsp;&nbsp;&nbsp;</span></li>
            </ul>
        </div>
      </nav>
    </header>
    <!-- Left side column. contains the logo and sidebar -->
    <aside class="main-sidebar">

      <!-- sidebar: style can be found in sidebar.less -->
      <section class="sidebar">
        <!-- Sidebar Menu -->
        <ul class="sidebar-menu">
            <br><br>
          <li class="pageLink" :class="{'active' : route == 'info'}" v-on:click="toggleMenu"><router-link to="/super_admin/info"> <i class="fa fa-info-circle"></i><span class="link-text">基本信息</span></router-link></li>
          <li class="pageLink" :class="{'active' : route == 'core'}" v-on:click="toggleMenu"><router-link to="/super_admin/core"> <i class="fa fa-photo"></i><span class="link-text">服务器核心</span></router-link></li>
          <li class="pageLink" :class="{'active' : route == 'java_binary'}" v-on:click="toggleMenu"><router-link to="/super_admin/java"><i class="fa fa-coffee"></i><span class="link-text">Java版本管理</span></router-link></li>
          <li class="pageLink" :class="{'active' : route == 'settings'}" v-on:click="toggleMenu"><router-link to="/super_admin/settings"> <i class="fa fa-gear"></i><span class="link-text">设置</span></router-link></li>
          <br>
          <li class="pageLink" v-on:click="toggleMenu"><a href="/server_inst/dashboard"><i class="fa fa-arrow-circle-left"></i><span class="link-text">返回控制台</span></a></li>

        </ul>
        <!-- /.sidebar-menu -->
      </section>
      <!-- /.sidebar -->
    </aside>

    <!-- Content Wrapper. Contains page content -->
    <div class="content-wrapper">
      <!-- Content Header (Page header) -->
      <!--<section class="content-header">
        <h1>
          {{$route.name.toUpperCase() }}
          <small>{{ $route.meta.description }}</small>
        </h1>
        <ol class="breadcrumb">
          <li><a href="javascript:;"><i class="fa fa-home"></i>Home</a></li>
          <li class="active">{{$route.name.toUpperCase() }}</li>
        </ol>
      </section>-->

      <router-view></router-view>
    </div>
    <!-- /.content-wrapper -->

    <!-- Main Footer -->
    <footer class="main-footer">
      <strong>Copyright &copy; {{year}} <a href="javascript:;">Obsidian Panel</a>.</strong> All rights reserved.
    </footer>
  </div>
  <!-- ./wrapper -->
</template>

<script>
module.exports = {
    name: 'Dash',
    data: function () {
        return {
            route : ""
        }
    },
    computed: {
    },
    methods: {
        toggleMenu: function (event) {
            let p = this.$route.path.split("/")
            this.route = p[p.length-1];
        }
    },
    mounted: function () {
        this.toggleMenu();
  }
}
</script>

<style>
[v-cloak]{
  display: none;
}

.user-panel {
  height: 4em;
}

.link-text{
    margin-left: 0.5em;
}

hr.visible-xs-block {
  width: 100%;
  background-color: rgba(0, 0, 0, 0.17);
  height: 1px;
  border-color: transparent;
}

@media(min-width: 1201px){
    div.content-wrapper{
        padding-left:15px;
        padding-right:15px;
        padding-top:18px;
    }
    div.box{
        max-width: 600px;
    }
}

/*Hide logo on mobile device*/
@media (max-width: 767px) {
    header.main-header a.logo{
        display: none;
    }

    .fixed div.content-wrapper{
        padding-top:50px !important;
    }

    .main-sidebar, .left-side{
        padding-top:50px !important;
    }
}
</style>
