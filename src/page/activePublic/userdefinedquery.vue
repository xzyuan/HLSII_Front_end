<template>
  <div>
    <el-dialog title="Data" :visible.sync="dialogTableVisible" width="90%" align="center">
      <div :hidden="dataLoading">
        <i class="el-icon-loading" ></i>
      </div>
      <el-row>
        <div align="center">
          <el-table :data="gridData" >
            <el-table-column v-for = "col in checkedPvList" :property="col" :label="col" :key="col" width="250%" align="left" header-align="center"></el-table-column>
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
      <div :hidden="statisticsLoading">
        <i class="el-icon-loading" ></i>
      </div>
      <el-table :data="statisticsData" align="center">
        <el-table-column property="Pv_Name" label="Pv Name"></el-table-column>
        <el-table-column property="Mean" label="Mean"></el-table-column>
        <el-table-column property="Deviation" label="Deviation"></el-table-column>
        <el-table-column property="RMS" label="RMS"></el-table-column>
        <el-table-column property="Max" label="Max"></el-table-column>
        <el-table-column property="Min" label="Min"></el-table-column>
      </el-table>
    </el-dialog>
    <el-row>
    <el-col :span="4" width="25%"  style="margin-top: 1%" align="center">
      Groups
      <el-button type="primary" @click="addGroup" style="background-color: #004499; border-color: #004499" size="mini" icon="el-icon-plus">Add</el-button>
      <el-button  type="primary" @click="removeGroup" style="background-color: #004499; border-color: #004499" size="mini" icon="el-icon-minus">Remove</el-button>
      <!--<el-button  type="primary" icon="el-icon-delete" @click="clearGroups" style="background-color: #004499; border-color: #004499" size="mini">Clear</el-button>-->
      <div>
        <el-card v-for="group in groups"  style="width: 99%; margin-top: 2px" shadow="hover" body-style="padding: '10px'">
          <div  style="min-height: 0;  margin-top: auto; margin-bottom: auto" align="center">
            Group{{group.number}}  member
            <el-button style="padding: 3px; margin-left: 2px; color: #000; " @click="group.pvs.push({name:''})" icon="el-icon-plus"></el-button>
            <el-button style="padding: 3px; color: #000; " @click="group.pvs.pop()" icon="el-icon-minus"></el-button>
            <div align="right"><el-checkbox v-model="group.logCheck" align="right">log</el-checkbox></div>
          </div>
          <div style="margin-top: 2px;">
            <input v-for="pv in group.pvs" v-model="pv.name" v-on:input="inputChange(group, pv, $event)" />
          </div>
        </el-card>
      </div>
    </el-col>

    <el-col :span="16" align="center">
      <div align="center" v-loading="chartLoading" style="margin-top: 3%">
        <highstock :options = 'options' style="width: 100%; align: center;" ></highstock>
      </div>
        <div class="block" style="" align="center">
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
          <el-button v-on:click="query1" type="primary" style="background-color: #004499; border-color: #004499" :disabled="queryDisabled">Draw Line Chart</el-button>
          <el-button v-on:click="showStatistics" type="primary" style="background-color: #004499; border-color: #004499">Statistics Data</el-button>
          <el-button @click="showData" type="primary" style="background-color: #004499; border-color: #004499">View Data</el-button>
          <el-button v-on:click="downloadData" type="primary" style="background-color: #004499; border-color: #004499" :disabled="downloadDisabled">Download Data</el-button>
        </div>
        <div style="margin-top: 1%" align="center">
          <el-switch
            active-color="#13ce66"
            inactive-color="#696969"
            active-text="Beam Current"
            v-model="switchValue2"
            @change="addBeamCurrSeries">
          </el-switch>
          <div style="width: 30%; margin-top: 10px" :hidden="progressHidden" align="center">
            <font>正在下载第{{downloadSeries}}个PV</font>
            <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" ></el-progress>
          </div>
        </div>
    </el-col>
    </el-row>
  </div>
</template>

