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
    <div class="chartDiv" style="margin-top: 2%" align="center">
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
      <el-button @click="dialogTableVisible = true" type="primary">View Data</el-button>
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
          pageSize:50,
          currentPage:1,
          pickerOptions: {
            shortcuts: [{
              text: '最近30天',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: '最近90天',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit('pick', [start, end]);
              }
            },{
              text: '最近一年',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 365);
                picker.$emit('pick', [start, end]);
              }
            }]
          },
          value5: [new Date(Date.now()-3600*24*1000*24), new Date(Date.now())],
          options: {
            chart: {
              width: 1000,
              height: 400,
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
            plotOptions: {
              series:{
                turboThreshold:10000
              },
              line: {
                dataGrouping: {
                  enabled: false
                }
              }
            },
            title: {
              text: 'Integral Current'
            },
            xAxis: {
              ordinal:false,
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
              step:10,
              showFirstLabel:true,
              showLastLabel:true,
              opposite:false,
              type: 'linear',
              title: {
                text: 'A*h'
              },
              lineWidth:1
            },{
              opposite:true,
              lineWidth:1
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
              name:'integral current',
              data:[],
              lineWidth:1,
              yAxis:0,
              color: "#FF0000",
              showInLegend:false
            }]
          },
          dialogTableVisible: false,
          gridData: [],

          statisticsDialogTableVisible:false,
          statisticsData:[]
        }
      },
      mounted(){
        let p = new Array();
        let q = new Array();
        let n;
        let date1 = new Date(this.value5[0]);
        let date2 = new Date(this.value5[1]);
        let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
        let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
        let _this = this
        // console.log('/integral/'+time1+'/'+time2)
        this.$axios.get(this.urlFragment + '/integral/'+time1+'/'+time2).then(function (response){
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
          this.$axios.get(this.urlFragment + '/integral/'+time1+'/'+time2).then(function (response){
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
        pageChange:function (val) {
          this.currentPage = val;
        }
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
