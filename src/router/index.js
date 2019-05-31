import Vue from 'vue'
import Router from 'vue-router'
import home from "@/page/activePublic/home"
import about from "@/page/activePublic/about"
import statusStatistics from "@/page/activePublic/statusStatistics"
import integralcurrquery from "@/page/activePublic/integralcurrquery"
import customizedquery from "@/page/activePublic/customizedquery"
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
      path:'/about',
      name:'About',
      component:about
    },
    {
      path:'/analysis/operstatstatistics',
      name:'Operation Status Statistics',
      component:statusStatistics
    },
    {
      path:'/analysis/integral',
      name:'Integral Current Query',
      component:integralcurrquery
    },
    {
      path:'/history/customizedquery',
      name:'Historical Data Customized Query',
      component: customizedquery
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
