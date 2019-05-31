<template>
  <div style="height: 100%">
    <div align="center" >
      <table width="50%" align="center">
        <tr>
          <td align="right" width="25%"><font
            style="color: #004499; font-size: 20px;"> Operation Schedule:</font></td>
          <td align="left" width="25%"><font
            style="color: #8A2BE2; font-size: 20px;">{{status.operationMode}}</font></td>
          <td align="right" width="25%"><font
            style="color: #004499; font-size: 20px;"> Operation Status:</font></td>
          <td align="left" width="25%"><font
            style="color: #8A2BE2; font-size: 20px;">{{status.operationStatus}}</font></td>
        </tr>
        <tr>
          <td align="right" width="25%"><font
            style="color: #004499; font-size: 20px;"> Beam Current:</font></td>
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
    <div align="center">
      <highcharts :options = 'options' style="width: 70%"></highcharts>
      <div align="left" style="width:50%;">
        <el-switch
          active-color="#0055fa"
          inactive-color="#696969"
          active-text="Lifetime"
          v-model="switchValue1"
          @change="addLifeTime">
        </el-switch>
      </div>
    </div>
  </div>
</template>

<script>
    export default {
        name: "home",
      data(){
          return{

            switchValue1:false,

            ws:null,

            status:{
              operationMode:"",
              beamCurrent:"",
              lifetime:"",
              operationStatus:"",
              energy:""
            },

            options: {
              chart: {
                width: 1000,
                height: 400,
                zoomType: null,
                enabled:false,
                plotBorderWidth: 2,
                plotBorderColor: 'grey',
                animation:false
              },
              plotOptions: {

                series:{
                  turboThreshold:10000,
                  animation:false,
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
                lineColor:'grey',
                ordinal:false,
                type: 'datetime',
                title:{
                  text:'Time',
                  style: {
                    color:"black",
                    fontWeight:1000,
                  }
                },
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
                tickInterval:4*60*60*1000,
                // endOnTick:true,
                max: new Date().getTime(),
                min: new Date(Date.now()-24*1000*60*60).getTime()
              },
              yAxis: [{
                // gridLineDashStyle:'ShortDash',
                gridLineWidth:0,
                lineColor:'grey',
                showFirstLabel: true,
                showLastLabel: true,
                opposite:false,
                type: 'linear',
                title: {
                  text: 'Beam Current(mA)',
                  style: {
                    color:"black",
                    fontWeight:1000
                  }
                },
                lineWidth:2,
                // labels: {
                //   formatter:function(){
                //     if(this.value < 1){
                //       // return Highcharts.numberFormat(this.value,4)
                //       return this.value.toFixed(4)
                //     }
                //     return this.value
                //   }
                // },
                // tickPositioner: function () {
                //   console.log(this.tickPositions)
                //   let n = this.tickPositions.length;
                //   if(Math.abs(this.tickPositions[0]-this.tickPositions[n-1])>=150){
                //     let p = this.tickPositions[n-1];
                //     let interval = Math.ceil(Math.ceil(p / 5)/10)*10
                //     return [0, interval, 2 * interval, 3 * interval, 4 * interval,5*interval];
                //   } else if(this.tickPositions[0] > 190 && this.tickPositions[n-1] < 370) {
                //     return [180, 220, 260, 300, 340, 380]
                //   } else if (this.tickPositions[0] < 190 && this.tickPositions[n-1] < 400 && Math.abs(this.tickPositions[0]-this.tickPositions[n-1])>=100) {
                //     return [0, 80, 160, 240, 320, 400]
                //   }else if(this.tickPositions[0] < 1){
                //     let p = new Array();
                //     if(n < 6){return this.tickPositions;  }
                //     for (let i = 0; i < 6; i++){
                //       console.log(parseFloat(this.tickPositions[i]).toFixed(4))
                //       // console.log(Highcharts.numberFormat(1.2345,2))
                //       p.push(parseFloat(this.tickPositions[i]))
                //     }
                //     return p;
                //   }else {
                //     return this.tickPositions;
                //   }
                // }
                // min:0,
                startOnTick:false,
                min:0,
                // max:350
              },
                {
                  gridLineWidth:0,
                  lineColor:'grey',
                  showFirstLabel: true,
                  showLastLabel: true,
                  opposite:true,
                  type: 'linear',
                  title: {
                    text: 'Lifetime(hours)',
                    style: {
                      color:"black",
                      fontWeight:1000
                    }
                  },
                  startOnTick:false,
                  lineWidth:2,

                }],
              tooltip: {
                dateTimeLabelFormats: {
                  millisecond: '%m-%d %H:%M:%S.%L',
                  second: '%m-%d %H:%M:%S',
                  minute: '%m-%d %H:%M',
                  hour: '%m-%d %H:%M',
                  day: '%Y-%m-%d %H:%M',
                  week: '%m-%d',
                  month: '%Y-%m',
                  year: '%Y'
                }
              },
              credits: {
                enabled:false,
              },
              legend: {
                enabled: true,
                itemMarginTop:20,
                verticalAlign: 'bottom',
                // layout: 'vertical',
                align: 'middle'
              },
              navigator:{
                // adaptToUpdatedData: false,
                enabled:false
              },
              series:[{
                name: 'Beam Current',
                data: [],
                yAxis:0,
                lineWidth: 1.5,
                color: "#0055fa",
                showInLegend:false,
                showLegends:false,
            },{
                name:'LifeTime',
                data:[],
                yAxis:1,
                lineWidth:1.5,
                color:	"#FF0000",
                visible: false,
                showInLegend:false,
             }]
            },
            timer:null
          }
      },
      mounted() {
        this.options.series[0].data = [];
        this.options.series[1].data = [];
        let p = new Array();
        let date1 = new Date(Date.now())
        let date2 = new Date(Date.now()-3600*24*1000)
        let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
        let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
        let _this = this;
        this.options.yAxis[1].title.text = ""
        // this.options.xAxis.tickPositions = [date2.getTime(),new Date(date2+12*1000*3600).getTime(),date1.getTime()]

        this.$axios.get(this.urlFragment+'/beam/status')
          .then(function (response) {
            let n = response.data['Beam']['BeamCurrent'].length;
            let m = response.data['Beam']['LifeTime'].length;
            for (let i = 0; i < n; i++){
              // if(new Date(response.data.Beam.BeamCurrent[i].timeStamp.replace(/-/g, '/'))-date2 < 0
              //   || new Date(response.data.Beam.BeamCurrent[i].timeStamp.replace(/-/g, '/'))-date1 > 0){
              //   break;
              // }
              _this.options.series[0].data.push([new Date(response.data.Beam.BeamCurrent[i].timeStamp.replace(/-/g, '/')).getTime(),response.data.Beam.BeamCurrent[i].value]);
            }
            for (let i = 0; i < m; i++){
              // if(new Date(response.data.Beam.LifeTime[i].timeStamp.replace(/-/g, '/'))-date2 < 0
              //   || new Date(response.data.Beam.LifeTime[i].timeStamp.replace(/-/g, '/'))-date1 > 0){
              //   break;
              // }
              _this.options.series[1].data.push([new Date(response.data.Beam.LifeTime[i].timeStamp.replace(/-/g, '/')).getTime(),response.data.Beam.LifeTime[i].value]);
            }
          })
          this.timer = setInterval(getIntegralData,30000);
          function getIntegralData() {
            _this.options.xAxis.max = new Date().getTime()
            _this.options.xAxis.min = new Date(Date.now()-24*1000*60*60).getTime()
             let p = new Array();
             date1 = new Date(Date.now());
             date2 = new Date(Date.now()-3600*24*1000);
             time1 = date1.format("yyyy-MM-dd hh:mm:ss");
             time2 = date2.format("yyyy-MM-dd hh:mm:ss");
             _this.$axios.get(_this.urlFragment+'/beam/status')
              .then(function (response) {
                // console.log(response.data.Beam.BeamCurrent)
                let n = response.data['Beam']['BeamCurrent'].length;
                let m = response.data['Beam']['LifeTime'].length;
                _this.options.series[0].data = [];
                _this.options.series[1].data = [];
                for (let i = 0; i < n; i++){
                  _this.options.series[0].data.push([new Date(response.data.Beam.BeamCurrent[i].timeStamp.replace(/-/g, '/')).getTime(),response.data.Beam.BeamCurrent[i].value]);
                }
                for (let i = 0; i < m; i++){
                  _this.options.series[1].data.push([new Date(response.data.Beam.LifeTime[i].timeStamp.replace(/-/g, '/')).getTime(),response.data.Beam.LifeTime[i].value]);
                }
              })
          }
        this.initWebpack();
      },
      methods:{
        initWebpack:function () {
          let str = window.location.href;
          const wsuri = "ws://"+ str.split("/")[2] + "/ws/status";
          // const wsuri = "ws://"+ '222.195.82.88:8081' + "/status";
          let websock = new WebSocket(wsuri);
          websock.onopen = () => {
            var postValue={};
            websock.send(JSON.stringify(postValue));
          }
          websock.onmessage = e => {
            this.status.energy = null;
            this.status.lifetime = null;
            this.status.beamCurrent = null;
            this.status.operationStatus = null;
            this.status.operationMode = null;
            let data = JSON.parse(e.data)
            // console.log(data)
            this.status.beamCurrent = parseFloat(data['Current']).toFixed(2).toString()+" mA";
            if(data['Lifetime'] === 'Infinity'){
              this.status.lifetime = 'inf' + " hours";
            }else {
              this.status.lifetime = parseFloat(data['Lifetime']).toFixed(2).toString() + " hours";
            }
            this.status.energy = parseFloat(data['Energy']).toFixed(2).toString() + " Mev";
            this.status.operationMode = data['OperationMode']
            this.status.operationStatus = data['OperationStatus']
          }
          websock.onclose = function () {
            // 关闭 websocket
          }
          // 路由跳转时结束websocket链接
          this.$router.afterEach(function () {
            websock.close()
          })
          websock.onerror = function () {
            console.log("error occurred")
          }
        },

        addLifeTime:function(){
          if(this.switchValue1 === true) {
            this.options.series[1].visible = true
            this.options.yAxis[1].title.text = "Lifetime(hours)"
          }else{
            this.options.series[1].visible = false
            this.options.yAxis[1].title.text = ""
          }
        },
      },
      destroyed(){
        clearInterval(this.timer);
      }
    }
</script>
<style scoped>
  div{
    margin-left: auto;
    margin-right: auto;
  }
</style>
