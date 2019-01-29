<template>
  <el-container>
    <el-dialog title="Data" :visible.sync="dialogTableVisible" width="90%" align="center">
      <el-row>
        <div align="center">
          <el-table :data="gridData" >
            <el-table-column v-for = "col in checkedPvList" :property="col" :label="col" :key="col" width="250%" align="center"></el-table-column>
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
    <el-dialog title="Statistics" :visible.sync="statisticsDialogTableVisible" width="90%" align="center">
      <el-table :data="statisticsData" align="center">
        <el-table-column property="Pv_Name" label="Pv Name"></el-table-column>
        <el-table-column property="Mean" label="Mean"></el-table-column>
        <el-table-column property="Deviation" label="Deviation"></el-table-column>
        <el-table-column property="RMS" label="RMS"></el-table-column>
        <el-table-column property="Max" label="Max"></el-table-column>
        <el-table-column property="Min" label="Min"></el-table-column>
      </el-table>
    </el-dialog>
    <el-aside width="30%"  style="margin-left: 1%;margin-top: 1%" align="center">
      <el-button type="primary" @click="addGroup" size="mini">Add Group</el-button>
      <el-button  type="primary" @click="removeGroup" size="mini">Remove Group</el-button>
      <el-button  type="primary" icon="el-icon-delete" @click="clearGroups" size="mini">Clear Groups</el-button>
      <div >
        <el-card v-for="group in groups"  style="width: 99%; margin-top: 2px" body-style="padding: '2px'">
          <div  style="min-height: 0;  margin-top: auto; margin-bottom: auto" align="center">
            group{{group.number}}
            <el-button style="padding: 3px; margin-left: 2px " @click="group.pvs.push({name:''})" icon="el-icon-plus" round></el-button>
            <el-button style="padding: 3px;" @click="group.pvs.pop()" icon="el-icon-minus"></el-button>
            <div align="right"><el-checkbox v-model="group.logCheck" align="right">log</el-checkbox></div>
          </div>
          <div style="margin-top: 2px;">
            <input v-for="pv in group.pvs" v-on:input="inputChange(group,pv,$event)" />
          </div>
        </el-card>
      </div>
    </el-aside>
    <el-main>
        <highstock :options = 'options' style="width: 100%"></highstock>
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
          <div style="width: 30%; margin-top: 10px" :hidden="progressHidden" align="center">
            <font>正在下载第{{downloadSeries}}个文件</font>
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" ></el-progress>
          </div>
        </div>
    </el-main>
  </el-container>
</template>

