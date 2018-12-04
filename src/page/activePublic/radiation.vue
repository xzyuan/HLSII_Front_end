<template>
  <div id="div1">
    <el-dialog :visible.sync="dialogTableVisible" width="60%" v-loading="Loading" element-loading-text="Loading"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(255, 255, 255, 0)">
      <el-main>
        <highstock :options = 'options' style="width: 100%"></highstock>
      </el-main>
    </el-dialog>
    <el-row>
      <el-col :span="11" offset="2" >
        <el-table :data = "gridData1" border :show-header="showHeader" style="width: 80%; margin-left: auto; margin-right: auto;
        margin-top: 10px;" row-style="height:0"  cell-style="padding:5px">
          <el-table-column property="pv" label = '' align="center"></el-table-column>
          <el-table-column property="value" label = '' align="center"></el-table-column>
        </el-table>

        <el-table :data="gridData" border row-class-name="table_class" style="font-size: small; width: 80%; margin-left: auto;
        margin-right: auto;margin-top: 20px;" row-style="height:0"
                  cell-style="padding:0" :header-cell-style="tableHeaderColor">>>
          <el-table-column property="pv" label="" align="center"></el-table-column>
          <el-table-column property="Gamma" label="Gamma(nSv/h)" align="center" width="140"></el-table-column>
          <el-table-column property="Neutron" label="Neutron(nGr/h)" align="center" width="140"></el-table-column>
          <el-table-column label="History" align="center">
            <template slot-scope="scope">
              <el-button @click="handleClick(scope.row)" type="text" size="small">查看</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-col>
      <el-col :span="11" align="left" style="margin-top: 50px">
        <div>
          <img src="../../assets/OPI_BG1.jpg" width="70%" height="70%"/>
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
                opposite:false,
                type: 'linear',
                title: {
                  text: 'Gamma(nSV/h)'
                }
              },{
                opposite:true,
                type: 'linear',
                title: {
                  text: 'Neutron(nGr/h)'
                }
              }],
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
                name:'Gamma(nSV/h)',
                data:[],
                yAxis:0,
                lineWidth:2
              },{
                name:'Neutron(nGr/h)',
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
          this.$axios.get("/data/dmlist")
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
          tableHeaderColor({ row, column, rowIndex, columnIndex }) {
            if (rowIndex === 0) {
              return 'background-color: #ffffff;color: #000000;font-weight: 500;'
            }
            return 'color: #000000; font-weight: 500'
          },

          initWebpack:function () {
            let str = window.location.href;
            // console.log(str.split("/")[2])
            const wsuri = "ws://"+ str.split("/")[2] + "/ws/radiation";
            // const wsuri = "ws://"+ '192.168.113.35:80' + "/ws/radiation";
            this.websock = new WebSocket(wsuri);//这里面的this都指向vue

            this.websock.onopen = this.websocketopen;
            this.websock.onmessage = this.websocketonmessage;
            this.websock.onclose = this.websocketclose;
            this.websock.onerror = this.websocketerror;
          },
          websocketopen(){//打开
              console.log("WebSocket连接成功")
            this.send();
          },
          send(){
            var postValue={};
            this.websock.send(JSON.stringify(postValue));
          },
          websocketonmessage(e){ //数据接收
            this.energy = null;
            this.current = null;
            this.lifetime = null;
            let data = JSON.parse(e.data)
            // console.log(data)
            this.gridData1[1]["value"] = parseFloat(data['Current']).toFixed(2);
            this.gridData1[2]["value"] = parseFloat(data['Lifetime']).toFixed(2);
            this.gridData1[0]["value"] = parseFloat(data['Energy']).toFixed(2)
            for (let i = 0; i < this.gridData.length; i++){
              this.gridData[i]["Gamma"] = data[this.gridData[i]["pv"]+"-G"]
              this.gridData[i]["Neutron"] = data[this.gridData[i]["pv"]+"-N"]
            }
          },
          websocketclose(){  //关闭
            console.log("WebSocket关闭");
          },
          websocketerror(){  //失败
            console.log("WebSocket连接失败");
          },
          handleClick(a){
            let time11 = new Date(Date.now())
            this.dialogTableVisible = true;
            let flag = 0;
            this.options.title.text = a.pv
            this.options.series[0].data = [];
            this.options.series[1].data = [];
            let _this = this;
            let date1 = new Date(Date.now());
            let date2 = new Date(Date.now()-3600*24*1000);
            let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
            let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
            // this.dialogTableVisible = true;
            console.log(a.pv);
            let dm = a.pv.substr(2,2);
            // console.log(dm)
            this.$axios.get('/data/history/puredata/name/SR-DM-G'+ dm + ':ai/'+time2 + '/'+ time1)
              .then(function (response) {
                // console.log(response.data.length)
                // console.log("length:" + response.data.length)
                for (let i = 0; i < response.data.length; i++){
                  _this.options.series[0].data.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
                if(flag == 0){
                  flag++;
                }else {
                  _this.Loading = false;
                }
              });
            this.$axios.get('/data/history/puredata/name/SR-DM-N'+ dm + ':ai/'+time2 + '/'+ time1)
              .then(function (response) {
                // console.log(response.data)
                // console.log("length:" + response.data.length)
                for (let i = 0; i < response.data.length; i++){
                  _this.options.series[1].data.push([response.data[i].smpl_time,response.data[i].float_val]);
                }
                if(flag == 0){
                  flag++
                }else {
                  _this.Loading = false;
                }
              })
            this.Loading = true;
          }
        },
      beforeDestroy(){
        this.websock.close();
        console.log("我离开了")
      }

    }
</script>

<style scoped>
  body{
    font-size: small;
  }
</style>
