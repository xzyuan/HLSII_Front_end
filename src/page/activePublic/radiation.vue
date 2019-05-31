<template>
  <div id="div1">
    <el-dialog :visible.sync="dialogTableVisible" width="70%" element-loading-text="Loading"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(255, 255, 255, 0)"
                style="height: 1000px;">
      <el-main v-loading="Loading">
        <div align="center">
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
          <div align="center" style="margin-top: 15px;margin-bottom: 15px;">
            <table width="90%" align="center">
              <tr>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 18px;"> Operation Schedule:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 18px;">{{status.operationMode}}</font></td>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 18px;"> Operation Status:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 18px;">{{status.operationStatus}}</font></td>
              </tr>
              <tr>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 18px;"> Beam Current:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 18px;">{{status.beamCurrent}}</font></td>
                <td align="right" width="25%"><font
                  style="color: #004499; font-size: 18px;"> Lifetime:</font></td>
                <td align="left" width="25%"><font
                  style="color: #8A2BE2; font-size: 18px;">{{status.lifetime}}</font></td>
              </tr>
              <tr>
                <td align="right" width="25%" ><font
                  style="color: #004499; font-size: 18px;"> Energy:</font></td>
                <td align="left" width="25%" ><font
                  style="color: #8A2BE2; font-size: 18px;">{{status.energy}}</font></td>
              </tr>
            </table>
          </div>
        </div>
        <table border="1px" cellspacing="0px" align=center
               bordercolor="#000000" style="margin-top: 10px;">
          <tr>
            <td align="center"><font size="3" color="#000000">&nbsp; &nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</font></td>
            <td align="center"><font size="3" color="#000000">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;Gamma(μSv/h)&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</font></td>
            <td align="center"><font size="3" color="#000000">&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;Neutron(μGr/h)&nbsp; &nbsp; &nbsp; &nbsp;&nbsp;</font></td>
            <td align="center"><font size="3" color="#000000"> &nbsp; &nbsp;&nbsp;Latest 24 hrs data&nbsp; &nbsp; &nbsp;</font></td>
          </tr>
          <tr v-for="item in gridData">
            <td align="center"><font size="3" color="#004499">{{item.pv}}</font></td>
            <td align="center"><font size="3" color="#8A2BE2">{{item.Gamma}}</font></td>
            <td align="center"><font size="3" color="#8A2BE2">{{item.Neutron}}</font></td>
            <td align="center">
                <el-button @click="handleClick(item)" type="text" size="small">view</el-button>
            </td>
          </tr>
        </table>
      </el-col>
      <el-col :span="11" align="left" style="margin-top: 50px">
        <div style="margin-left: 40px;">
          <img :src="imgUrl" width="480px" height="480px"/>
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
            imgUrl:'/static/picture/1.0.3.png',
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
                height:500,
                width:1000,
                animation:false,
                resetZoomButton: {
                  position: {
                    x: 0,
                    y: -30
                  },
                  relativeTo: 'chart'
                },
                plotBorderWidth: 2,
                plotBorderColor: 'grey',
              },
              plotOptions: {
                series:{
                  animation:false,
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
                gridLineDashStyle:'ShortDash',
                gridLineWidth: 1,
                title:{
                  text:'Time',
                  style: {
                    color:"black",
                    fontWeight:1000
                  }
                },
                type: 'datetime',
                showFirstLabel:true,
                showLastLabel:true,
                dateTimeLabelFormats: {
                  millisecond: '%H:%M:%S.%L',
                  second: '%H:%M:%S',
                  minute: '%H:%M',
                  hour: '%H:%M',
                  day: '%m-%d %H:%M',
                  week: '%m-%d',
                  month: '%Y-%m',
                  year: '%Y'
                }
              },
              yAxis: [{
                gridLineWidth:0,
                showFirstLabel: true,
                showLastLabel: true,
                opposite:false,
                type: 'linear',
                title: {
                  text: 'Gamma(μSV/h)',
                  style: {
                    color:"black",
                    fontWeight:1000
                  }
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
                gridLineWidth:0,
                showFirstLabel: true,
                showLastLabel: true,
                opposite:true,
                type: 'linear',
                title: {
                  text: 'Neutron(μGr/h)',
                  style: {
                    color:"black",
                    fontWeight:1000
                  }
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
                  day: '%Y-%m-%d %H:%M',
                  week: '%m-%d',
                  month: '%Y-%m',
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
                name:'Gamma(μSV/h)',
                data:[],
                color:"#FF0000",
                yAxis:0,
                lineWidth:1.5
              },{
                name:'Neutron(μGr/h)',
                data:[],
                color:"black",
                yAxis:1,
                lineWidth:1.5
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
                  _this.options.yAxis.push({
                    gridLineWidth:0,
                    opposite:true,
                    type: 'linear',
                    title: {
                      text: 'BeamCurrent(mA)',
                      style: {
                        color:"black",
                        fontWeight:1000
                      }
                    },
                    showFirstLabel: true,
                    showLastLabel: true,
                    lineWidth:2,
                    startOnTick:false,
                    min:150
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
                    lineWidth:1.5,
                  })
                  _this.Loading = false;
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
            let websock = new WebSocket(wsuri);
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
            }
            // 路由跳转时结束websocket链接
            this.$router.afterEach(function () {
              websock.close()
            })
            websock.onerror = function () {
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