<script>
    export default {
      name: "userdefinedquery",
      data() {
        return {
          downloadSeries:1,

          progressHidden:true,
          percentage:0,

          groups:[{number:1,pvs:[{name:''}],logCheck:false}],

          showHeader: false,
          gridData: [{pvName:'RNG:BEAM:CURR'},{pvName:'RNG:BEAM:LIFE'}],
          isHidden: false,
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
              text: null
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
          value5: [new Date(Date.now() - 3600 * 24 * 1000), new Date(Date.now())],

          dialogTableVisible: false,

          statisticsDialogTableVisible: false,
          statisticsData: [],

          checkedPvList:[],
          //分页属性
          //使用懒加载，加载一页，显示一页
          pageNumber: 0,
          pageSize: 50,
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
            this.$axios.get(this.urlFragment + '/pvunit/'+this.groups[i].pvs[0].name)
              .then(function (response) {
                let yType = _this.groups[i].logCheck ? "logarithmic":"linear";
                _this.options.yAxis.push({
                  title: {text: response.data},
                  type:yType,
                  opposite: false,lineWidth:2})
              })
          };
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < _this.groups[i].pvs.length; j++) {
              _this.$axios.get(_this.urlFragment + '/history/name/' + _this.groups[i].pvs[j].name + '/' + time1 + '/' + time2)
                .then(function (response1) {
                  if (response1.data == null) {
                    return
                  }
                  let p = new Array();
                  if(response1.data[0].float_val != null) {
                    for (let k = 0; k < response1.data.length; k++) {
                      p.push([response1.data[k].smpl_time, response1.data[k].float_val]);
                    }
                  }else{
                    for (let k = 0; k < response1.data.length; k++) {
                      p.push([response1.data[k].smpl_time, response1.data[k].num_val]);
                    }
                  }
                  _this.options.series.push({
                    name: _this.groups[i].pvs[j].name,
                    data: p,
                    yAxis: i,
                    type: 'line',
                    lineWidth:1.5
                  });
                })
            }
          }
        },
        addBeamCurrSeries:function () {
          if(this.switchValue2 === true){
            if(this.options.series.length < 1){
              return;
            }
            let p = [];
            let date1 = new Date(this.value5[0]);
            let date2 = new Date(this.value5[1]);
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
                  showFirstLabel: true,
                  showLastLabel: true,
                  // tickPixelInterval:50,
                  tickPositioner: function (){
                    // console.log(this.tickPositions)
                    if(this.tickPositions[0] > 190 && this.tickPositions[4] < 370) {
                      return [180, 230, 280, 330, 380]
                    }else if(this.tickPositions[0] < 190 && this.tickPositions[4] < 400){
                      return  [0,100,200,300,400]
                    } else if(this.tickPositions[4] < 400){
                      let p = this.tickPositions[4];
                      let interval = Math.ceil(p*1.1/4)
                      return[0,interval,2*interval,3*interval,4*interval];
                    }
                  },
                  // startOnTick:false,
                  // tickAmount:5,
                  // min:180,
                  // max:380,
                  lineWidth:2
                });
                let yAxisPosition = _this.options.yAxis.length-1;
                for (var i = 0; i < n; i++){
                  p.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
                _this.options.series.push({
                  name: 'Beam Current',
                  data: p,
                  color: "#0055fa",
                  yAxis: yAxisPosition
                })
              })
          }else if(this.switchValue2 === false){
            if(this.options.yAxis[this.options.yAxis.length-1].title.text === "BeamCurrent(mA)"
            && this.options.yAxis[this.options.yAxis.length-1].opposite === true) {
              this.options.yAxis.pop();
              this.options.series.pop();
            }
          }
        },
        changeChartType: function () {
          if(this.switchValue1 === true) {
            console.log("change")
            for (let i = 0; i < this.options.yAxis.length; i++){
              if(this.options.yAxis[this.options.yAxis.length-1].title.text === "BeamCurrent(mA)"
                && this.options.yAxis[this.options.yAxis.length-1].opposite === true){
                continue;
              }
              this.options.yAxis[i].type = 'logarithmic';
            }
          }else if(this.switchValue1 === false){
            for (let i = 0; i < this.options.yAxis.length; i++) {
              this.options.yAxis[i].type = 'linear';
            }
          }
        },
        showStatistics: function () {
          this.statisticsData = []
          this.statisticsDialogTableVisible = true;
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let _this = this;
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < _this.groups[i].pvs.length; j++) {
              _this.$axios.get(_this.urlFragment + '/history/statistics/' + _this.groups[i].pvs[j].name + '/' + time1 + '/' + time2)
                .then(function (response1) {
                  if (response1.data == null) {
                    return
                  }
                  let p = new Array();
                  _this.statisticsData.push({
                    Pv_Name:_this.groups[i].pvs[j].name,
                    Mean:response1.data.Mean.toFixed(6),
                    Deviation:response1.data.Deviation.toFixed(6),
                    RMS:response1.data.RMS.toFixed(6),
                    Max:response1.data.Max.toFixed(6),
                    Min:response1.data.Min.toFixed(6)
                  })
                })
            }
          }
        },

        addGroup:function () {
          if(this.groups === null || this.groups.length === 0){
            this.groups.push({
              number:'1',
              pvs:[],
              logCheck:false
            });
            return;
          }
          this.groups.push({
            number:parseInt(this.groups[this.groups.length-1].number)+1,
            pvs:[],
            logCheck:false
          })
        },
        removeGroup:function () {
          this.groups.pop();
        },
        clearGroups:function () {
          this.groups = [{number:1,pvs:[],logCheck:false}]
        },
        showData:function () {
          this.dataLoading = true
          this.checkedPvList = [];
          this.dialogTableVisible = true;
          this.currentPage = 1;
          this.pageNumber = 1;
          this.gridData = [];
          let row = {}
          let pvList = "";
          let pv = "";
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let _this = this;
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < this.groups[i].pvs.length; j++) {
              if(this.groups[i].pvs[j] != null && this.groups[i].pvs[j].name != null && this.groups[i].pvs[j].name != "") {
                row[this.groups[i].pvs[j].name] = "";
                this.checkedPvList.push(this.groups[i].pvs[j].name);
                pv = this.groups[i].pvs[j].name;
                pvList = pvList + pv + "@";
              }
            }
          }
          this.$axios.get(this.urlFragment + "/history/page/count/" + pvList + "/" + time1 + "/" + time2)
            .then(function (response) {
              // console.log(response.data)
              _this.pageNumber = Math.ceil(response.data%_this.pageSize ? response.data/_this.pageSize : response.data/_this.pageSize +1);
            })

          for (let i = 0; i < this.pageSize; i++) {
            this.gridData.push(Object.assign({},row));
          }

          let val = 1;
          for(let i = 0; i < this.checkedPvList.length; i++ ) {
              this.$axios.get(this.urlFragment + '/history/page/' + val + '/' + this.pageSize + '/' + this.checkedPvList[i] + '/' + time1 + '/' + time2)
                .then(function (response) {
                  if (response.data == null || response.data === "") {
                    return
                  }
                  if(response.data[0].float_val != null) {
                    for (let j = 0; j < response.data.length; j++) {
                      let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss");
                      _this.gridData[j][_this.checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                        response.data[j].float_val.toFixed(6);
                      console.log(_this.gridData)
                      // console.log(j + ":  " +time + "\r\n\r\r\r\n" + response.data[j].float_val);
                    }
                  }else{
                    for (let j = 0; j < response.data.length; j++) {
                      let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss");
                      _this.gridData[j][_this.checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                        response.data[j].num_val.toFixed(6);
                      console.log(_this.gridData)
                      // console.log(j + ":  " +time + "\r\n\r\r\r\n" + response.data[j].float_val);
                    }
                  }
                })
            }
          },
        pageChange:function (val) {
          this.gridData = []
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let _this = this;
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          this.currentPage = val;
          let row = {}
          for (let i = 0; i < this.checkedPvList.length; i++) {
            row[this.checkedPvList[i]] = "";
          }
          for (let i = 0; i < this.pageSize; i++) {
            this.gridData.push(Object.assign({},row));
          }
          for(let i = 0; i < this.checkedPvList.length; i++ ) {
            this.$axios.get(this.urlFragment + '/history/page/' + val + '/' + this.pageSize + '/' + this.checkedPvList[i] + '/' + time1 + '/' + time2)
              .then(function (response) {
                if (response.data == null) {
                  return
                }
                if(response.data[0].float_val != null) {
                  for (let j = 0; j < response.data.length; j++) {
                    let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss");
                    _this.gridData[j][_this.checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                      response.data[j].float_val.toFixed(6);
                    console.log(_this.gridData)
                    // console.log(j + ":  " +time + "\r\n\r\r\r\n" + response.data[j].float_val);
                  }
                }else{
                  for (let j = 0; j < response.data.length; j++) {
                    let time = new Date(response.data[j].smpl_time).format("yyyy-MM-dd hh:mm:ss");
                    _this.gridData[j][_this.checkedPvList[i]] = time.toString() + "\r\n\r\r\r\n" +
                      response.data[j].num_val.toFixed(6);
                    console.log(_this.gridData)
                    // console.log(j + ":  " +time + "\r\n\r\r\r\n" + response.data[j].float_val);
                  }
                }
              })
          }
        },
        downloadData:function () {
          this.downloadSeries = 1;
          this.checkedPvList = [];
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let name = new Date(Date.now()).format("yyyy_MM_dd_hh_mm_ss");
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          let pvList = "";
          let checkedPvList = this.checkedPvList;
          let _this = this;
          // console.log(checkedPvList);
          for(let i = 0; i < this.groups.length; i++ ) {
            let pv = "";
            for (let j = 0; j < this.groups[i].pvs.length; j++) {
              if (this.groups[i].pvs[j] != null && this.groups[i].pvs[j].name != null && this.groups[i].pvs[j].name != "") {
                this.checkedPvList.push(this.groups[i].pvs[j].name);
                pv = this.groups[i].pvs[j].name;
                pvList = pvList + pv + "@";
              }
            }
          }
          // console.log(pvList.length)
          if(!(pvList == null || pvList.length == 0)){
            console.log("开始下载")
            this.progressHidden = false
            this.$axios.get(this.urlFragment + '/download/' + time1 +"/" + time2 + "/" + name + "/" + pvList)
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
              _this.$axios.get(this.urlFragment + '/download/status/' + name)
                .then(function (response) {
                  _this.downloadSeries = response.data[0]
                  _this.percentage = response.data[1]
                })
            }
          }
        }
        },
    }
</script>

<style scoped>

</style>
