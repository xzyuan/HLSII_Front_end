import Vue from 'vue'
import Router from 'vue-router'
import home from "@/page/activePublic/home"
import help from "@/page/activePublic/help"
import piecharts from "@/page/activePublic/piecharts"
import integralcurrquery from "@/page/activePublic/integralcurrquery"
import historicalcharts from "@/page/activePublic/historicalcharts"
import operstatlist from "@/page/activePublic/operstatlist"
import radiation from "@/page/activePublic/radiation"
import userdefinedquery from "@/page/activePublic/userdefinedquery"
import beamcleaning from "@/page/activePublic/beamcleaning"

Vue.use(Router)

export default new Router({
    mode:"history",
    routes: [
    {
      path:'/',
      name:'Operation Status',
      component:home
    },
    {
      path:'/home',
      name:'Operation Status',
      component:home
    },
    {
      path:'/help',
      name:'Help Info',
      component:help
    },
    {
      path:'/analysis/operstatstatistics',
      name:'Operation Status Statistics',
      component:piecharts
    },
    {
      path:'/analysis/integral',
      name:'Integral Current Query',
      component:integralcurrquery
    },
    {
      path:'/history/customizedquery',
      name:'Historical Data Customized Query',
      component: historicalcharts
    },
    {
      path:'/analysis/operstatlist',
      name:'Operation Status List',
      component:operstatlist
    },
    {
      path:'/radiation',
      name:'Radiation Monitor',
      component:radiation
    },
    {
      path:'/history/freequery',
      name:'Historical Data Free Query',
      component:userdefinedquery
    },{
      path:'/analysis/beamcleaning',
      name:'Beam Cleaning Status',
      component:beamcleaning
    },
  ]
})
