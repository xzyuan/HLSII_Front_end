<template>
  <el-container>
    <el-dialog title="Data" :visible.sync="dialogTableVisible" width="90%" align="center">
      <el-row>
        <div align="center">
          <el-table :data="gridData" >
            <el-table-column v-for = "col in checkedPvList" :property="col" :label="col" :key="col" width="250%"></el-table-column>
          </el-table>
        </div>
      </el-row>
      <el-row>
        <span class="demonstration" align="center">page select</span>
        <el-pagination
          layout="prev, pager, next,jumper"
          :page-count="pageNumber"
          :current-page.sync="currentPage"
          @current-change="pageChange" align="center">
        </el-pagination>
      </el-row>
    </el-dialog>
    <el-dialog title="Statistics" :visible.sync="statisticsDialogTableVisible">
      <el-table :data="statisticsData">
        <el-table-column property="Pv_Name" label="Pv Name"></el-table-column>
        <el-table-column property="Mean" label="Mean"></el-table-column>
        <el-table-column property="Deviation" label="Deviation"></el-table-column>
        <el-table-column property="RMS" label="RMS"></el-table-column>
        <el-table-column property="Max" label="Max"></el-table-column>
        <el-table-column property="Min" label="Min"></el-table-column>
      </el-table>
    </el-dialog>
    <el-aside width="30%"  style="margin-left: 4%;margin-top: 1%" align="center">
      <el-button type="primary" @click="addGroup">Add Group</el-button>
      <el-button  type="warning" @click="removeGroup">Remove Group</el-button>
      <el-button  type="danger" icon="el-icon-delete"   @click="clearGroups">Clear Groups</el-button>
      <div >
        <el-card v-for="group in groups"  style="width: 99%; margin-top: 2px" body-style="padding: '2px'">
          <div  style="min-height: 0;  margin-top: auto; margin-bottom: auto" align="center">
            group{{group.number}}
            <el-button style="padding: 3px; margin-left: 2px " @click="group.pvs.push({name:''})" icon="el-icon-plus" round></el-button>
            <el-button style="padding: 3px;" @click="group.pvs.pop()" icon="el-icon-minus"></el-button>
          </div>
          <div style="margin-top: 2px;">
            <input v-for="pv in group.pvs" v-on:input="inputChange(group,pv,$event)" />
          </div>
        </el-card>
      </div>
    </el-aside>
    <el-main>
        <highstock :options = 'options' style="width: 80%"></highstock>
        <div class="block" style="margin-top: 1%" align="center">
          <!--<span class="demonstration">选择查询时间段</span><br/>-->
          <el-date-picker
            v-model="value5"
            type="datetimerange"
            :picker-options="pickerOptions"
            range-separator="to"
            start-placeholder="start time"
            end-placeholder="end time"
            align="right">
          </el-date-picker>
        </div >
        <div style="margin-top: 1%" align="center">
          <el-button v-on:click="query1" type="primary">Draw Line Chart</el-button>
          <el-button v-on:click="showStatistics" type="primary">Statistics Data</el-button>
          <el-button @click="showData" type="primary">View Data</el-button>
          <el-button v-on:click="downloadData" type="primary">Download Data</el-button>
        </div>
        <div style="margin-top: 1%" align="center">
          <el-switch
            active-color="#13ce66"
            inactive-color="#696969"
            active-text="Logarithmic"
            v-model="switchValue1"
            @change="changeChartType"
          >
          </el-switch>
          <el-switch
            active-color="#13ce66"
            inactive-color="#696969"
            active-text="Beam Current"
            v-model="switchValue2"
            @change="addBeamCurrSeries">
          </el-switch>
        </div>
    </el-main>
  </el-container>
</template>

