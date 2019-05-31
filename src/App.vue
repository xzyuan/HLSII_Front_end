<template>
  <div style="min-width: 1400px">
     <el-row style="background-color: #ffffff; height:80px; "  type="flex">
      <el-col :span="12" :offset="6" align="center">
        <p class="grid-content bg-purple-dark" style="font-size: xx-large; margin-top: 20px;" >
          <font style="font-size: xx-large;font-weight: bold;font-family: Arial, Helvetica, sans-serif; color: #004499">HLS-Ⅱ {{this.$route.name}}</font>
        </p>
      </el-col>
       <el-col :span="6" align="left" style="margin-bottom: 0; margin-top: 20px"><p style="color: #2d6ba9;font-size: large"  >{{timeNow}}</p></el-col>
    </el-row>
    <el-row >
      <!-- #004499   #2d6ba9   #ffd04b  -->
          <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect" background-color="#004499"
                   text-color="#ffffff"
                   active-text-color="#ffd04b"
                   :router="routerMode"
                    >
            <el-col :span="2"><div><p></p></div></el-col>
            <el-col  :span="4" align="center">
              <el-menu-item index="/home" align="center">Operation Status</el-menu-item>
              </el-col>
            <el-col :span="4" align="center">
              <div>
                <el-submenu index="/history" align="center">
                  <template slot="title" style="width: 100%;"><font style="font-size: large;font-weight: bold;font-family: Arial, Helvetica, sans-serif;width: 100%;">Historical Data</font></template>
                  <el-menu-item index="/history/customizedquery">Customized Query</el-menu-item>
                  <el-menu-item index="/history/freequery">Free Query</el-menu-item>
                </el-submenu>
              </div>
            </el-col>
            <el-col :span="4" align="center">
              <el-submenu index="3" align="center" style="width: 100%">
                <template slot="title" style="width: 100%"><font style="font-size: large;">Data Analysis</font></template>
                <el-menu-item index="/analysis/operstatstatistics" style="width: 100%">Oper Stat Statistics</el-menu-item>
                <el-menu-item index="/analysis/operstatlist">Oper Stat List</el-menu-item>
                <el-menu-item index="/analysis/integral">Integral Current</el-menu-item>
                <el-menu-item index="/analysis/beamcleaning">Beam Cleaning</el-menu-item>
              </el-submenu>
            </el-col>
            <!--<el-col :span="4" align="center">-->
              <!--<el-menu-item index="/alarm" align="center">Alarm</el-menu-item>-->
            <!--</el-col>-->
            <el-col :span="4" align="center">
              <el-menu-item index="/radiation" align="center">Radiation Monitor</el-menu-item>
            </el-col>
            <el-col :span="4" align="center">
              <el-menu-item index="/about" align="center">About</el-menu-item>
            </el-col>
            <el-col :span="2"><div><p></p></div></el-col>
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
          <div align="center" style="margin-top: 10px">
            Copyright Controls Group, Machine Division, NSRL<b/>
          </div>
        </div>
      </el-footer>

  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        routerMode:true,
        activeIndex: '/home' ,
        timeNow: '',
      };
    },
    created:function(){

    },
    mounted(){
      this.defaultIndex()
      let _this = this;   //声明一个变量指向Vue实例this，保证作用域一致
      this.timer = setInterval(function () {
        _this.timeNow = new Date().format("yyyy-MM-dd hh:mm:ss").toString();    //修改数据date
      },1000);
    },
    methods: {
      handleSelect(key, keyPath) {
      },
      defaultIndex(){
        this.activeIndex = this.$route.matched[0].path;
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
  .routernav{
    text-decoraction: none;
  }

  .el-menu-item,.el-submenu {
    border-left: 2px solid #ffffff;
    border-right: 2px solid #ffffff;
    font-size: large;
    font-family: Arial, Helvetica, sans-serif;
    text-decoration:none;
    font-weight: bold;
  }

  .el-menu-item{
    width: 100%;
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

</style>
