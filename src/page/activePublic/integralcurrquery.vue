<template>
  <div id="main">
    <el-dialog title="Integral Current" :visible.sync="dialogTableVisible" align="center">
      <el-row>
      <el-table :data="gridData.slice((currentPage-1)*pageSize,currentPage*pageSize)" width="60%"  align="center" >
        <el-table-column property="curr_date" label="date" width="150" style=" align:center;"></el-table-column>
        <el-table-column property="val" label="value" width="200" style=" align:center;"></el-table-column>
      </el-table>
      </el-row>
      <el-row>
        <div align="center">
        <span class="demonstration" align="center">page select</span>
        <el-pagination
          layout="prev, pager, next,jumper"
          :page-count="pageNumber"
          :current-page.sync="currentPage"
          @current-change="pageChange"
          align="center">
        </el-pagination>
        </div>
      </el-row>
    </el-dialog>
    <el-dialog title="Statistics" :visible.sync="statisticsDialogTableVisible" align="center">
      <el-table :data="statisticsData">
        <el-table-column property="Pv Name" label="Pv Name"></el-table-column>
        <el-table-column property="Mean" label="Mean"></el-table-column>
        <el-table-column property="Deviation" label="Deviation"></el-table-column>
        <el-table-column property="RMS" label="RMS"></el-table-column>
        <el-table-column property="Max" label="Max"></el-table-column>
        <el-table-column property="Min" label="Min"></el-table-column>
      </el-table>
    </el-dialog>
    <div class="chartDiv" style="margin-top: 2%">
      <highstock :options = 'options' style="width: 60%"></highstock>
    </div>
    <div class="block" style="margin-top: 2%" align="center">
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
    </div>
    <div style="margin-top: 2%" align="center">
      <el-button v-on:click="query" type="primary">Draw Line Chart</el-button>
      <el-button v-on:click="showStatistics" type="primary">Statistics Data</el-button>
      <el-button @click="dialogTableVisible = true" type="primary">View Data</el-button>
      <el-button v-on:click="" type="primary">Download Data</el-button>
    </div>
    <div style="margin-top: 1%" align="center">
      <el-switch
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="Logarithmic"
        v-model="switchValue1"
        @change="changeChartType"
      >
      </el-switch>
      <el-switch
        active-color="#13ce66"
        inactive-color="#ff4949"
        active-text="Beam Current"
        v-model="switchValue2"
        @change="addBeamCurrSeries">
      </el-switch>
    </div>
  </div>
</template>

<script>
    import FileSaver from 'file-saver'
    import XLSX from 'xlsx'
    export default {
      name: "integralcurrquery",
      chartSettings: {
        labelMap: {}
      },
      data() {
        return {
          pageNumber:0,
          pageSize:30,
          currentPage:1,
          switchValue1:false,
          switchValue2:false,
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
          value5: [new Date(Date.now()-3600*24*1000), new Date(Date.now())],
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
              text: 'Integral Current'
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
            yAxis: {
              opposite:false,
              type: 'linear',
              title: {
                text: 'Integral Current'
              }
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
            series:[{
              name:'integral current',
              data:[],
              lineWidth:2
            }]
          },
          dialogTableVisible: false,
          gridData: [],

          statisticsDialogTableVisible:false,
          statisticsData:[]
        }
      },
      methods:{
        query: function () {
          let p = new Array();
          let q = new Array();
          let n;
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          let _this = this
          // console.log('/integral/'+time1+'/'+time2)
          this.$axios.get('/data/integral/'+time1+'/'+time2).then(function (response){
            n = response.data.length;
            for (var i = 0; i < n; i++){
              p.push([response.data[i].curr_date,response.data[i].val]);
              q.push({
                curr_date:(new Date(response.data[i].curr_date)).format("yyyy-MM-dd hh:mm:ss").toString(),
                val:response.data[i].val
              })
            }
            _this.options.series[0].data=p;
            _this.gridData = q;
            // console.log("n: " + n)
            _this.pageNumber = Math.ceil(n%_this.pageSize ? n/_this.pageSize : n/_this.pageSize +1);
            // console.log("gridData:" + _this.gridData);
            // console.log('pageNumber: '+ _this.pageNumber);
          });
        },
        changeChartType: function () {
          if(this.switchValue1 == true && this.options.yAxis.type == 'linear') {
            this.options.yAxis.type = 'logarithmic';
          }else if(this.switchValue1 == false && this.options.yAxis.type == 'logarithmic'){
            this.options.yAxis.type = 'linear';
          }
        },
        addBeamCurrSeries:function () {
          if(this.switchValue2 === true && this.options.series.length === 1){
            let p = [];
            let date1 = new Date(this.value5[0]);
            let date2 = new Date(this.value5[1]);
            let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
            let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
            this.$axios
              .get('/data/add/' + time1 + '/' + time2)
              .then(function (response) {
                  let n = response.data.length;
                  for (var i = 0; i < n; i++){
                      p.push([response.data[i].smpl_time,response.data[i].float_val]);
                  }
              })
            this.options.series.push({
              name: 'Beam Current',
              data: p
            })
          }else if(this.switchValue2 === false && this.options.series.length === 2){
            this.options.series.pop();
          }
        },
        pageChange:function (val) {
          this.currentPage = val;
        },
        showStatistics: function () {
          this.statisticsDialogTableVisible = true;
        },
      }
    }
</script>

<style scoped>
    div{
      margin-left: auto;
      margin-right: auto;
      font-size: small;
    }
    .el-table-column{
      align:center;
    }
</style>