<script>
    export default {
      name: "userdefinedquery",
      data() {
        return {
          groups:[{number:1,pvs:[{name:''}]}],

          showHeader: false,
          gridData: [{pvName:'RNG:BEAM:CURR'},{pvName:'RNG:BEAM:LIFE'}],
          isHidden: false,
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
              text: null
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
            yAxis:[],
            lang: {
              downloadCSV: '下载CSV文件',
            },
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
            series: []
          },
          switchValue1: false,
          switchValue2: false,
          pickerOptions: {
            shortcuts: [{
              text: '最近一周',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: '最近一个月',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: '最近三个月',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit('pick', [start, end]);
              }
            }]
          },
          value5: [new Date(Date.now() - 3600 * 1 * 1000), new Date(Date.now())],

          dialogTableVisible: false,

          statisticsDialogTableVisible: false,
          statisticsData: [],

          //分页属性
          //使用懒加载，加载一页，显示一页
          pageNumber: 0,
          pageSize: 30,
          currentPage: 1,
        }
      },
      methods: {
        inputChange:function(group,pv,$event){
          // console.log($event);
          let str = $event.path[0].value.replace(/(^\s*)|(\s*$)/g, '');
          if(str != null && str != ''){
            pv.name = str;
          }
          // console.log(pv.name)
        },
        handleClick(index, rows) {
          rows.splice(index, 1);
        },
        query1: function () {
          let _this = this;
          if(this.groups.length == 1 && (this.groups[0].pvs.length === 1 && this.groups[0].pvs[0] == ''  )){
            return;
          }
          this.options.yAxis = [];
          this.options.series = [];
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          for(let i = 0; i < this.groups.length; i++ ) {
            this.$axios.get('/pvunit/'+this.groups[i].pvs[0].name)
              .then(function (response) {
                _this.options.yAxis.push({
                  title: {text: response.data},
                  opposite: false})
              })
          };
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < _this.groups[i].pvs.length; j++) {
              _this.$axios.get('/history/name/' + _this.groups[i].pvs[j].name + '/' + time1 + '/' + time2)
                .then(function (response1) {
                  if (response1.data['channelOuts'] == null) {
                    return
                  }
                  let p = new Array();
                  for (let k = 0; k < response1.data['channelOuts'].length; k++) {
                    p.push([response1.data['channelOuts'][k].smpl_time, response1.data['channelOuts'][k].float_val]);
                  }
                  _this.options.series.push({
                    name: _this.groups[i].pvs[j].name,
                    data: p,
                    yAxis: i,
                    type: 'line'
                  });
                  _this.statisticsData.push({
                    Pv_Name: _this.groups[i].pvs[j].name,
                    Mean: response1.data['statisticsData']['mean'],
                    Deviation: response1.data['statisticsData']['deviation'],
                    RMS: response1.data['statisticsData']['rms'],
                    Max: response1.data['statisticsData']['max'],
                    Min: response1.data['statisticsData']['min']
                  })
                })
            }
          }
        },

        query: function () {
          this.options.yAxis = [];
          this.options.series = [];
          let pvListStr = '';
          for (let i = 0; i < this.gridData.length; i++) {
            pvListStr = pvListStr + this.gridData[i]['pvName'] + "@";
          }
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let _this = this;
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          console.log(pvListStr);
          this.$axios.get('/checkPvExistence/' + pvListStr)
            .then(function (response) {
              // console.log(response.data)
              if (response.data != null && response.data.length != 0) {
                let num = 0;
                let _response = response;
                Object.keys(response.data).forEach(function(key) {
                  // console.log(key,response.data[key]);
                  _this.options.yAxis.push({
                    title: {text: key.split('@')[1]},
                    opposite: false})

                })
                console.log(_this.options.yAxis)
                Object.keys(response.data).forEach(function(key) {
                  let t = num;
                  num++;
                  for(let i = 0; i < response.data[key].length; i++) {
                    console.log("开始请求：" + response.data[key][i])
                    _this.$axios.get('/history/name/' + response.data[key][i] + '/' + time1 + '/' + time2)
                      .then(function (response1) {
                        console.log(_response.data[key])
                        console.log(response1.data)
                        if (response1.data['channelOuts'] == null) {
                          return
                        }
                        let p = new Array();
                        for (let j = 0; j < response1.data['channelOuts'].length; j++) {
                          p.push([response1.data['channelOuts'][j].smpl_time, response1.data['channelOuts'][j].float_val]);
                        }
                        console.log("t: " + t)
                        _this.options.series.push({
                          name: _response.data[key][i],
                          data: p,
                          yAxis: t,
                          type: 'line'
                        });
                        _this.statisticsData.push({
                          Pv_Name:_response.data[key],
                          Mean:response1.data['statisticsData']['mean'],
                          Deviation:response1.data['statisticsData']['deviation'],
                          RMS:response1.data['statisticsData']['rms'],
                          Max:response1.data['statisticsData']['max'],
                          Min:response1.data['statisticsData']['min']})
                      })
                    }
                  })
                }
            });
        },
        showStatistics: function () {
          this.statisticsDialogTableVisible = true;
        },

        addGroup:function () {
          if(this.groups === null || this.groups.length === 0){
            this.groups.push({
              number:'1',
              pvs:[]
            });
            return;
          }
          this.groups.push({
            number:parseInt(this.groups[this.groups.length-1].number)+1,
            pvs:[]
          })
        },
        removeGroup:function () {
          this.groups.pop();
        },
        clearGroups:function () {
          this.groups = [{number:1,pvs:[{name:''}]}]

        }
      }
    }
</script>

<style scoped>

</style>