<script>
    export default {
      name: "userdefinedquery",
      data() {
        return {
          queryDisabled:false,
          statisticsDisabled:false,
          dataDisabled:false,
          downloadDisabled:false,

          //Loading
          statisticsLoading:true,
          dataLoading:true,
          chartLoading:false,

          downloadSeries:1,

          progressHidden:true,
          percentage:0,

          timer: null,

          groups:[{number:1,pvs:[{name:''}],logCheck:false}],

          showHeader: false,
          gridData: [{pvName:'RNG:BEAM:CURR'},{pvName:'RNG:BEAM:LIFE'}],
          isHidden: false,
          options: {
            chart: {
              width: 1000,
              height: 550,
              zoomType: 'x',
              resetZoomButton: {
                position: {
                  // align: 'right', // by default
                  // verticalAlign: 'top', // by default
                  x: 0,
                  y: -30
                },
                relativeTo: 'chart',
              },
              animation:false,
              plotBorderWidth: 1,
              plotBorderColor: 'grey'
            },
            colors: ['#FF0000', '#434348', '#90ed7d', '#f7a35c', '#8085e9',
              '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
            plotOptions: {
              series:{
                turboThreshold:10000,
                animation:false
                },
              line: {
                dataGrouping: {
                  enabled: false
                }
              }
            },
            noData: {
              style: {
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#303030'
              }
            },
            title: {
              text: null
            },
            xAxis: {
              showFirstLabel: true,
              showLastLabel: true,
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
                hour: '%H:%M',
                day: '%m-%d',
                week: '%m-%d',
                month: '%Y-%m',
                year: '%Y'
              },
              lineColor:'black',
            },
            navigator:{
              margin:40
            },
            yAxis:[],
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
            legend: {
              enabled: true,
              verticalAlign: 'bottom',
              // layout: 'vertical',
              align: 'middle',
              layout:'horizontal',
              maxHeight:40
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
          if(this.groups.length == 1 && (this.groups[0].pvs.length === 1 && this.groups[0].pvs[0] == '')){
            return;
          }
          let count = 0;
          this.options.yAxis = [];
          this.options.series = [];
          this.checkedPvList = [];
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          this.queryDisabled = true;
          this.chartLoading = true;
          this.switchValue2 = false;
          let pvList = "";
          let checkedPvList = [];
          for(let i = 0; i < this.groups.length; i++ ) {
            if (this.groups[i].pvs[0].name === '') {
              this.$confirm("请输入需要查询的PV","提示",{
                showCancelButton:false,
                showConfirmButton:false,
              })
              this.chartLoading = false;
              this.queryDisabled = false;
              return;
            }
          }
          for(let i = 0; i < this.groups.length; i++ ) {
            let yType = this.groups[i].logCheck ? "logarithmic":"linear";
            this.options.yAxis.push({
              showFirstLabel: true,
              showLastLabel: true,
              // gridLineDashStyle:'ShortDash',
              gridLineWidth: 0,
              title: {
                text: null,
                style: {
                  color:"black",
                  fontWeight:1000
                }
              },
              type:yType,
              opposite: false,
              lineWidth:2
            })
            this.$axios.get(this.urlFragment + '/pvunit/'+this.groups[i].pvs[0].name)
              .then(function (response) {
                if(response.data === null || response.data == "unknown"){
                  _this.options.yAxis[i].title.text = _this.groups[i].pvs[0].name
                }else{
                  _this.options.yAxis[i].title.text = response.data
                }
              })
          }
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < this.groups[i].pvs.length; j++) {
              if (this.groups[i].pvs[j].name !== ''){
                pvList = pvList + this.groups[i].pvs[j].name + "@";
                checkedPvList.push(this.groups[i].pvs[j].name);
                count++;
                this.options.series.push({
                  name: _this.groups[i].pvs[j].name,
                  data: null,
                  yAxis: i,
                  type: 'line',
                  lineWidth:1.5
                })
              }
            }
          }
          let failedPvList = []
          let emptyPvList = []

          _this.$axios.get(_this.urlFragment + '/history/nameMap/' + pvList + '/' + time1 + '/' + time2)
            .then(function (response1) {
              if(response1.status !== 200){
                _this.$notify.error({
                  title: '错误',
                  message: 'PV' + _this.groups[i].pvs[j].name + "请求出现异常",
                  position: 'top-right',
                  offset:400,
                  duration:0
                });
                _this.queryDisabled = false;
                _this.chartLoading = false;
                return;
              }
              if(response1.data == null) {
                _this.$notify.error({
                  title: '错误',
                  message: 'PV ' + name + " 查询结果为空",
                  position: 'top-right',
                  offset:400,
                  duration:0
                });
                if(--count === 0){
                  _this.queryDisabled = false;
                  _this.chartLoading = false;
                }
                return;
              }
              for (let i = 0; i < checkedPvList.length; i++){
                let name = checkedPvList[i]
                if(response1.data[name] == null || response1.data[name].length === 0){
                  emptyPvList.push(name)
                  continue;
                }
                let p = new Array();
                p.push([date1.getTime(),null]);
                if(response1.data[name][0].float_val != null) {
                  for (let k = 0; k < response1.data[name].length; k++) {
                    p.push([response1.data[name][k].smpl_time, response1.data[name][k].float_val]);
                  }
                }else{
                  for (let k = 0; k < response1.data[name].length; k++) {
                    p.push([response1.data[name][k].smpl_time, response1.data[name][k].num_val]);
                  }
                }
                p.push([date2.getTime(),null]);
                _this.options.series[i].data = p;
              }
              _this.queryDisabled = false;
              _this.chartLoading = false;
              alertInfo(failedPvList,emptyPvList);
              return
            })
            .catch(function (error) {
            });
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
        addBeamCurrSeries:function () {
          if(this.switchValue2 === true){
            if(this.options.series.length < 1){
              return;
            }
            this.chartLoading = true;
            let p = [];
            let date1 = new Date(this.value5[0]);
            let date2 = new Date(this.value5[1]);
            let _this = this;
            let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
            let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
            this.$axios
              .get(this.urlFragment  + '/history/id/149/' + time1 + '/' + time2)
              .then(function (response) {
                let n = response.data.length;
                _this.options.yAxis.push({
                  // gridLineDashStyle:'ShortDash',
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
                  showFirstLabel: true,
                  showLastLabel: true,
                  min:0,
                  startOnTick:false,
                  // max:380,
                  lineWidth:2
                });
                let yAxisPosition = _this.options.yAxis.length-1;
                for (var i = 0; i < n; i++){
                  p.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
                _this.options.series.push({
                  name: 'RNG:BEAM:CURR',
                  data: p,
                  color: "#0055fa",
                  yAxis: yAxisPosition
                })
                _this.chartLoading = false;
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
          let count = 0;
          this.statisticsData = []
          this.statisticsLoading = false;
          this.statisticsDialogTableVisible = true;
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let _this = this;
          let checkedPvList = []
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          let pvList = ""
          let failedPvList = []
          let emptyPvList = []
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < this.groups[i].pvs.length; j++) {
              if (this.groups[i].pvs[j].name !== ''){
                count++;
                checkedPvList.push(this.groups[i].pvs[j].name);
                pvList = pvList + this.groups[i].pvs[j].name + "@";
              }
            }
          }
          if(count === 0){
            this.$confirm("请输入需要查询的PV","提示",{
              showCancelButton:false,
              showConfirmButton:false,
            })
            this.statisticsLoading = true;
            return;
          }
          for (let i = 0; i < checkedPvList.length; i++) {
            this.statisticsData.push({
              Pv_Name:checkedPvList[i],
              Mean:null,
              Deviation:null,
              RMS:null,
              Max:null,
              Min:null
            })
          }
          this.$axios.get(_this.urlFragment + '/history/statisticsMap/' + pvList + '/' + time1 + '/' + time2)
                .then(function (response) {
                  if (response.data == null) {
                    _this.$notify.error({
                      title: '错误',
                      message: 'PV ' + _this.groups[i].pvs[j].name + '统计信息查询结果为空',
                      position: 'top-right',
                      offset:400
                    });
                    _this.statisticsLoading = true;
                    return;
                  }
                  for (let i = 0; i < checkedPvList.length; i++) {
                    let name = checkedPvList[i];
                    if(response.data[name] === null || response.data[name].length === 0){
                      emptyPvList.push(name)
                      continue;
                    }

                    _this.statisticsData[i].Mean = response.data[name].Mean.toFixed(6);
                    _this.statisticsData[i].Deviation = response.data[name].Deviation.toFixed(6);
                    _this.statisticsData[i].RMS = response.data[name].RMS.toFixed(6);
                    _this.statisticsData[i].Max = response.data[name].Max.toFixed(6);
                    _this.statisticsData[i].Min = response.data[name].Min.toFixed(6);
                  }
                  _this.statisticsLoading = true
                  alertInfo(failedPvList,emptyPvList);
                })
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
            pvs:[{name:''}],
            logCheck:false
          })
        },
        removeGroup:function () {
          if(this.groups.length > 1) {
            this.groups.pop();
          }
        },
        clearGroups:function () {
          // let firstName = this.groups[1].pvs[0].name
          this.groups = new Array();
          this.groups.push({number:1,pvs:[{name:''}],logCheck:false});
        },
        showData:function () {
          this.checkedPvList = [];
          this.dialogTableVisible = true;
          this.currentPage = 1;
          this.pageNumber = 1;
          this.gridData = [];
          let row = {}
          let pvList = "";
          let pv = "";
          let count = 0;
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
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < this.groups[i].pvs.length; j++) {
              if (this.groups[i].pvs[j].name !== ''){
                count++;
              }
            }
          }
          if(count !== 0){
            this.dataLoading = false;
          }else{
            this.$confirm("请选择需要查询的PV","提示",{
              showCancelButton:false,
              showConfirmButton:false,
            })
            return;
          }
          this.$axios.get(_this.urlFragment + "/history/page/count/" + pvList + "/" + time1 + "/" + time2)
            .then(function (response) {
              if(response.data === 0){
                this.$notify.error({
                  title:'错误',
                  message:'查询结果为空',
                  position: 'top-right',
                  offset:400
                })
              }
              _this.pageNumber = Math.ceil(response.data%_this.pageSize ? response.data/_this.pageSize : response.data/_this.pageSize +1);
            })
          for (let i = 0; i < this.pageSize; i++) {
            this.gridData.push(Object.assign({},row));
          }
          let val = 1;
          for(let i = 0; i < this.checkedPvList.length; i++ ) {
              this.$axios.get(_this.urlFragment + '/history/page/' + val + '/' + this.pageSize + '/' + this.checkedPvList[i] + '/' + time1 + '/' + time2)
                .then(function (response) {
                  if (response.data == null || response.data === "") {
                    if(--count === 0){
                      _this.dataLoading = true;
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
                }).catch(function (error) {
                  if(--count === 0) {
                    _this.dataLoading = true
                  }
            });
            }
          },
        pageChange:function (val) {
          let count = 0
          this.gridData = []
          this.dataLoading = false;
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let _this = this;
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          this.currentPage = val;
          for(let i = 0; i < this.groups.length; i++ ) {
            for (let j = 0; j < this.groups[i].pvs.length; j++) {
              if (this.groups[i].pvs[j].name !== ''){
                count++;
              }
            }
          }
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
                  if(--count === 0){
                    _this.dataLoading = true;
                  }
                  return;
                  return
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
                return;
              }).catch(function (error) {
                if(--count === 0) {
                  _this.dataLoading = true
                }
              });
          }
        },
        downloadData:function () {
          this.downloadDisabled = true;
          this.downloadSeries = true;
          this.checkedPvList = [];
          let date1 = new Date(this.value5[0]);
          let date2 = new Date(this.value5[1]);
          let name = new Date(Date.now()).format("yyyy_MM_dd_hh_mm_ss");
          let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
          let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
          let pvList = "";
          let checkedPvList = this.checkedPvList;
          let _this = this;
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
          this.downloadDisabled = true;
          // console.log(pvList.length)
          if(!(pvList == null || pvList.length == 0)){
            this.$confirm("正在计算文件大小和下载时间,请勿离开","提示",{
              showCancelButton:false,
              showConfirmButton:false,
              closeOnClickModal:false,
              closeOnPressEscape:false,
              closeOnHashChange:false
            })
            this.$axios.get(_this.urlFragment  + '/download/' + pvList + "/" + time1 +"/" + time2)
              .then(function (response) {
                _this.$msgbox.close()
                _this.$confirm("Estimated file size " + (response.data/30000).toFixed(3) + "M, download time:" + (response.data/40000).toFixed(2) + "s， continue?","Tips",{
                  confirmButtonText: 'confirm',
                  cancelButtonText: 'cancel',
                  type: 'warning'
                }).then(() => {
                  if(!(pvList == null || pvList.length == 0)){
                    _this.downloadDisabled = true;
                    _this.progressHidden = false
                    _this.$axios.get(_this.urlFragment  + '/download/' + time1 +"/" + time2 + "/" + name + "/" + pvList)
                      .then(function (response) {
                        _this.progressHidden = false;
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
          }else{
            this.$confirm("请输入需要下载的PV","提示",{
              showCancelButton:false,
              showConfirmButton:false,
            })
          }
        }
        },
      destroyed(){
        clearInterval(this.timer);
      }
    }
</script>

<style scoped>

</style>
