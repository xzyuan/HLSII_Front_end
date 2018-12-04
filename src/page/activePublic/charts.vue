<template>
  <div style="height: 100%">

    <div align="center" style="margin-top: 4%">
      <el-radio v-model="radio" label="1" >Beam Current</el-radio>
      <el-radio v-model="radio" label="2" >Beam Current and Lifetime</el-radio>
    </div>
    <div style="margin-top: 2%" v-if="radio == 1">
      <highstock :options = 'options' style="width: 60%"></highstock>
    </div>
    <div style="margin-top: 2%" v-else>
      <highstock :options = 'options1' style="width: 60%"></highstock>
    </div>
  </div>
</template>

<script>
    import {formatDate} from "../../js/date";

    export default {
        name: "charts",
      data(){
          this.chartSettings = {
            labelMap: {
              curr_date: 'date',
              val: 'Beam Current'
            }
          }
          return{
            radio:'1',
            options: {
              chart: {
                zoomType: 'x',
                resetZoomButton: {
                  position: {
                    // align: 'right', // by default
                    // verticalAlign: 'top', // by default
                    x: 0,
                    y: -30
                  },
                  relativeTo: 'chart'
                }
              },
              title: {
                text: 'Beam Current'
              },
              xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                  millisecond: '%H:%M:%S.%L',
                  second: '%H:%M:%S',
                  minute: '%H:%M',
                  hour: '%H:%M',
                  day: '%m-%d',
                  week: '%m-%d',
                  month: '%Y-%m',
                  year: '%Y'
                }
              },
              yAxis: [{
                opposite:false,
                type: 'linear',
                title: {
                  text: 'Beam Current'
                }
              }],
              tooltip: {
                dateTimeLabelFormats: {
                  millisecond: '%H:%M:%S.%L',
                  second: '%H:%M:%S',
                  minute: '%H:%M',
                  hour: '%H:%M',
                  day: '%Y-%m-%d',
                  week: '%m-%d',
                  month: '%Y-%m',
                  year: '%Y'
                }
              },
              credits: {
                // enabled:true,    // 默认值，如果想去掉版权信息，设置为false即可
                text: 'NSRL@USTC', // 显示的文字
                href: 'http://www.nsrl.ustc.edu.cn'
              },
              rangeSelector: false,
              legend: {
                enabled: true,
                verticalAlign: 'bottom',
                // layout: 'vertical',
                align: 'middle'
              },
              series:[{
                name: 'Beam Current',
                data: [],
                lineWidth: 2
              }]
            },
            options1: {
              chart: {
                zoomType: 'x',
                resetZoomButton: {
                  position: {
                    // align: 'right', // by default
                    // verticalAlign: 'top', // by default
                    x: 0,
                    y: -30
                  },
                  relativeTo: 'chart'
                }
              },
              exporting: {
                filename: '数据'
              },
              title: {
                text: 'Beam Current and LifeTime'
              },
              xAxis: {
                type: 'datetime',
                dateTimeLabelFormats: {
                  millisecond: '%H:%M:%S.%L',
                  second: '%H:%M:%S',
                  minute: '%H:%M',
                  hour: '%H:%M',
                  day: '%m-%d',
                  week: '%m-%d',
                  month: '%Y-%m',
                  year: '%Y'
                }
              },
              yAxis: [{
                opposite:false,
                type: 'linear',
                title: {
                  text: 'Current(mA)'
                }
              },{
                opposite:true,
                type: 'linear',
                title: {
                  text: 'LifeTime(hrs)'
                }
              }],
              tooltip: {
                dateTimeLabelFormats: {
                  millisecond: '%H:%M:%S.%L',
                  second: '%H:%M:%S',
                  minute: '%H:%M',
                  hour: '%H:%M',
                  day: '%Y-%m-%d',
                  week: '%m-%d',
                  month: '%Y-%m',
                  year: '%Y'
                }
              },
              credits: {
                // enabled:true,    // 默认值，如果想去掉版权信息，设置为false即可
                text: 'NSRL@USTC', // 显示的文字
                href: 'http://www.nsrl.ustc.edu.cn'
              },
              rangeSelector: false,
              legend: {
                enabled: true,
                verticalAlign: 'bottom',
                // layout: 'vertical',
                align: 'middle'
              },
              series:[{
                name:'Current',
                data:[],
                lineWidth:2
              },{
                name:'LifeTime',
                data:[],
                lineWidth:2
              }]
            },

          }
      },
      mounted() {
          let p = new Array();
          let date1 = new Date(Date.now())
          let date2 = new Date(Date.now()-3600*24*1000)
          console.log(Date.now())
          console.log(date1)
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          console.log(time1 + ' +  ' + time2)
          let _this = this;
          _this.options1.series[0].yAxis = 0;
          _this.options1.series[1].yAxis = 1;
          this.$axios
            .get('/data/history/id/149/'+ time2 + '/' + time1)
            .then(function (response) {
                let n = response.data.length;
                for (let i = 0; i < n; i++){
                  _this.options.series[0].data.push([response.data[i].smpl_time,response.data[i].float_val]);
                  _this.options1.series[0].data.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
            });
          this.$axios.get('/data/history/id/150/'+ time2 + '/' + time1)
            .then(function (response) {
              // console.log("data:  " + response.data)
              let n = response.data.length;
              for (let i = 0; i < n; i++){
                _this.options1.series[1].data.push([response.data[i].smpl_time,response.data[i].float_val]);
              }
            })
          //设置定时刷新
          // setInterval(getIntegralData,10000);
          function getIntegralData() {
            _this.$axios.get('/data/history/id/150/'+ time2 + '/' + time1)
              .then(function (response) {
                console.log("data:  " + response.data)
                let n = response.data.length;
                for (let i = 0; i < n; i++){
                  _this.options1.series[1].data.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
              })
          }
      }
    }
</script>
<style scoped>
  div{
    margin-left: auto;
    margin-right: auto;
  }
</style>
