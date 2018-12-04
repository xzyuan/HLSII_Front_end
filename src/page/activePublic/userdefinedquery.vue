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
    <el-aside width="20%"  style="margin-left: 4%;margin-top: 1%">
        <el-table :data="gridData" :show-header="showHeader" :hidden="isHidden">
          <el-table-column property="pvName" label="pvList" align="center" ></el-table-column>
          <el-table-column label="Delete" align="center">
            <template slot-scope="scope">
              <el-button @click.native.prevent="handleClick(scope.$index, gridData)" type="text" size="small">delete</el-button>
            </template>
          </el-table-column>
        </el-table>
          <div align="center">
            <el-input v-model="input" placeholder="请输入PVNAME" style="width: 60%;"></el-input>
            <el-button type="primary" v-on:click="addPV">add</el-button>
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
          <el-button v-on:click="query" type="primary">Draw Line Chart</el-button>
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
        data(){
          return {
            input:'',
            showHeader:true,
            gridData:[],
            isHidden:false,
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
              yAxis: [{
                opposite:false,
                type: 'linear',
                title: {
                  text: null
                }
              },
                {opposite:true,
                  type: 'linear',
                  title: {
                    text: "Beam Current"
                  }}],
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
              series:[]
            },
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
            value5: [new Date(Date.now()-3600*1*1000), new Date(Date.now())],

            dialogTableVisible: false,

            statisticsDialogTableVisible:false,
            statisticsData:[],

            //分页属性
            //使用懒加载，加载一页，显示一页
            pageNumber:0,
            pageSize:30,
            currentPage:1,
          }
        },
        methods:{
          addPV: function () {
            if(this.input === ''){return}
            this.gridData.push({
              pvName:this.input
            });
            this.isHidden = false
            this.input = ''
          },
          handleClick(index, rows) {
            rows.splice(index, 1);
          }
        }
    }
</script>

<style scoped>

</style>
