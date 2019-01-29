<template>
  <el-container>
    <el-aside width="20%"  style="margin-left: 4%;margin-top: 1%">
      <el-tree :data='treeData' :props="defaultProps" @node-click="nodeClicked" >
        <span class="custom-tree-node" slot-scope="{ node, data }">
          <span>{{ node.label }}</span></span></el-tree>
    </el-aside>
    <el-main>
      <el-dialog title="Data" :visible.sync="dialogTableVisible" width="90%" align="center" >
        <div :hidden="dataLoading">
          <i class="el-icon-loading" ></i>
        </div>
        <el-row>
          <div align="center">
          <el-table :data="gridData">
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
      <el-dialog title="Statistics" :visible.sync="statisticsDialogTableVisible" align="center">
        <div :hidden="statisticsLoading">
          <i class="el-icon-loading" ></i>
        </div>
        <el-table :data="statisticsData">
          <el-table-column property="Pv_Name" label="Pv Name"></el-table-column>
          <el-table-column property="Mean" label="Mean"></el-table-column>
          <el-table-column property="Deviation" label="Deviation"></el-table-column>
          <el-table-column property="RMS" label="RMS"></el-table-column>
          <el-table-column property="Max" label="Max"></el-table-column>
          <el-table-column property="Min" label="Min"></el-table-column>
        </el-table>
      </el-dialog>
      <div class="chartDiv" style="margin-top: 1%; margin-left: auto; margin-right: auto;" align="center" v-loading="chartLoading">
        <highstock :options = 'options' style="width: 100%" ></highstock>
      </div>
      <div><div align="center">
        <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
      </div>
        <div :align="checkBoxAlign" >
          <el-checkbox-group v-model="checkedPvList" @change="handleCheckedPvListChange">
            <el-checkbox v-for="pv1 in pvList" :label="pv1.name" :key="pv1.pvname"><font size=4  style="font-family: 'Consolas';font-weight: normal; ">{{pv1.name}}</font></el-checkbox>
          </el-checkbox-group>
        </div>
      </div>
      <div class="block" style="margin-top: 1%; font-weight: bold;" align="center">
        <el-date-picker
          v-model="value5"
          type="datetimerange"
          :picker-options="pickerOptions"
          range-separator="to"
          start-placeholder="start time"
          end-placeholder="end time"
          align="right"
          >
        </el-date-picker>
      </div >
      <div style="margin-top: 1%" align="center">
        <el-button v-on:click="query" type="primary" style="background-color: #004499; border-color: #004499" :disabled="queryDisabled">Draw Line Chart</el-button>
        <el-button v-on:click="showStatistics" type="primary" style="background-color: #004499; border-color: #004499">Statistics Data</el-button>
        <el-button @click="showData" type="primary" style="background-color: #004499; border-color: #004499">View Data</el-button>
        <el-button v-on:click="downloadData" type="primary" style="background-color: #004499; border-color: #004499">Download Data</el-button>
      </div>
      <div style="margin-top: 1%" align="center" >
        <div :hidden="isHidden">
        <el-switch
          active-color="#13ce66"
          inactive-color="#696969"
          active-text="Logarithmic"
          v-model="switchValue1"
          :disabled="switchHidden1"
          @change="changeChartType"
        >
        </el-switch>
        <el-switch
          active-color="#13ce66"
          inactive-color="#696969"
          active-text="Beam Current"
          v-model="switchValue2"
          :disabled="switchHidden2"
          @change="addBeamCurrSeries">
        </el-switch>
        </div>
        <div style="width: 30%; margin-top: 10px" :hidden="progressHidden">
          <font>正在下载第{{downloadSeries}}个文件</font>
        <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" >Download Progress</el-progress>
        </div>
      </div>

    </el-main>
  </el-container>
</template>

