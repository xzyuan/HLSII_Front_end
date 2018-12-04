<template>
  <el-container>
    <el-aside width="20%"  style="margin-left: 4%;margin-top: 1%">
      <el-tree :data='treeData' :props="defaultProps" @node-click="nodeClicked"></el-tree>
    </el-aside>
    <el-main>
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
      <div class="chartDiv" style="margin-top: 1%; margin-left: auto; margin-right: auto">
        <highstock :options = 'options' style="width: 80%"></highstock>
      </div>
      <div align="center">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        <div style=""></div>
        <el-checkbox-group v-model="checkedPvList" @change="handleCheckedPvListChange">
          <el-checkbox v-for="pv1 in pvList" :label="pv1.name" :key="pv1.pvname">{{pv1.name}}</el-checkbox>
        </el-checkbox-group>
      </div>
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
        name: "historicalcharts",
        data (){
          return {
            //pv选择框
            checkAll:false,
            checkedPvList:[],
            pvList:[],
            isIndeterminate: false,

            //pv树形导航栏
            treeData:[],
            defaultProps: {
              children: 'children',
              label: 'label'
            },
            //路由跳转时是否需要锁定在Dose页面
            lockDose:false,

            //图表属性
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
            gridData: [{
              BeanCurrent:"asd",
              LifeTime:"asd"
            }],

            statisticsDialogTableVisible:false,
            statisticsData:[],

            //分页属性
            //使用懒加载，加载一页，显示一页
            pageNumber:0,
            pageSize:30,
            currentPage:1,
          }
        },
        mounted(){
          console.log(this.$route.query)
          if(this.$route.query.name === 'lockDose'){
            this.lockDose = true;
          }
          let a = [];let b = [];
          var p,tmp1,tmp2,tmp3;
          this.cols = this.checkedPvList
          this.$axios
            .get('/data/pvtree')
            .then(function (response) {
               p= response.data;
               console.log(p)
              for (var i in p){
                if(!p.hasOwnProperty(p[i])) {
                  tmp1 = {label:i,children:[],pvname:i};
                  if(p[i] != {} && p[i] != null){
                    for(var j in p[i]){
                      if(!p[i].hasOwnProperty(p[i][j])){
                        tmp2 = {label:j,children:[],pvname:i+'_'+j};
                        for(var k = 0; k < p[i][j].length; k++){
                          tmp2.children.push({label:p[i][j][k],pvname:i + '_' + j + '_' + p[i][j][k]})
                        }
                      tmp1.children.push(tmp2);
                      }
                    }
                  }
                  a.push(tmp1);
                }
              }
            });
          // console.log(a)
          this.treeData = a;
          let _this = this;
          if(this.lockDose === true){
            this.statisticsData = [];
            this.options.series = [];
            this.gridData = [];
            this.$axios.get('/data/pvlist/SR_BeamMonitor_Dose')
              .then(function (response) {
                // console.log("pv列表: " + response.data);
                _this.pvList.length = 0;
                for(let i = 0; i < response.data.length; i++) {
                  // console.log(response.data[i])
                  _this.pvList.push(response.data[i])
                }
              })
          }

        },
        methods:{
            addBeamCurrSeries:function () {
            if(this.switchValue2 === true){
              let p = [];
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              console.log(date1);
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              this.$axios
                .get('/add/' + time1 + '/' + time2)
                .then(function (response) {
                  let n = response.data.length;
                  for (var i = 0; i < n; i++){
                    p.push([response.data[i].smpl_time,response.data[i].float_val]);
                  }
                  console.log(p);
                })
              this.options.series.push({
                name: 'Beam Current',
                data: p,
                yAxis:1
              })
            }else if(this.switchValue2 === false){
              this.options.series.pop();
            }
          },
            changeChartType: function () {
            console.log("1111111")
            if(this.switchValue1 === true) {
              for (let i = 0; i < this.options.yAxis.length; i++){
                this.options.yAxis[i].type = 'logarithmic';
              }
              console.log(this.options.yAxis)
            }else if(this.switchValue1 === false){
              for (let i = 0; i < this.options.yAxis.length; i++) {
                this.options.yAxis[i].type = 'linear';
              }
              console.log(this.options.yAxis)
            }
          },
            handleCheckAllChange:function(val){
              let a = new Array();
              if(val === true){
                for (let i = 0; i < this.pvList.length; i++) {
                  a.push(this.pvList[i].name)
                }
              }
              this.checkedPvList = val ? a : [];
              this.isIndeterminate = false;
            },
            handleCheckedPvListChange:function (val) {
            let checkedCount = val.length;
            this.checkAll = checkedCount === this.pvList.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.pvList.length;
            // console.log(this.checkedPvList)
            },
            changePvList:function(){
              let _this = this;
              this.$axios.get('/data/pvlist/BeamCurrent')
                .then(function (response) {
                  let n = response.data.length;
                  for (let i = 0; i < n; i++){
                    _this.pvList.push(response.data[i]);
                    console.log("record :" + _this.pvList)
                  }
                })
            },
            query:function(){
              this.statisticsData = []
              let p = new Array();
              let q = new Array();
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              console.log("5  "  + this.value5[0])
              console.log("date1  " + date1)
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              let _this = this;
              let checkedPvList = this.checkedPvList;
              console.log(checkedPvList)
              this.options.series = [];
              for (let i = 0; i < checkedPvList.length; i++) {
                  let flag = false;
                  let pv = "";
                  let name = "";
                  for(let j = 0; j < this.pvList.length; j++){
                    if(this.pvList[j].name === checkedPvList[i]){
                        flag = true;
                        pv = this.pvList[j].pv;
                        name = this.pvList[j].name;
                        // console.log(pv + "  " + name)
                        break;
                    }
                  }
                  if(flag === false){ break;}
                  let p = new Array();
                  this.$axios.get("/data/history/name/" + pv + "/" + time1 + "/" + time2)
                    .then(function (response) {
                        console.log(response.data)
                        if(response.data['channelOuts'] == null){return}
                        for(let i = 0; i < response.data['channelOuts'].length; i++){
                          p.push([response.data['channelOuts'][i].smpl_time,response.data['channelOuts'][i].float_val]);
                        }
                      _this.options.series.push({
                        name: name,
                        data: p,
                        yAxis:0
                      })
                      p = [];
                      // console.log("series" + _this.options.series)
                      _this.statisticsData.push({
                        Pv_Name:name,
                        Mean:response.data['statisticsData']['mean'],
                        Deviation:response.data['statisticsData']['deviation'],
                        RMS:response.data['statisticsData']['rms'],
                        Max:response.data['statisticsData']['max'],
                        Min:response.data['statisticsData']['min']})
                    });
              }
            },
            nodeClicked:function (arg1,arg2,arg3) {
                this.isIndeterminate = false;
                this.switchValue1 = false;
                this.switchValue2 = false;
                this.checkAll = false;
                this.checkedPvList = [];    //清空多选框，清空pvList列表
                let a = arg1;
                let flag = true
                for(var i in arg1){
                   if(i == "children" && arg1[i].length != 0){
                      flag = false;
                   }
                }
                let name ;
                let _this = this;
                if(flag == true) {
                  this.statisticsData = [];
                  this.options.series = [];
                  this.gridData = []
                  for (let i in arg1) {
                    if (i == "pvname") {
                      console.log(arg1[i])
                      name = arg1[i]
                    }
                  }
                    this.options.title.text = name
                    this.$axios.get('/data/pvlist/'+ name )
                    .then(function (response) {
                      // console.log("pv列表: " + response.data);
                      _this.pvList.length = 0;
                      for(let i = 0; i < response.data.length; i++) {
                        // console.log(response.data[i])
                        _this.pvList.push(response.data[i])
                      }
                    })
                }
            },
            showStatistics: function () {
              this.statisticsDialogTableVisible = true;
            },
            downloadData:function () {
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              console.log("5  "  + this.value5[0])
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              let checkedPvList = this.checkedPvList;
              let pvList = "";
              console.log(checkedPvList);
              for (let i = 0; i < checkedPvList.length; i++) {
                let flag = false;
                let pv = "";
                let name = "";
                for (let j = 0; j < this.pvList.length; j++) {
                  if (this.pvList[j].name === checkedPvList[i]) {
                    flag = true;
                    pv = this.pvList[j].pv;
                    pvList = pvList+pv + "@";
                    name = this.pvList[j].name;
                    // console.log(pv + "  " + name)
                    break;
                  }
                }
                console.log("i :  " + i)
              }
              console.log(pvList.length)
              if(!(pvList == null || pvList.length == 0)){
                console.log("开始下载")
                this.$axios.get('/data/download/' + time1 +"/" + time2 + "/" + pvList).then(function (response) {
                  console.log("文件名"+ response.data);
                    let name  = response.data;
                    let str = window.location.href;
                    window.open('http://' + str.split("/")[2] + '/data/download/media/'+name)
                });
              }
            },
            showData:function () {
              this.currentPage = 1;
              this.gridData = [];
              this.dialogTableVisible = true;
              let maxLength = 0;
              let length;
              for(let i = 0; i < this.options.series.length; i++){
                length = this.options.series[i]['data'].length
                if(maxLength < length){
                  maxLength = length;
                };
              }
              console.log("maxLength:" + maxLength)
              this.pageNumber = Math.ceil(maxLength%this.pageSize ? maxLength/this.pageSize : maxLength/this.pageSize +1);
              this.gridData = [];
              let tmp;
              let p,time;
              for(let i = 0;  i < 30; i++){
                tmp = {}
                // console.log(this.options.series[0]['data'])
                for(let j = 0; j < this.options.series.length; j++) {
                  time = new Date(this.options.series[j]['data'][(this.currentPage - 1) * this.pageSize + i][0]).format("yyyy-MM-dd hh:mm:ss")
                  p = time + "\r\n\r\r\r\n" +
                      this.options.series[j]['data'][(this.currentPage - 1) * this.pageSize + i][1]
                  tmp[this.options.series[j]['name']] = p;
                }
                this.gridData.push(tmp);
                tmp = {};
              }
              // console.log("data: " + this.gridData)
            },
            pageChange:function (val) {
              this.currentPage = val;
              this.gridData = [];
              let tmp,p,time;
              for(let i = 0;  i < 30; i++){
                tmp = {}
                for(let j = 0; j < this.options.series.length; j++) {
                  console.log(this.options.series[j]['data'].length);
                  if(this.options.series[j]['data'].length < (this.currentPage - 1) * this.pageSize + i+1){
                    console.log("不存在")
                    continue;
                  }
                  time = new Date(this.options.series[j]['data'][(this.currentPage - 1) * this.pageSize + i][0]).format("yyyy-MM-dd hh:mm:ss")
                  p = time + "\r\n" +
                    this.options.series[j]['data'][(this.currentPage - 1) * this.pageSize + i][1]
                  tmp[this.options.series[j]['name']] = p;
                }
                this.gridData.push(tmp);
              }
              console.log("data: " + this.gridData)
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
</style>
