<template>
  <div id="div1">
    <el-dialog :visible.sync="dialogTableVisible" width="80%" element-loading-text="Loading"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(255, 255, 255, 0)"
                style="height: 1000px;">
      <el-main v-loading="Loading">
        <div style="height:400px;min-width:300px">
          <highstock :options = 'options' style="height:100%;width: 100%"></highstock>
        </div>
        <el-switch
          active-color="#0055fa"
          inactive-color="#696969"
          active-text="Beam Current"
          v-model="switchValue1"
          @change="addBeamCurrSeries">
        </el-switch>
        <el-switch
          active-color="#0055fa"
          inactive-color="#696969"
          active-text="Autosize"
          v-model="switchValue2"
          @change="changeMode">
        </el-switch>
      </el-main>
    </el-dialog>
    <el-row>
      <el-col :span="11" offset="2" >
        <div style="width: 100%">
          <el-table :data = "gridData1" border :show-header="showHeader" style="width: 80%; margin-left: auto; margin-right: auto;
            margin-top: 10px;" row-style="height:0"  cell-style="padding:5px" :hidden="true">
            <el-table-column property="pv" label = '' align="center"></el-table-column>
            <el-table-column property="value" label = '' align="center"></el-table-column>
          </el-table>

          <div align="center" style="margin-top: 15px;margin-bottom: 15px;">
            <table width="80%" align="center">
              <tr>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 20px;"> Operation mode:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 20px;">{{status.operationMode}}</font></td>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 20px;"> Operation status:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 20px;">{{status.operationStatus}}</font></td>
              </tr>
              <tr>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 20px;"> Beam current:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 20px;">{{status.beamCurrent}}</font></td>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 20px;"> Lifetime:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 20px;">{{status.lifetime}}</font></td>
              </tr>
              <tr>
                <td align="right" width="25%" ><font
                  style="color: #004499; font-size: 20px;"> Energy:</font></td>
                <td align="left" width="25%" ><font
                  style="color: #8A2BE2; font-size: 20px;">{{status.energy}}</font></td>
              </tr>
            </table>
          </div>


        </div>

        <el-table :data="gridData" border row-class-name="table_class" style="font-size: small; width: 80%; margin-left: auto;
        margin-right: auto;margin-top: 20px;" row-style="height:0"
                             cell-style="padding:0" :header-cell-style="tableHeaderColor" :hidden="true">
        <el-table-column property="pv" label="" align="center"></el-table-column>
        <el-table-column property="Gamma" label="Gamma(μSv/h)" align="center" width="140"></el-table-column>
        <el-table-column property="Neutron" label="Neutron(μGr/h)" align="center" width="140"></el-table-column>
        <el-table-column label="Latest 24 hrs data" align="center" width="140">
          <template slot-scope="scope">
            <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
        <table border="1px" cellspacing="0px" align=center
               bordercolor="#000000" style="margin-top: 30px;">
          <tr>
            <td align="center"><font size="4" color="#000000">&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</font></td>
            <td align="center"><font size="4" color="#000000">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;Gamma(μSv/h)&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</font></td>
            <td align="center"><font size="4" color="#000000">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;Neutron(μGr/h)&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</font></td>
            <td align="center"><font size="4" color="#000000"> &nbsp; &nbsp;&nbsp;Latest 24 hrs data&nbsp; &nbsp; &nbsp;</font></td>
          </tr>
          <tr v-for="item in gridData">
            <td align="center"><font size="3">{{item.pv}}</font></td>
            <td align="center"><font size="3">{{item.Gamma}}</font></td>
            <td align="center"><font size="3">{{item.Neutron}}</font></td>
            <td align="center">
                <el-button @click="handleClick(item)" type="text" size="small">查看</el-button>
            </td>
          </tr>
        </table>
      </el-col>
      <el-col :span="11" align="left" style="margin-top: 50px">
        <div style="margin-left: 40px;">
          <img src="../../assets/OPI_BG1.png" width="550px" height="70%"/>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
    export default {
        name: "radiation",
        data(){
          return{
            status:{
              operationMode:"",
              beamCurrent:"",
              lifetime:"",
              operationStatus:"",
              energy:""
            },


            switchValue1:false,
            switchValue2:false,

            Loading:false,

            websock: null,

            showHeader:false,

            dialogTableVisible:false,

            gridData:[],
            gridData1:[{
              pv:'Energy(MeV)',
              value:null
            },{
              pv:'Current(mA)',
              value:null
            },{
              pv:'Lifetime(hours)',
              value:null
            }],

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
                text: ''
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
                showFirstLabel: true,
                showLastLabel: true,
                opposite:false,
                type: 'linear',
                title: {
                  text: 'Gamma(μSV/h)'
                },
                softMax:2,
                // softMin:0,
                // softMax:0.170,
                labels: {
                  formatter: function () {
                    return parseFloat(this.value).toFixed(3);
                  }
                },
                lineWidth:1
              },{
                showFirstLabel: true,
                showLastLabel: true,
                opposite:true,
                type: 'linear',
                title: {
                  text: 'Neutron(μGr/h)'
                },
                softMax:2,
                labels: {
                  formatter: function () {
                    return parseFloat(this.value).toFixed(3);
                  }
                },
                lineWidth:1
              },],
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
                name:'Gamma(μSV/h)',
                data:[],
                yAxis:0,
                lineWidth:2
              },{
                name:'Neutron(μGr/h)',
                data:[],
                yAxis:1,
                lineWidth:2
              }]
            },
          }
        },
        mounted(){
          let _this = this;
          this.gridData = [];
          this.$axios.get(this.urlFragment + "/dmlist")
            .then(function (response) {
              console.log(response.data)
              for (let i = 0; i < response.data.length; i++){
                _this.gridData.push({
                  pv:response.data[i],
                  Gamma:null,
                  Neutron:null
                })
              }
            })
          this.initWebpack();
        },
        methods:{
          addBeamCurrSeries:function () {
            if(this.switchValue1 === true){
              this.Loading = true;
              let _this = this;
              let p = [];
              let date1 = new Date(Date.now());
              let date2 = new Date(Date.now()-3600*24*1000);
              console.log(date1);
              let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
              let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
              this.$axios
                .get(this.urlFragment + '/history/id/149/' + time2 + '/' + time1)
                .then(function (response) {
                  console.log(response.data)
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
                  _this.options.yAxis[1].opposite = false;
                  let n = response.data.length;
                  for (var i = 0; i < n; i++){
                    p.push([response.data[i].smpl_time,response.data[i].float_val]);
                  }
                  _this.options.series.push({
                    name: 'Beam Current(mA)',
                    data: p,
                    color: "#0055fa",
                    yAxis:2,
                    lineWidth:2,
                  })
                  _this.Loading = false;
                  // console.log("min:")
                  // console.log()
                })


            }else if(this.switchValue1 === false){
              this.options.series.pop();
              this.options.yAxis.pop();
              this.options.yAxis[1].opposite = true;
            }
          },
          changeMode(){
            if(this.switchValue2 === true){
              this.options.yAxis[0].softMax = null;
              this.options.yAxis[1].softMax = null;
            }
            if(this.switchValue2 === false){
              this.options.yAxis[0].softMax = 2;
              this.options.yAxis[1].softMax = 2;
            }
          },

          tableHeaderColor({ row, column, rowIndex, columnIndex }) {
            if (rowIndex === 0) {
              return 'background-color: #ffffff;color: #000000;font-weight: 500;'
            }
            return 'background-color: #ffffff;color: #000000; font-weight: 800; '
          },

          initWebpack:function () {
            let str = window.location.href;
            // console.log(str.split("/")[2])
            const wsuri = "ws://"+ str.split("/")[2] + "/ws/radiation";
            // const wsuri = "ws://"+ '222.195.82.88:8081' + "/radiation";
            let websock = new WebSocket(wsuri);//这里面的this都指向vue
            // this.websock.onopen = this.websocketopen;
            // this.websock.onmessage = this.websocketonmessage;
            // this.websock.onclose = this.websocketclose;
            // this.websock.onerror = this.websocketerror;
            websock.onopen = () => {
              var postValue={};
              websock.send(JSON.stringify(postValue));
            }
            websock.onmessage = e => {
              this.energy = null;
              this.current = null;
              this.lifetime = null;
              let data = JSON.parse(e.data)
              console.log(data)
              this.status.beamCurrent = parseFloat(data['Current']).toFixed(2).toString()+" mA";
              if(data['Lifetime'] === 'Infinity'){
                this.status.lifetime = 'inf' + " hours";
              }else {
                this.status.lifetime = parseFloat(data['Lifetime']).toFixed(2).toString() + " hours";
              }
              this.status.energy = parseFloat(data['Energy']).toFixed(2).toString() + " Mev";
              this.status.operationMode = data['OperationMode']
              this.status.operationStatus = data['OperationStatus']
              for (let i = 0; i < this.gridData.length; i++){
                this.gridData[i]["Gamma"] = parseFloat(data[this.gridData[i]["pv"]+"-G"]).toFixed(6)
                this.gridData[i]["Neutron"] = parseFloat(data[this.gridData[i]["pv"]+"-N"]).toFixed(6)
              }
            }
            websock.onclose = function () {
              // 关闭 websocket
              console.log('连接已关闭...')
            }
            // 路由跳转时结束websocket链接
            this.$router.afterEach(function () {
              websock.close()
              console.log("finish websocket")
            })
            websock.onerror = function () {
              console.log("error occurred")
            }
          },
          handleClick(a){
            console.log(a)
            this.switchValue1 = false;
            let time11 = new Date(Date.now())
            this.dialogTableVisible = true;
            let flag = 0;
            this.options.title.text = a.pv
            this.options.series[0].data = [];
            this.options.series[1].data = [];
            if(this.options.series.length > 2){
              this.options.series.pop();
            }
            if(this.options.yAxis.length > 2){
              this.options.yAxis.pop();
            }
            this.options.yAxis[1].opposite = true
            let _this = this;
            let date1 = new Date(Date.now());
            let date2 = new Date(Date.now()-3600*24*1000);
            let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
            let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
            console.log(a.pv);
            let dm = a.pv.substr(2,2);
            this.$axios.get(this.urlFragment +  '/history/name/SR-DM-G'+ dm + ':uSv:calc/'+time2 + '/'+ time1)
              .then(function (response) {
                console.log(response.data.length)
                let p = new Array();
                for (let i = 0; i < response.data.length; i++){
                  p.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
                _this.options.series[0].data = p;
                if(flag == 0){
                  flag++;
                }else {
                  _this.Loading = false;
                }
              });
            this.$axios.get(this.urlFragment + '/history/name/SR-DM-N'+ dm + ':uSv:calc/'+time2 + '/'+ time1)
              .then(function (response) {
                // console.log(response.data)
                // console.log("length:" + response.data.length)
                let p = new Array();
                for (let i = 0; i < response.data.length; i++){
                  // _this.options.series[1].data.push([response.data[i].smpl_time,response.data[i].float_val/1000]);
                  p.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
                _this.options.series[1].data = p;
                if(flag == 0){
                  flag++
                }else {
                  _this.Loading = false;
                }
              })
            this.Loading = true;
          },
        },
      destroy(){
          this.websock.close();
      }

    }
</script>

<style scoped>
  body{
    font-size: small;
  }
</style>
