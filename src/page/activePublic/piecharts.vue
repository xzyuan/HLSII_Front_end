<template>
  <div align="center">
    <div style="width: 50%;" align="center" v-loading="pieLoading">
      <ve-pie :data="chartData" :settings="chartSettings" :legend-visible="legendVisible" style="align:center;"></ve-pie>
    </div>
    <div style="width: 30%; margin-right: auto; margin-left: auto">
        <el-table
        :data="gridData" style="width: 100%" border>
          <el-table-column prop="status" label="Operation Status" align="center"></el-table-column>
          <el-table-column prop="time" label="Time(h)" align="center"></el-table-column>
          <el-table-column prop="percent" label="Percent" align="center"></el-table-column>
        </el-table>
    </div>
    <div class="block" style="margin-top: 2%" align="center">
      <el-date-picker
        v-model="value5"
        type="datetimerange"
        :picker-options="pickerOptions"
        range-separator="to"
        start-placeholder="start time"
        end-placeholder="end time"
        align="right">
      </el-date-picker>
    </div>
    <div align="center" style="margin-top: 1%">
    <el-button v-on:click="query" type="primary" :disabled="disabled">query</el-button>
    </div>
  </div>
</template>

<script>
    export default {
        name: "piecharts",
        data(){


          this.chartSettings = {
            // dataType: 'percent'
          }
          return{
            disabled:false,
            pieLoading:false,
            legendVisible: false,
            chartData: {
              columns: ['status', 'time'],
              rows: [
                { 'status': 'Init(hous)', 'time': 0 },
                { 'status': 'ShutDown(hous)', 'time': 0 },
                { 'status': 'Injection(hous)', 'time': 0 },
                { 'status': 'BeamAvailable(hous)', 'time': 0 },
                { 'status': 'Tuning(hous)', 'time': 0 },
              ]
            },
            gridData:[],
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
          }
        },
        mounted(){
          this.query();
        },
        methods:{
          query:function () {
            this.disabled = true
            this.pieLoading = true
            this.chartData.rows = []
            this.gridData = []
            let q = new Array();
            for(let i = 0; i < 5; i++){
              q.push(0)
            }
            let n;
            let _this = this;
            let date1 = new Date(this.value5[1]);
            let date2 = new Date(this.value5[0]);
            let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
            let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
            let startTime, endTime;
            let status = ["init","ShutDown", "Injection", "BeamAvailable","Tuning"]
            let lastest = null;
            this.$axios.get(this.urlFragment + '/history/lastestStatusStatistics/' + time2 + '/' + time1)
              .then(function (response1) {
                if(response1.status != 200){
                  _this.$notify.error({
                    title: '错误',
                    message: 'PV ' + pv + " query results set failed",
                    position: 'bottom-left'
                  });
                  _this.pieLoading = false
                  _this.disabled = false
                  return;
                }
                if(response1.data == null || response1.data === "" || response1.data.length === 0) {
                  _this.$notify.error({
                    title: '错误',
                    message: 'PV ' + name + " query results set is null",
                    position: 'bottom-left'
                  });
                  _this.pieLoading = false
                  _this.disabled = false
                  return;
                }
                lastest = response1.data;
            _this.$axios.get(_this.urlFragment + '/history/statusStatistics/' + time2 + '/' + time1)
              .then(function (response) {
                if(response.status != 200){
                  _this.$notify.error({
                    title: '错误',
                    message: "status statistics query results set failed",
                    position: 'bottom-left'
                  });
                  _this.pieLoading = false
                  _this.disabled = false
                  return;
                }
                if(response.data === null || response.data.length === 0) {
                  _this.gridData.push({
                    status:status[lastest.num_val],
                    time:24.00.toFixed(3),
                    percent:'100%'
                  })
                  _this.chartData.rows.push({
                    status:status[lastest.num_val],
                    time:24.00.toFixed(2)
                  })
                  _this.gridData.push({
                    status:'Total',
                    time:24.00.toFixed(3),
                    percent:'100%'
                  })
                  _this.pieLoading = false
                  _this.disabled = false
                  return;
                }
                n = response.data.length
                q[lastest.num_val] += new Date(response.data[0].smpl_time) - date2;
                q[response.data[response.data.length-1].num_val] += date1 - new Date(response.data[response.data.length-1].smpl_time);
                for (let i = 0; i < n - 1; i++) {
                  startTime = new Date(response.data[i].smpl_time);
                  endTime = new Date(response.data[i + 1].smpl_time);
                  q[response.data[i].num_val] += endTime-startTime;
                }

                let sum = q[0] + q[1] + q[2] + q[3]+q[4];
                for(let i = 0; i < 5; i++) {
                  if(q[i]>0){
                    _this.chartData.rows.push({
                      status:status[i],
                      time:(q[i]/(60*1000*60)).toFixed(2)
                    })
                    _this.gridData.push({
                      status:status[i],
                      time:(q[i]/(1000*60*60)).toFixed(3),
                      percent:parseFloat(q[i]/sum*100).toFixed(2)+"%"
                    })
                  }
                }
                _this.gridData.push({
                  status:"Total",
                  time:((q[0]+q[1]+q[2]+q[3]+q[4])/(1000*60*60)).toFixed(3),
                  percent:"100%"
                })
                _this.pieLoading = false;
                _this.disabled = false
              })
            })

          }
        }
    }


</script>

<style scoped>

</style>
