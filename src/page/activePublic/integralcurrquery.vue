<template>
  <div id="main">
    <el-dialog title="Integral Current" :visible.sync="dialogTableVisible" align="center">
      <el-row>
        <!--gridData.slice((currentPage-1)*pageSize,currentPage*pageSize)-->
      <el-table :data="gridData" width="60%"  align="center" >
        <el-table-column property="curr_date" label="Time" width="150" align="center"></el-table-column>
        <el-table-column property="val" label="A*Hour" width="200" align="center"></el-table-column>
      </el-table>
      </el-row>
      <div>
        <span style="color: #004499; font-size: 20px;">Total integral current:  {{totalValue}}</span>
      </div>
    </el-dialog>
    <div class="chartDiv" style="margin-top: 2%" align="center">
      <highstock :options = 'options' style="width: 60%"></highstock>
    </div>
    <div class="block" style="margin-top: 2%" align="center">
      <!--<span class="demonstration">选择查询时间段</span><br/>-->
      <el-date-picker
        v-model="value5"
        type="daterange"
        align="right"
        unlink-panels
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions2">
      </el-date-picker>
    </div>
    <div style="margin-top: 2%" align="center">
      <el-button v-on:click="query" type="primary" style="background-color: #004499; border-color: #004499">Draw Line Chart</el-button>
      <el-button @click="showData" type="primary" style="background-color: #004499; border-color: #004499">View Data</el-button>
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
          totalValue:0,
          pageNumber:0,
          pageSize:50,
          currentPage:1,
          pickerOptions2: {
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
          value5: [new Date(Date.now()-3600*24*1000*30), new Date(Date.now())],
          options: {
            chart: {
              width: 1000,
              height: 500,
              zoomType: 'x',
              resetZoomButton: {
                position: {
                  // align: 'right', // by default
                  // verticalAlign: 'top', // by default
                  x: 0,
                  y: -30
                },
                relativeTo: 'chart',
                animation:false
              },
              plotBorderWidth: 2,
              plotBorderColor: 'grey'
            },
            plotOptions: {
              animation:false,
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
              lineWidth:1,
              gridLineDashStyle:'ShortDash',
              lineColor:'grey',
              gridLineWidth: 1,
              ordinal:false,
              title:{
                text:'Time',
                style: {
                  color:"black",
                  fontWeight:1000
                }
              },
              type: 'datetime',
              dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%m-%d',
                week: '%m-%d',
                month: '%Y-%m-%d',
                year: '%Y'
              }
            },
            yAxis: [{
              step:10,
              showFirstLabel:true,
              showLastLabel:true,
              opposite:false,
              type: 'linear',
              lineColor:'grey',
              title: {
                text: 'A*h'
              },
              lineWidth:2
            },{
              opposite:true,
              lineWidth:2,
              lineColor:'grey',
            }],
            tooltip: {
              dateTimeLabelFormats: {
                millisecond: '%H:%M:%S.%L',
                second: '%H:%M:%S',
                minute: '%H:%M',
                hour: '%H:%M',
                day: '%Y-%m-%d',
                week: '%m-%d',
                month: '%Y-%m-%d',
                year: '%Y'
              }
            },
            credits: {
              enabled:false,
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
        let time1 = new Date(date1.format("yyyy-MM-dd") + " 00:00:00").format('yyyy-MM-dd hh:mm:ss')
        let time2 = new Date(date2.format("yyyy-MM-dd") + " 00:00:00").format('yyyy-MM-dd hh:mm:ss')
        let _this = this
        // console.log('/integral/'+time1+'/'+time2)
        this.$axios.get(this.urlFragment + '/integral/'+time1+'/'+time2).then(function (response){
          n = response.data.length;
          for (var i = 0; i < n; i++){
            p.push([response.data[i].curr_date,response.data[i].val]);
          }
          _this.options.series[0].data=p;
        });
      },
      methods:{
        query: function () {
          let p = new Array();
          let q = new Array();
          let n;
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let time1 = new Date(date1.format("yyyy-MM-dd") + " 00:00:00").format('yyyy-MM-dd hh:mm:ss')
          let time2 = new Date(date2.format("yyyy-MM-dd") + " 00:00:00").format('yyyy-MM-dd hh:mm:ss')
          let _this = this
          // console.log('/integral/'+time1+'/'+time2)
          this.$axios.get(this.urlFragment + '/integral/'+time1+'/'+time2).then(function (response){
            n = response.data.length;
            for (var i = 0; i < n; i++){
              p.push([response.data[i].curr_date,response.data[i].val]);
            }
            _this.options.series[0].data=p;
          });
        },
        showData:function () {
         this.dialogTableVisible = true;
          let p = new Array();
          let q = new Array();
          let n;
          let total = 0;
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let time1 = new Date(date1.format("yyyy-MM-dd") + " 00:00:00").format('yyyy-MM-dd hh:mm:ss')
          let time2 = new Date(date2.format("yyyy-MM-dd") + " 00:00:00").format('yyyy-MM-dd hh:mm:ss')
          let _this = this
          this.$axios.get(this.urlFragment + '/integral/'+time1+'/'+time2).then(function (response){
            n = response.data.length;
            for (var i = 0; i < n; i++){
              q.push({
                curr_date:(new Date(response.data[i].curr_date)).format("yyyy-MM-dd").toString(),
                val:response.data[i].val.toFixed(6)
              })
            }
            _this.gridData = q;
            for (var i = 0; i < n; i++){
              total += response.data[i].val;
            }
            _this.totalValue = total.toFixed(6);
          });
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
