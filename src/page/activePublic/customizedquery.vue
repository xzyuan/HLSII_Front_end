<template>
  <div>
    <el-row>
      <el-col :span="4" >
        <div style=" color: black;width:100%;" align="right">
          <el-card class="box-card" style="margin-top:2%;border-radius: 8px;" align="right">
          <el-tree :data='treeData' :props="defaultProps" @node-click="nodeClicked" >
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span>{{ node.label }}</span>
            </span>
          </el-tree>
          </el-card>
        </div>
      </el-col>
      <el-dialog title="Data" :visible.sync="dialogTableVisible" width="90%" align="center" >
        <div :hidden="dataLoading">
          <i class="el-icon-loading" ></i>
        </div>
        <el-row>
          <div align="center" style="color: #000;"  >
          <el-table :data="gridData" style="color: #000;" align="center">
            <el-table-column v-for = "col in checkedPvList" :property="col" :label="col" :key="col"  align="center" width="300" header-align="center"></el-table-column>
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
      <el-col :span="1"><div><p></p></div></el-col>
      <el-col :span="14"  align="center">
      <div class="chartDiv" style=" margin-top: 3%; margin-left: auto; margin-right: auto; width: 1000px;" align="center" v-loading="chartLoading">
        <highstock :options = 'options' style="width: 100%;" ></highstock>
      </div>
      <div>
        <div align="center">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
        </div>
        <div :align="checkBoxAlign" >
          <el-checkbox-group v-model="checkedPvList" @change="handleCheckedPvListChange" border="true">
            <el-checkbox v-for="pv1 in pvList" :label="pv1.name" :key="pv1.pvname" style="color: #000;"><font size=4  style="font-family: 'Consolas';font-weight: normal; ">{{pv1.name}}</font></el-checkbox>
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
        <el-button v-on:click="showStatistics" type="primary" style="background-color: #004499; border-color: #004499" :disabled="statisticsDisabled">Statistics Data</el-button>
        <el-button @click="showData" type="primary" style="background-color: #004499; border-color: #004499" :disabled="dataDisabled">View Data</el-button>
        <el-button v-on:click="downloadData" type="primary" style="background-color: #004499; border-color: #004499" :disabled="downloadDisabled">Download Data</el-button>
      </div>
      <div style="margin-top: 1%" align="center" >
        <div :hidden="switchHidden">
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
          <!--<font>正在下载第{{downloadSeries}}个PV</font>-->
          <font>downloading data of the {{downloadSeries}}st selected record</font>
        <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" >Download Progress</el-progress>
        </div>
      </div>
      </el-col>
      <el-col :span="5">
        <div><p></p></div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
  export default {
        name: "historicalcharts",
        data (){
          return {
            timer:null,

            tipDialogVivible:true,

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

            switchHidden:false,
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
              // scrollbarEnabled:false,
              chart: {
                width: 1000,
                height: 550,
                // panning: false, //禁用放大
                // pinchType: '', //禁用手势操作
                // zoomType: "",
                // panKey: 'shift',
                zoomType: 'x',
                panKey: 'shift',
                resetZoomButton: {
                  relativeTo: 'chart',
                  animation:false
                },
                // spacingBottom:200,
                plotBorderWidth: 1,
                plotBorderColor: 'grey'
              },
              colors: ['#FF0000', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
                '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
              noData: {
                style: {
                  fontWeight: 'bold',
                  fontSize: '15px',
                  color: '#303030'
                }
              },
              plotOptions: {
                series:{
                  turboThreshold:2000,
                  animation:false
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
                gridLineDashStyle:'ShortDash',
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
                enabled:false,
              },
              rangeSelector: false,
              navigator:{
                margin:40
                // enabled:false
              },
              scrollbar:{
                // enabled:false
                // height:0
              },
              legend: {
                enabled: true,
                verticalAlign: 'bottom',
                // layout: 'vertical',
                align: 'middle',
                layout:'horizontal',
                maxHeight:40
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
                  position: 'top-right',
                  offset:400
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
              position: 'top-right',
              offset:400
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
                .get(this.urlFragment  + '/history/id/149/' + time1 + '/' + time2)
                .then(function (response) {
                  let n = response.data.length;
                  _this.options.yAxis.push({
                    gridLineDashStyle:'ShortDash',
                    gridLineWidth: 0,
                    opposite:true,
                    type: 'linear',
                    title: {
                      text: 'BeamCurrent(mA)',
                      style: {
                        color:"black",
                        fontWeight:4000
                      }
                    },
                    startOnTick:false,
                    lineColor:'grey',
                    showFirstLabel: true,
                    showLastLabel: true,
                    min:0,
                    // max:380,
                    lineWidth:2
                  });
                  for (var i = 0; i < n; i++){
                    p.push([response.data[i].smpl_time,response.data[i].float_val]);
                  }
                  _this.options.series.push({
                    name: 'RNG:BEAM:CURR',
                    data: p,
                    color: "#0055fa",
                    yAxis:1,
                    lineWidth:1.5
                  })
                })
            }else if(this.switchValue2 === false){   //关闭开关
              if(this.pvList[0].name === "BeamCurrent"){
                return;
              }
              if(this.options.yAxis[this.options.yAxis.length - 1].title.text === "BeamCurrent(mA)") {
                this.options.yAxis.pop();
              }
              if(this.options.series[this.options.series.length - 1].name === 'RNG:BEAM:CURR') {
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
                  }
                })
            },
            query: function() {
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$confirm("请选择需要查询的PV","提示",{
                  showCancelButton:false,
                  showConfirmButton:false,
                })
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
              let checkedPvList = [];
              for (let i = 0; i < this.checkedPvList.length; i++){
                checkedPvList.push([this.checkedPvList[i]])
              }
              let pvList = ""
              for (let i = 0; i < checkedPvList.length; i++) {
                let flag = false;
                let pv = "";
                for (let j = 0; j < this.pvList.length; j++) {
                  console.log(checkedPvList[i][0])
                  if (this.pvList[j].name === checkedPvList[i][0]) {
                    flag = true;
                    pv = this.pvList[j].pv;
                    pvList = pvList + pv + "@";
                    checkedPvList[i].push(pv)
                    break;
                  }
                }
              }
              this.options.series = [];
              for (let i = 0; i < checkedPvList.length; i++) {
                this.options.series.push({
                  name:checkedPvList[i][1],
                  data:[],
                  yAxis: 0,
                  lineWidth: 1.5
                })
              }
              if(this.pvList[0].name === "BeamCurrent"){
                this.options.series[0].color = "#0055fa";
                if(this.checkedPvList[0] === "BeamCurrent"){
                  if(this.checkedPvList.length > 1){
                    this.options.yAxis.push({
                      opposite:true,
                      type: 'linear',
                      title: {
                        text: 'LifeTime(hrs)',
                        style: {
                          color:"black",
                          fontWeight:1000
                        }
                      },
                      gridLineWidth:0,
                      lineColor:'grey',
                      showFirstLabel: true,
                      showLastLabel: true,
                    })
                    this.options.series[1].yAxis = 1;
                    this.options.series[1].color = "#FF0000";
                  }
                }else{
                  this.options.yAxis.push({
                    opposite:false,
                    type: 'linear',
                    title: {
                      text: 'LifeTime(hrs)',
                      style: {
                        color:"black",
                        fontWeight:1000
                      }
                    },
                    gridLineWidth:0,
                    lineColor:'grey',
                    showFirstLabel: true,
                    showLastLabel: true,
                  })
                  this.options.series[0].yAxis = 1;
                  this.options.series[0].color = "#FF0000"
                }
              }
              let emptyPvList = []
              let failedPvList = []
              this.$axios.get(this.urlFragment + "/history/nameMap/" + pvList + "/" + time1 + "/" + time2)
                .then(function (response) {
                  if(response.status !== 200) {
                    _this.$confirm("查询失败","提示",{
                      showCancelButton:false,
                      showConfirmButton:false,
                    })
                    _this.queryDisabled = false;
                    _this.chartLoading = false;
                    return
                  }
                  if(response.data == null || response.data === "" || response.data.length === 0) {
                    _this.$confirm("查询结果为空","提示",{
                      showCancelButton:false,
                      showConfirmButton:false,
                    })
                    _this.queryDisabled = false;
                    _this.chartLoading = false;
                    return
                  }
                  let data = response.data;
                  for(let k = 0; k < checkedPvList.length; k++){
                    let name = checkedPvList[k][1]
                    if(data[name] === null || data[name].length === 0){
                      emptyPvList.push(name);
                      continue;
                    }
                    let p = [];
                    p.push([date1.getTime(),null])
                    if(data[name][0].float_val != null){
                      for (let i = 0; i < data[name].length; i++) {
                        p.push([data[name][i].smpl_time, data[name][i].float_val]);
                      }
                    }else {
                      for (let i = 0; i < data[name].length; i++) {
                        p.push([data[name][i].smpl_time, data[name][i].num_val]);
                      }
                    }
                    p.push([date2.getTime(),null]);
                    _this.options.series[k].data = p;
                  }
                  _this.queryDisabled = false;
                  _this.chartLoading = false;
                  alertInfo(failedPvList,emptyPvList);
                })
              function alertInfo(failedPvList, emptyPvList) {
                if(failedPvList.length !== 0){
                  let str = "";
                  for (let j = 0; j < failedPvList.length; j++) {
                    if(j < 10) {
                      str += failedPvList[j] + "\n";
                      continue
                    }
                    if(j === 10){
                      str += '等' + failedPvList.length + '个PV';
                      break;
                    }
                  }
                  _this.$notify.error({
                    title:'error',
                    message: str + "查询失败",
                    position:'top-right',
                    offset: 400,
                    duration: 0
                  })
                }
                if (emptyPvList.length !== 0){
                  let str = "";
                  for (let j = 0; j < emptyPvList.length; j++) {
                    if(j < 10) {
                      str += emptyPvList[j] + "\n";
                      continue
                    }
                    if(j === 10){
                      str += '等' + emptyPvList.length + '个PV';
                      break;
                    }
                  }
                  _this.$notify.error({
                    title:'error',
                    message:str + "查询结果为空",
                    position:'top-right',
                    offset: 400,
                    duration: 0
                  })
                }
              }
            },
            nodeClicked:function (arg1,arg2,arg3) {
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
                  clearInterval(this.timer);
                  this.value5 = []
                  this.value5.push(new Date(Date.now()-3600*24*1000))
                  this.value5.push(new Date(Date.now()))
                  this.progressHidden = true
                  this.switchHidden = false;
                  this.checkBoxAlign = "center"
                  this.options.yAxis = []
                  this.isIndeterminate = false;
                  this.switchValue1 = false;
                  this.switchValue2 = false;
                  this.checkAll = false;
                  this.queryDisabled = false
                  this.statisticsLoading = true
                  this.dataLoading = true
                  this.downloadDisabled = false
                  this.checkedPvList = [];    //清空多选框，清空pvList列表
                  this.statisticsData = [];
                  this.options.series = [];
                  this.gridData = [];
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
                          position: 'top-right',
                          offset:400,
                          duration:0
                        });
                      }
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
                        _this.switchHidden = true;
                        _this.options.yAxis.push({
                          showFirstLabel: true,
                          showLastLabel: true,
                          gridLineWidth: 0,
                          lineColor:'grey',
                          title: {
                            text: "Current(mA)",
                            style: {
                              color:"black",
                              fontWeight:1000
                            }
                          },
                          opposite: false,lineWidth:2})
                        _this.options.yAxis.push({
                          showFirstLabel: true,
                          showLastLabel: true,
                          gridLineDashStyle:'ShortDash',
                          gridLineWidth: 0,
                          lineColor:'grey',
                          title: {text: "LifeTime(hrs)"},
                          opposite: true,lineWidth:2})
                      }else {
                        _this.$axios.get(_this.urlFragment  + '/pvunit/' + _this.pvList[0].pv)
                          .then(function (response) {
                            _this.options.yAxis.push({
                              showFirstLabel: true,
                              showLastLabel: true,
                              gridLineDashStyle:'ShortDash',
                              gridLineWidth: 0,
                              type:'linear',
                              lineColor:'grey',
                              title: {
                                text: response.data,
                                style: {
                                  color:"black",
                                  fontWeight:1000
                                }
                              },
                              opposite: false, lineWidth: 2
                            })
                          })
                      }
                    })

                }
            },
            showStatistics: function () {
              let a = 0.011617911222
              console.log(a.toPrecision())
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$confirm("请选择需要查询的PV","提示",{
                  showCancelButton:false,
                  showConfirmButton:false,
                })
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
              let count = this.checkedPvList.length;
              let failedPvList = []
              let emptyPvList = []
              for (let i = 0; i < checkedPvList.length; i++) {
                let pv = this.pvList1[this.checkedPvList[i]];
                let name = this.checkedPvList[i];
                let p = new Array();
                this.statisticsData.push({
                  Pv_Name:name,
                  Mean:null,
                  Deviation:null,
                  RMS:null,
                  Max:null,
                  Min:null
                })
                this.$axios.get(this.urlFragment +  "/history/statistics/" + pv + "/" + time1 + "/" + time2)
                  .then(function (response) {
                    if(response.status != 200){
                      failedPvList.push(pv)
                      if (--count === 0) {
                        if(failedPvList.length !== 0){
                          let str = "  ";
                          for (let j = 0; j < failedPvList.length; j++) {
                            str += failedPvList[j] + "  ";
                          }
                          _this.$notify.error({
                            title:'error',
                            message:'查询' + failedPvList + "失败",
                            position:'top-right',
                            offset: 400,
                            duration:0
                          })
                        }
                        if (emptyPvList.length !== 0){
                          for (let j = 0; j < emptyPvList.length; j++) {
                            str += emptyPvList[j] + "  ";
                          }
                          _this.$notify.error({
                            title:'error',
                            message:emptyPvList + "查询结果为空",
                            position:'top-right',
                            offset: 400,
                            duration:0
                          })
                        }
                        _this.statisticsLoading = true
                      }
                      return;
                    }
                    if(response.data == null || response.data === "") {
                      emptyPvList.push(pv)
                      if (--count === 0) {
                        alertInfo(failedPvList,emptyPvList)
                        _this.statisticsLoading = true
                      }
                      return;
                    }
                    for(let o in _this.statisticsData[i]){
                      if (o !== 'Pv_Name') {
                        console.log(o)
                        if(Math.abs(response.data[o]) < 0.1) {
                          if(o === 'Deviation'){
                            console.log(response.data[o].classNames)
                          }
                          _this.statisticsData[i][o] = response.data[o].toPrecision(6)
                        } else {
                          _this.statisticsData[i][o] = response.data[o].toFixed(6)
                        }
                      }
                    }
                    // _this.statisticsData[i].Mean = response.data.Mean
                    // _this.statisticsData[i].Deviation = response.data.Deviation
                    // _this.statisticsData[i].RMS = response.data.RMS
                    // _this.statisticsData[i].Max = response.data.Max
                    // _this.statisticsData[i].Min = response.data.Min
                    if(--count === 0){
                      alertInfo(failedPvList,emptyPvList)
                      _this.statisticsLoading = true;
                    }
                  })
                  .catch(function (error) {
                      failedPvList.push(pv)
                    if(--count === 0){
                      alertInfo(failedPvList,emptyPvList)
                      _this.statisticsLoading = true;
                    }
                    }
                  );
              }

              function alertInfo(failedPvList,emptyPvList) {
                if(failedPvList.length !== 0){
                  let str = "";
                  for (let j = 0; j < failedPvList.length; j++) {
                    if(j < 10) {
                      str += failedPvList[j] + "\n";
                      continue
                    }
                    if(j === 10){
                      str += '等' + failedPvList.length + '个PV';
                      break;
                    }
                  }
                  _this.$notify.error({
                    title:'error',
                    message:'查询' + str + "失败",
                    position:'top-right',
                    offset: 400,
                    duration: 0
                  })
                }
                if (emptyPvList.length !== 0){
                  let str = "";
                  for (let j = 0; j < emptyPvList.length; j++) {
                    if(j < 10) {
                      str += emptyPvList[j] + "\n";
                      continue
                    }
                    if(j === 10){
                      str += '等' + emptyPvList.length + '个PV';
                      break;
                    }
                  }
                  _this.$notify.error({
                    title:'error',
                    message:str + "查询结果为空",
                    position:'top-right',
                    offset: 400,
                    duration: 0
                  })
                }
              }
            },
            downloadData:function () {
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$confirm("请选择需要下载的PV","提示",{
                  showCancelButton:false,
                  showConfirmButton:false,
                })
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
              this.downloadDisabled = true;
              this.$confirm("正在计算文件大小和下载时间","提示",{
                showCancelButton:false,
                showConfirmButton:false,
                closeOnClickModal:false,
                closeOnPressEscape:false,
                closeOnHashChange:false
              })
              this.$axios.get(_this.urlFragment  + '/download/' + pvList + "/" + time1 +"/" + time2)
                .then(function (response) {
                  _this.$msgbox.close()
                  _this.$confirm("Estimated file size: " + (response.data/30000).toFixed(3) + "M, download time:" + (response.data/40000).toFixed(2) + "s， continue?","Tips",{
                    confirmButtonText: 'confirm',
                    cancelButtonText: 'cancel',
                    type: 'warning'
                  }).then(() => {
                    if(!(pvList == null || pvList.length == 0)){
                      _this.downloadDisabled = true;
                      _this.progressHidden = false;
                      _this.$notify.info({
                        title:'提示',
                        message:'正在下载中，请勿离开当前页面',
                        position: 'top-right',
                        offset:400
                      })
                      _this.$axios.get(_this.urlFragment  + '/download/' + time1 +"/" + time2 + "/" + name + "/" + pvList)
                        .then(function (response) {
                          let str = window.location.href;
                          window.open('http://' + str.split("/")[2] + '/data/download/media/'+response.data)
                          // window.open('http://' + '222.195.82.88:8081' + '/download/media/'+response.data)
                          _this.progressHidden = true;
                          _this.downloadDisabled = false
                          clearInterval(_this.timer);
                          _this.percentage = 0;
                        });
                      _this.timer = setInterval(getIntegralData,1000);
                      function getIntegralData() {
                        _this.$axios.get(_this.urlFragment + '/download/status/' + name)
                          .then(function (response) {
                            _this.downloadSeries = response.data[0]
                            _this.percentage = response.data[1]
                          })
                      }
                    }
                  }).catch(() => {
                    _this.progressHidden = true
                    _this.downloadDisabled = false
                  })
                })
            },
            showData:function () {
              if(this.checkedPvList === null || this.checkedPvList.length === 0){
                this.$confirm("请选择需要查询的PV","提示",{
                  showCancelButton:false,
                  showConfirmButton:false,
                })
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
                      // _this.$notify.error({
                      //   title: '错误',
                      //   message: 'PV ' + pv + " 查询失败",
                      //   position: 'top-right',
                      //   offset:400
                      // });
                      if (--count === 0) {
                        _this.dataLoading = true
                      }
                      return;
                    }else if(response.data == null || response.data === "" || response.data.length === 0) {
                      // _this.$notify.error({
                      //   title: '错误',
                      //   message: 'PV ' + name + " 查询结果为空",
                      //   position: 'top-right',
                      //   offset:400
                      // });
                      if (--count === 0) {
                        _this.dataLoading = true
                      }
                      return;
                    }
                    if(response.data[0].float_val !== null) {
                      for (let j = 0; j < response.data.length; j++) {
                        let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss.S");
                        if (Math.abs(response.data[j].float_val) < 0.1) {
                          console.log(time.toString().length)
                          _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                            response.data[j].float_val.toPrecision(6);
                        } else {
                          console.log(time.toString().length)
                          _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                            response.data[j].float_val.toFixed(6);
                        }
                      }
                    }else{
                      for (let j = 0; j < response.data.length; j++) {
                        let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss.S");
                        _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                          response.data[j].num_val.toPrecision(6);
                      }
                    }
                    if(--count === 0){
                      _this.dataLoading = true;
                    }
                  })
              }
            },
            pageChange:function (val) {
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
                    if(response.data[0].float_val !== null) {
                      for (let j = 0; j < response.data.length; j++) {
                        let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss.S");
                        if (Math.abs(response.data[j].float_val) < 0.1) {
                          console.log(time.toString().length)
                          _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                            response.data[j].float_val.toPrecision(6);
                        } else {
                          console.log(time.toString().length)
                          _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                            response.data[j].float_val.toFixed(6);
                        }
                      }
                    } else {
                      for (let j = 0; j < response.data.length; j++) {
                        let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss.S");
                        _this.gridData[j][checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                          response.data[j].num_val.toPrecision(6);
                      }
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
    color: #000;
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
    color:#000000;
    font-weight: bold;
    padding-right: 8px;
  }

</style>
