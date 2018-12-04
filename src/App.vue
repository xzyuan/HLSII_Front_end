<template>
  <div id="cont">
     <el-row style="background-color: #ffffff; height:60px; " :gutter="20" type="flex">
      <el-col :span="24" align="center">
        <p class="grid-content bg-purple-dark" style="font-size: xx-large; margin-top: 10px;" >HLS-Ⅱ {{this.$route.name}}</p>
      </el-col>
    </el-row>
    <el-row>
          <el-menu :default-active="$route.path" class="el-menu-demo" mode="horizontal" @select="handleSelect" background-color="#2d6ba9"
                   text-color="#ffffff"
                   active-text-color="#ffd04b"
          >
            <el-col :span="3" :offset="3">
              <el-menu-item index="1" align="center"><router-link class="routernav" STYLE="text-decoration:none" to="/home">Home</router-link></el-menu-item>
            </el-col>
            <el-col :span="3" >
              <el-submenu index="2" align="center">
                <template slot="title">Historical Data</template>
                <el-menu-item index="2-1"><router-link to="/history/normalquery" style="text-decoration: none">Standard Query</router-link></el-menu-item>
                <el-menu-item index="2-2"><router-link to="" style="text-decoration: none">User-defined Query</router-link></el-menu-item>
                <el-menu-item index="2-3"><router-link to="/history/filerecords" style="text-decoration: none">Record Files</router-link></el-menu-item>
              </el-submenu>
            </el-col>
            <el-col :span="3">
              <el-submenu index="3" align="center">
                <template slot="title">Data Analysis</template>
                <el-menu-item index="3-1"><router-link STYLE="text-decoration:none" to="/analysis/operstatstatistics">Oper Stat Statistics</router-link></el-menu-item>
                <el-menu-item index="3-2"><router-link STYLE="text-decoration:none" to="/analysis/operstatlist">Oper Stat List</router-link></el-menu-item>
                <el-menu-item index="3-3"><router-link STYLE="text-decoration:none" to="/analysis/integral">Integral Current</router-link></el-menu-item>
                <el-menu-item index="3-4">Beam Cleaning</el-menu-item>
              </el-submenu>
            </el-col>
            <el-col :span="3">
              <el-menu-item index="4" align="center">Alarm</el-menu-item>
            </el-col>
            <el-col :span="3">
              <el-menu-item index="5" align="center"><router-link to="/radiation" STYLE="text-decoration:none">Radiation Monitor</router-link></el-menu-item>
            </el-col>
            <el-col :span="3">
              <el-menu-item index="6" align="center"><router-link to="/help" STYLE="text-decoration:none">About</router-link></el-menu-item>
            </el-col>
          </el-menu>
      </el-row>
      <el-row>
          <div>
            <!-- 路由匹配到的组件将渲染在这里 -->
            <router-view></router-view>
          </div>
      </el-row>
      <el-footer>
        <foot/>
      </el-footer>

  </div>
</template>

<script>
  import Foot from "@/page/activePublic/foot";

  export default {
    name: 'app',
    components: {Foot},
    data() {
      return {
        activeIndex2: "$route.path",
        navConfig:{
          charts:0,
          'history/normalquery':1
        }
      };
    },
    mounted(){
      console.log(this.$route.path)
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log(key, keyPath);
      }
    }

  }

</script>

<style scoped>
  a {
    text-decoraction: none;
    color: white;
  }

  .el-menu-item,.el-submenu {
    border-left: 1px solid #ffffff;
    border-right: 1px solid #ffffff;
  }

  .router-link-active {
    text-decoration: none;
  }

  .el-footer {
    background-color: aliceblue;
    color: #333;
    text-align: center;
    font-size: large;
    margin-bottom: fill;
  }
  html,#cont{
    height: 100%;
  }
  body{
    height: 100%;
  }
</style>