<script>
  export default {
        name: "historicalcharts",
        data (){
          return {
            //disabled
            queryDisabled:false,
            statisticsDisabled:false,
            dataDisabled:false,
            downloadDisabled:false,

            //Loading
            statisticsLoading:true,
            dataLoading:false,
            chartLoading:false,

            checkBoxAlign:"center",

            downloadSeries:1,

            idHidden:false,
            //进度条
            progressHidden:true,
            percentage:0,
            //pv选择框
            checkAll:false,
            checkedPvList:[],
            pvList:[],
            pvList1:{},
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
              scrollbarEnabled:false,
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
                },
                plotBorderWidth: 1,
                plotBorderColor: 'grey'
              },
              noData: {
                style: {
                  fontWeight: 'bold',
                  fontSize: '15px',
                  color: '#303030'
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
                text: null
              },
              xAxis: {
                ordinal:false,
                type: 'datetime',
                dateTimeLabelFormats: {
                  millisecond: '%H:%M:%S.%L',
                  second: '%H:%M:%S',
                  minute: '%H:%M',
                  hour: '%m-%d %H:%M',
                  day: '%m-%d %H:%M',
                  week: '%m-%d %H:%M',
                  month: '%Y-%m-%d %H:%M',
                  year: '%Y'
                },
                lineColor:'black',
                step:4,
              },
              yAxis: [],
              lang: {
                downloadCSV: '下载CSV文件',
                noData:"no data"
              },
              tooltip: {
                dateTimeLabelFormats: {
                  millisecond: '%m-%d %H:%M:%S.%L',
                  second: '%m-%d %H:%M:%S',
                  minute: '%m-%d %H:%M',
                  hour: '%m-%d %H:%M',
                  day: '%Y-%m-%d %H:%M',
                  week: '%m-%d %H:%M',
                  month: '%Y-%m',
                  year: '%Y-%m-%d'
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
            switchHidden1:false,
            switchHidden2:false,

            pickerOptions: {
              shortcuts: [{
                text: '最近一天',
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24);
                  picker.$emit('pick', [start, end]);
                }
              },{
                text: '最近一周',
                onClick(picker) {
                  const end = new Date();
                  const start = new Date();
                  start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                  picker.$emit('pick', [start, end]);
                }
              }, {
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
              }]
            },
            value5: [new Date(Date.now()-3600*24*1000), new Date(Date.now())],

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
            pageSize:100,
            currentPage:1,
          }
        },
        mounted(){
          let a = [];let b = [];
          var p,tmp1,tmp2,tmp3;
          let _this = this
          this.cols = this.checkedPvList
          this.$axios
            .get(this.urlFragment  + '/pvtree')
            .then(function (response) {
              if(response.status != 200){
                _this.$notify.error({
                  title: '错误',
                  message: 'PV列表获取失败',
                  position: 'bottom-left'
                });
              }
               p= response.data;
               // console.log(p)
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
            }).catch(function (error) {
            _this.$notify.error({
              title: '错误',
              message: 'PV列表获取失败',
              position: 'bottom-left'
            });
          });
          // console.log(a)
          this.treeData = a;
        },
        methods:{
            addBeamCurrSeries:function () {
            if(this.switchValue2 === true){
              if(this.pvList[0].name === "BeamCurrent"){
                return;
              }
              let p = [];
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              console.log(date1);
              let _this = this;
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              this.$axios
                .get(this.urlFragment  + '/add/' + time1 + '/' + time2)
                .then(function (response) {
                  let n = response.data.length;
                  _this.options.yAxis.push({
                    opposite:true,
                    type: 'linear',
                    title: {
                      text: 'BeamCurrent(mA)'
                    },
                    lineColor:'grey',
                    showFirstLabel: true,
                    showLastLabel: true,
                    // tickPixelInterval:50,
                    tickPositioner: function (){
                      let n = this.tickPositions.length;
                      if(Math.abs(this.tickPositions[0]-this.tickPositions[n-1])>=150){
                        let p = this.tickPositions[n-1];
                        let interval = Math.ceil(Math.ceil(p / 4)/10)*10
                        return [0, interval, 2 * interval, 3 * interval, 4 * interval];
                      } else if(this.tickPositions[0] > 190 && this.tickPositions[n-1] < 370) {
                        return [180, 230, 280, 330, 380]
                      } else if (this.tickPositions[0] < 190 && this.tickPositions[n-1] < 400 && Math.abs(this.tickPositions[0]-this.tickPositions[n-1])>=100) {
                        return [0, 100, 200, 300, 400]
                      } else if (this.tickPositions[n-1] < 400) {
                        let p = this.tickPositions[n-1];
                        let interval = Math.ceil(Math.ceil(p / 4)/10)*10
                        return [0, interval, 2 * interval, 3 * interval, 4 * interval];
                      }else{
                        let p = this.tickPositions[n-1];
                        let interval = Math.ceil(Math.ceil(p / 4)/10)*10
                        return [0, interval, 2 * interval, 3 * interval, 4 * interval];
                      }
                    },
                    // startOnTick:false,
                    // tickAmount:5,
                    // min:180,
                    // max:380,
                    lineWidth:2
                  });
                  for (var i = 0; i < n; i++){
                    p.push([response.data[i].smpl_time,response.data[i].float_val]);
                  }
                  _this.options.series.push({
                    name: 'Beam Current',
                    data: p,
                    color: "#0055fa",
                    yAxis:1,
                    lineWidth:1.5
                  })
                })
            }else if(this.switchValue2 === false){
              if(this.pvList[0].name === "BeamCurrent"){
                return;
              }
              if(this.options.yAxis[this.options.yAxis.length - 1].title.text === "BeamCurrent(mA)") {
                this.options.yAxis.pop();
              }
              if(this.options.series[this.options.series.length - 1].name === 'Beam Current') {
                this.options.series.pop();
              }
            }
          },
            changeChartType: function () {
              if(this.switchValue1 === true) {
                // for (let i = 0; i < this.options.yAxis.length; i++){
                //   if(this.options.yAxis[i].title.text === "BeamCurrent(mA)"
                //     && this.options.yAxis[i].opposite === true){
                //     continue;
                //   }
                //   this.options.yAxis[i].type = 'logarithmic';
                //   console.log("change type")
                // }
                this.options.yAxis[0].type = 'logarithmic'
              }else if(this.switchValue1 === false){
                for (let i = 0; i < this.options.yAxis.length; i++) {
                  this.options.yAxis[i].type = 'linear';
                }
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
              this.$axios.get(this.urlFragment  + '/pvlist/BeamCurrent')
                .then(function (response) {
                  let n = response.data.length;
                  for (let i = 0; i < n; i++){
                    _this.pvList.push(response.data[i]);
                    console.log("record :" + _this.pvList)
                  }
                })
            },
            query:function() {
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$notify.error({
                  title: '错误',
                  message: '待查询PV列表为空',
                  position: 'bottom-left'
                });
                return;
              }
              this.queryDisabled = true;
              this.chartLoading = true;
              this.switchValue1 = false;
              this.switchValue2 = false;
              if (this.options.yAxis.length === 2) {
                this.options.yAxis.pop();
              }
              if (this.options.series.length > 0) {
                if (this.options.series[this.options.yAxis.length - 1].name === "BeamCurrent") {
                  this.options.series.pop();
                }
              }
              let q = new Array();
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              let _this = this;
              let checkedPvList = this.checkedPvList;
              let count = this.checkedPvList.length;
              console.log(checkedPvList)
              this.options.series = [];
              for (let i = 0; i < checkedPvList.length; i++) {
                  let pv = this.pvList1[this.checkedPvList[i]];
                  let name = this.checkedPvList[i];
                  let p = new Array();
                  this.$axios.get(this.urlFragment + "/history/name/" + pv + "/" + time1 + "/" + time2)
                    .then(function (response) {
                        if(response.status !== 200){
                          _this.$notify.error({
                            title: '错误',
                            message: 'Query failed',
                            position: 'bottom-left'
                          });
                          if(--count === 0){
                            _this.queryDisabled = false;
                            _this.chartLoading = false
                          }
                          return;
                        }
                        if(response.data == null || response.data === ""){
                          _this.$notify.error({
                            title: '错误',
                            message: 'PV ' + name + " query results set is null",
                            position: 'bottom-left'
                          });
                          if(--count === 0){
                            _this.queryDisabled = false;
                            _this.chartLoading = false
                          }
                          return;
                        }
                      if(response.data[0].float_val != null){
                        for (let i = 0; i < response.data.length; i++) {
                          p.push([response.data[i].smpl_time, response.data[i].float_val]);
                        }
                      }else {
                        for (let i = 0; i < response.data.length; i++) {
                          p.push([response.data[i].smpl_time, response.data[i].num_val]);
                        }
                      }
                        let tmp = 0;
                        if(pv === "RNG:BEAM:LIFE"){
                          _this.options.yAxis.push({
                            opposite:true,
                            type: 'linear',
                            title: {
                              text: 'LifeTime(hrs)'
                            },
                            lineColor:'grey',
                            showFirstLabel: true,
                            showLastLabel: true,
                          })
                          tmp = 1;
                        }
                      _this.options.series.push({
                        name: name,
                        data: p,
                        yAxis:tmp,
                        lineWidth:1.5
                      })
                      if(pv === "RNG:BEAM:CURR"){
                        _this.options.series[0].color = "#0055fa";
                      }
                      if(--count === 0){
                        _this.queryDisabled = false;
                        _this.chartLoading = false
                      }
                      p = [];
                    })
                    .catch(function (error) {
                      _this.chartLoading = true
                      _this.queryDisabled = false;
                    });
              }
            },
            nodeClicked:function (arg1,arg2,arg3) {
                this.isHidden = false;
                this.checkBoxAlign = "center"
                this.options.yAxis = []
                this.isIndeterminate = false;
                this.switchValue1 = false;
                this.switchValue2 = false;
                this.checkAll = false;
                this.checkedPvList = [];    //清空多选框，清空pvList列表
                let a = arg1;
                let flag = true;
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
                      // console.log(arg1[i])
                      name = arg1[i]
                    }
                  }
                    this.options.title.text = name
                    this.$axios.get(this.urlFragment  + '/pvlist/'+ name )
                    .then(function (response) {
                      if(response.status != 200){
                        _this.$notify.error({
                          title: '错误',
                          message: 'PV列表获取失败',
                          position: 'bottom-left'
                        });
                      }
                      // console.log("pv列表: " + response.data);
                      _this.pvList.length = 0;
                      if(response.data.length > 5){
                        _this.checkBoxAlign = "left"
                      }
                      for(let i = 0; i < response.data.length; i++) {
                        // console.log(response.data[i])
                        _this.pvList1[response.data[i].name] = response.data[i].pv
                        _this.pvList.push(response.data[i])
                      }
                      if(_this.pvList[0].name === "BeamCurrent"){
                        _this.isHidden = true;
                        _this.options.yAxis.push({
                          lineColor:'grey',
                          title: {text: "Current(mA)"},
                          opposite: false,lineWidth:2})
                        _this.options.yAxis.push({
                          lineColor:'grey',
                          title: {text: "LifeTime(hrs)"},
                          opposite: true,lineWidth:2})
                      }else {
                        _this.$axios.get(_this.urlFragment  + '/pvunit/' + _this.pvList[0].pv)
                          .then(function (response) {
                            _this.options.yAxis.push({
                              type:'linear',
                              lineColor:'grey',
                              title: {text: response.data},
                              opposite: false, lineWidth: 2
                            })
                          })
                      }
                    })

                }
            },
            showStatistics: function () {
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$notify.error({
                  title: '错误',
                  message: '待查询PV列表为空',
                  position: 'bottom-left'
                });
                return;
              }
              this.statisticsDialogTableVisible = true;
              this.statisticsLoading = false
              this.statisticsData = []
              let p = new Array();
              let q = new Array();
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              let _this = this;
              let checkedPvList = this.checkedPvList;
              this.options.series = [];
              let count = this.checkedPvList.length;
              for (let i = 0; i < checkedPvList.length; i++) {
                console.log('请求'  + i)
                let pv = this.pvList1[this.checkedPvList[i]];
                let name = this.checkedPvList[i];
                let p = new Array();
                this.$axios.get(this.urlFragment +  "/history/statistics/" + pv + "/" + time1 + "/" + time2)
                  .then(function (response) {
                    // console.log(response.data)
                    if(response.status != 200){
                      _this.$notify.error({
                        title: '错误',
                        message: 'PV ' + pv + " query results set failed",
                        position: 'bottom-left'
                      });
                      if (--count === 0) {
                        _this.statisticsLoading = true
                      }
                      return;
                    }
                    if(response.data == null || response.data === "") {
                      _this.$notify.error({
                        title: '错误',
                        message: 'PV ' + name + " query results set is null",
                        position: 'bottom-left'
                      });
                      if (--count === 0) {
                        _this.statisticsLoading = true
                      }
                      return;
                    }
                    // console.log(response.data)
                    _this.statisticsData.push({
                      Pv_Name:name,
                      Mean:response.data.Mean.toFixed(6),
                      Deviation:response.data.Deviation.toFixed(6),
                      RMS:response.data.RMS.toFixed(6),
                      Max:response.data.Max.toFixed(6),
                      Min:response.data.Min.toFixed(6)
                    })
                    if(--count === 0){
                      _this.statisticsLoading = true;
                    }
                  })
                  .catch(function (error) {
                    console.log('出现错误')
                      _this.$notify.error({
                        title: '错误',
                        message: 'PV ' + name + " query failed",
                        position: 'bottom-left'
                      })
                    if(--count === 0){
                      _this.statisticsLoading = true;
                    }
                    }
                  );
              }
            },
            downloadData:function () {
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$notify.error({
                  title: '错误',
                  message: '待查询PV列表为空',
                  position: 'bottom-left'
                });
                return;
              }
              this.downloadSeries = 1;
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              let name = new Date(Date.now()).format("yyyy_MM_dd_hh_mm_ss");
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              let checkedPvList = this.checkedPvList;
              let pvList = "";
              let _this = this;
              // console.log(checkedPvList);
              for (let i = 0; i < checkedPvList.length; i++) {
                let flag = false;
                let pv = "";
                let name = "";
                for (let j = 0; j < this.pvList.length; j++) {
                  if (this.pvList[j].name === checkedPvList[i]) {
                    flag = true;
                    pv = this.pvList[j].pv;
                    pvList = pvList + pv + "@";
                    name = this.pvList[j].name;
                    break;
                  }
                }
              }
              if(!(pvList == null || pvList.length == 0)){
                this.progressHidden = false
                this.$axios.get(this.urlFragment  + '/download/' + time1 +"/" + time2 + "/" + name + "/" + pvList)
                  .then(function (response) {
                  // console.log("文件名"+ response.data);
                  //   let name  = response.data;
                    let str = window.location.href;
                    //caution
                    window.open('http://' + str.split("/")[2] + '/data/download/media/'+name)
                    // window.open('http://' + '222.195.82.88:8081' + '/download/media/'+name)
                    _this.progressHidden = true;
                    clearInterval(timer);
                    _this.percentage = 0;

                });
                let timer = setInterval(getIntegralData,1000);
                function getIntegralData() {
                  _this.$axios.get(_this.urlFragment + '/download/status/' + name)
                    .then(function (response) {
                      _this.downloadSeries = response.data[0]
                        _this.percentage = response.data[1]
                    })
                }
              }
            },
            showData:function () {
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$notify.error({
                  title: '错误',
                  message: 'Please select PV to query',
                  position: 'bottom-left'
                });
                return;
              }
              this.currentPage = 1;
              this.gridData = [];
              this.dataLoading = false
              this.dialogTableVisible = true;
              this.pageNumber = 1;
              let p1 = new Array();
              let q = new Array();
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              let checkedPvList = this.checkedPvList;
              let pvList = "";
              let tmpData = new Array();
              let count = this.checkedPvList.length;
              for (let i = 0; i < this.pageSize; i++) {
                tmpData.push({})
              }
              let _this = this;
              // console.log(checkedPvList);
              for (let i = 0; i < checkedPvList.length; i++) {
                for (let j = 0; j < this.pageSize; j++) {
                  tmpData[j][checkedPvList[i]] = "";
                }
                let pv = this.pvList1[this.checkedPvList[i]];
                let name = this.checkedPvList[i];
                pvList = pvList+pv + "@";
                // console.log("i :  " + i)
              }
              this.gridData = tmpData
              this.$axios.get(this.urlFragment + "/history/page/count/" + pvList + "/" + time1 + "/" + time2)
                .then(function (response) {
                  _this.pageNumber = Math.ceil(response.data%_this.pageSize ? response.data/_this.pageSize : response.data/_this.pageSize +1);
                })
              for (let i = 0; i < checkedPvList.length; i++) {
                let pv = this.pvList1[this.checkedPvList[i]];
                let name = this.checkedPvList[i];
                let p = new Array();
                let val = 1
                this.$axios.get(this.urlFragment + "/history/page/" + val + "/" + this.pageSize + "/" + pv + "/" + time1 + "/" + time2)
                  .then(function (response) {
                    if(response.status != 200){
                      _this.$notify.error({
                        title: '错误',
                        message: 'PV ' + pv + " query results set failed",
                        position: 'bottom-left'
                      });
                      if (--count === 0) {
                        _this.dataLoading = true
                      }
                      return;
                    }else if(response.data == null || response.data === "" || response.data.length === 0) {
                      _this.$notify.error({
                        title: '错误',
                        message: 'PV ' + name + " query results set is null",
                        position: 'bottom-left'
                      });
                      if (--count === 0) {
                        _this.dataLoading = true
                      }
                      return;
                    }
                    if(response.data[0].float_val !== null) {
                      for (let j = 0; j < response.data.length; j++) {
                        let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss");
                        _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                          response.data[j].float_val.toFixed(6);
                      }
                    }else{
                      for (let j = 0; j < response.data.length; j++) {
                        let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss");
                        _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                          response.data[j].num_val.toFixed(6);
                      }
                    }
                    count--
                    if(count === 0){
                      _this.dataLoading = true;
                    }
                  })
              }
            },
            pageChange:function (val) {
              console.log('pagechange')
              this.dataLoading = true;
              this.currentPage = val;
              this.gridData = [];
              let p = new Array();
              let q = new Array();
              let date1 = new Date(this.value5[0]);
              let date2 = new Date(this.value5[1]);
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              let _this = this;
              let pvList = "";
              let tmpData = new Array();
              let count = this.checkedPvList.length;
              for (let i = 0; i < this.pageSize; i++) {
                tmpData.push({})
              }
              let checkedPvList = this.checkedPvList;
              console.log(checkedPvList)
              this.options.series = [];
              for (let i = 0; i < checkedPvList.length; i++) {
                for (let j = 0; j < this.pageSize; j++) {
                  tmpData[j][checkedPvList[i]] = "";
                }
              }
              this.gridData = tmpData;
              for (let i = 0; i < checkedPvList.length; i++) {
                let flag = false;
                let pv = this.pvList1[this.checkedPvList[i]];
                let name = this.checkedPvList[i];
                pvList = pvList+pv + "@";
                let p = new Array();
                this.$axios.get(this.urlFragment + "/history/page/" + val + "/" + this.pageSize + "/" + pv + "/" + time1 + "/" + time2)
                  .then(function (response) {
                    for (let j = 0; j < response.data.length; j++) {
                      let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss");
                      _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                        response.data[j].float_val.toFixed(6);
                    }
                    if(--count === 0){
                      _this.dataLoading = true;
                    }
                  })
              }
            },
        },
    }
</script>
<style scoped>
  .el-checkbox+.el-checkbox {
    margin-left: 0px;
  }
  .el-checkbox {
    margin-right: 25px;
  }
  div{
    margin-left: auto;
    margin-right: auto;
    font-size: small;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    font-weight: bold;
    padding-right: 8px;
  }
</style>
