<template>
  <div style="height: 100%">
    <div align="center">
      <table width="50%" align="center">
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
    <div style="" align="center">
      <highstock :options = 'options' style="width: 70%" :hidden="true"></highstock>
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
                plotBorderColor: 'grey'
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
              // navigator:{
              //   enabled:false
              // },
              title: {
                text: null
              },
              xAxis: {
                lineColor:'grey',
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
                tickInterval:4*60*60*1000,
                // endOnTick:true,
                max: new Date().getTime(),
                min: new Date(Date.now()-24*1000*60*60).getTime()

                // scrollBar:{
                //   enabled:false
              },
              yAxis: [{
                lineColor:'grey',
                showFirstLabel: true,
                showLastLabel: true,
                opposite:false,
                type: 'linear',
                title: {
                  text: 'Beam Current(mA)'
                },
                lineWidth:2,
                tickPositioner: function () {
                  // console.log(this.tickPositions)
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
                }
              },
                {
                  lineColor:'grey',
                  showFirstLabel: true,
                  showLastLabel: true,
                  opposite:true,
                  type: 'linear',
                  title: {
                    text: 'Lifetime(hours)'
                  },
                  tickPositioner: function () {
                    // console.log(this.tickPositions)
                      let p = this.tickPositions[this.tickPositions.length-1];
                      let interval = Math.ceil(Math.ceil(p/ 4)/10)*10
                      return [0, interval, 2 * interval, 3 * interval, 4 * interval];
                  },
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
                // enabled:true,    // 默认值，如果想去掉版权信息，设置为false即可
                text: 'NSRL@USTC', // 显示的文字
                href: 'http://www.nsrl.ustc.edu.cn'
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
          // console.log(str.split("/")[2])
          const wsuri = "ws://"+ str.split("/")[2] + "/ws/status";
          // const wsuri = "ws://"+ '222.195.82.88:8081' + "/status";
          let websock = new WebSocket(wsuri);

          // this.websock.onopen = this.websocketopen;
          // this.websock.onmessage = this.websocketonmessage;
          // this.websock.onclose = this.websocketclose;
          // this.websock.onerror = this.websocketerror;
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
