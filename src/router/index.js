import Vue from 'vue'
import Router from 'vue-router'
import charts from "@/page/activePublic/charts"
import help from "@/page/activePublic/help"
import piecharts from "@/page/activePublic/piecharts"
import integralcurrquery from "@/page/activePublic/integralcurrquery"
import historicalcharts from "@/page/activePublic/historicalcharts"
import filerecords from "@/page/activePublic/historicalfilerecords"
import operstatlist from "@/page/activePublic/operstatlist"
import radiation from "@/page/activePublic/radiation"
import userdefinedquery from "@/page/activePublic/userdefinedquery"

Vue.use(Router)

export default new Router({
    mode:"history",
    routes: [
    {
      path:'/',
      name:'Operation Status',
      component:charts
    },
    {
      path:'/home',
      name:'Operation Status',
      component:charts
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
      path:'/history/normalquery',
      name:'Historical Data Normal Query',
      component: historicalcharts
    },
    {
      path:'/history/filerecords',
      name:'File Records',
      component:filerecords
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
      path:'/history/userdefinedquery',
      name:'userdefinedquery',
      component:userdefinedquery
    }
  ]
})
