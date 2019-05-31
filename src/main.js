// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import router from './router'

import Vue from 'vue';
import Vuex from 'vuex';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import axios from 'axios';

import VueHighCharts from 'vue-highcharts';
import Highcharts from 'highcharts/highstock';
// import Export from 'highcharts/modules/exporting'
// import Export_Data from 'highcharts/modules/export-data'
import loadExporting from 'highcharts/modules/exporting';
import promise from 'es6-promise';
import 'lib-flexible/flexible.js'

import VCharts from 'v-charts'

loadExporting(Highcharts);

Vue.use(VCharts)
Vue.use(VueHighCharts, {Highcharts});

promise.polyfill();

Vue.prototype.$axios = axios
Vue.use(ElementUI)
Vue.use(Vuex)
Vue.config.productionTip = false

Highcharts.setOptions({
  global: {
    useUTC: false
  },
  lang:{
    downloadCSV: 'Download CSV',
    downloadXLS: 'Download XLS',
    viewData: 'View data table'
  },
  navigation: {
    menuItemStyle: {
      padding: '6px 14px'
    }
  },
})

axios.defaults.timeout = '50000000'
let _this = this;
axios.defaults.baseURL="http://192.168.113.35:80"
// axios.defaults.baseURL="http://222.195.82.88:8082"
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8'

Vue.prototype.urlFragment ="/data";

Date.prototype.format = function(fmt) {
  var o = {
    "M+" : this.getMonth()+1,                 //月份
    "d+" : this.getDate(),                    //日
    "h+" : this.getHours(),                   //小时
    "m+" : this.getMinutes(),                 //分
    "s+" : this.getSeconds(),                 //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S"  : this.getMilliseconds() < 100 ?  '0' + this.getMilliseconds().toString() :  this.getMilliseconds()       //毫秒
  };
  if(/(y+)/.test(fmt)) {
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
  for(var k in o) {
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
  return fmt;
}


/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})

