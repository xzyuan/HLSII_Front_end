<template>
  <div style="min-width: 1400px;">
     <el-row style="background-color: #ffffff; height:80px; " :gutter="20" type="flex">
      <el-col :span="12" :offset="6" align="center">
        <p class="grid-content bg-purple-dark" style="font-size: xx-large; margin-top: 20px;" >
          <font style="font-size: xx-large;font-weight: bold;font-family: Arial, Helvetica, sans-serif; color: #004499">HLS-Ⅱ {{this.$route.name}}</font>
        </p>
      </el-col>
       <el-col :span="6" align="left" style="margin-bottom: 0; margin-top: 20px"><p style="color: #2d6ba9;font-size: large"  >{{timeNow}}</p></el-col>
    </el-row>
    <el-row >
      <!-- #004499   #2d6ba9   #ffd04b  -->
          <el-menu :default-active="$route.path" class="el-menu-demo" mode="horizontal" @select="handleSelect" background-color="#004499"
                   text-color="#ffffff"
                   active-text-color="#ffffff"
                    >
            <el-col :span="3"><div><p></p></div></el-col>
            <el-col  :span="3" align="center">
              <el-menu-item index="/home" align="center" ><router-link class="routernav" STYLE="text-decoration:none;
               font-weight: bold;font-family: Arial, Helvetica, sans-serif;" to="/home">Home</router-link></el-menu-item>
              </el-col>
            <el-col :span="3" align="center">
              <div>
              <el-submenu index="/history" align="center">
                <template slot="title" style="width: 100%;"><font style="font-size: large;font-weight: bold;font-family: Arial, Helvetica, sans-serif;width: 100%;">Historical Data</font></template>
                <el-menu-item index="2-1"><router-link to="/history/customizedquery" style="text-decoration: none; width: 10px;" >Customized Query</router-link></el-menu-item>
                <el-menu-item index="2-2"><router-link to="/history/freequery" style="text-decoration: none">Free Query</router-link></el-menu-item>
              </el-submenu>
              </div>
            </el-col>
            <el-col :span="3" align="center">
              <el-submenu index="3" align="center">
                <template slot="title"><font style="font-size: large;">Data Analysis</font></template>
                <el-menu-item index="3-1"><router-link STYLE="text-decoration:none" to="/analysis/operstatstatistics">Oper Stat Statistics</router-link></el-menu-item>
                <el-menu-item index="3-2"><router-link STYLE="text-decoration:none" to="/analysis/operstatlist">Oper Stat List</router-link></el-menu-item>
                <el-menu-item index="3-3"><router-link STYLE="text-decoration:none" to="/analysis/integral">Integral Current</router-link></el-menu-item>
                <el-menu-item index="3-4"><router-link STYLE="text-decoration:none" to="/analysis/beamcleaning">Beam Cleaning</router-link></el-menu-item>
              </el-submenu>
            </el-col>
            <el-col :span="3" align="center">
              <el-menu-item index="4" align="center">Alarm</el-menu-item>
            </el-col>
            <el-col :span="3" align="center">
              <el-menu-item index="5" align="center"><router-link to="/radiation" STYLE="text-decoration:none">Radiation Monitor</router-link></el-menu-item>
            </el-col>
            <el-col :span="3" align="center">
              <el-menu-item index="/help" align="center"><router-link to="/help" STYLE="text-decoration:none">About</router-link></el-menu-item>
            </el-col>
          </el-menu>
      </el-row>
      <el-row>
          <div>
            <!-- 路由匹配到的组件将渲染在这里 -->
            <router-view></router-view>
          </div>
      </el-row>
      <el-footer height="30px">
        <div>
          <p align="center">
            Copyright Controls Group, Machine Division, NSRL
          </p>
        </div>
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
        // activeIndex2: "$route.path",
        activeIndex: 1,
        navConfig:{
          charts:0,
          'history/normalquery':1
        },
        timeNow: '',
      };
    },
    mounted(){
      let _this = this;   //声明一个变量指向Vue实例this，保证作用域一致
      this.timer = setInterval(function () {
        _this.timeNow = new Date().format("yyyy-MM-dd hh:mm:ss").toString();    //修改数据date
      },1000);
    },
    methods: {
      handleSelect(key, keyPath) {
        console.log("点击了")
        console.log(key, keyPath);
        this.activeIndex = key
        console.log(this.$route.path)
      }
    },
    beforeDestory:function () { //清除定时器
      if (this.timer){
        clearInterval(this.timer);  //在Vue实例销毁前，清除定时器
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
    border-left: 2px solid #ffffff;
    border-right: 2px solid #ffffff;
    font-size: large;
    font-weight: bolder;
    font-family: Arial, Helvetica, sans-serif;
  }

  .template{
    font-size: large;
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
  /*html,#cont{*/
    /*height: 100%;*/
  /*}*/

</style>
