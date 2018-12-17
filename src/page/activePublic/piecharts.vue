<template>
  <div align="center">
    <div style="width: 50%;" align="center">
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
    <el-button v-on:click="query" type="primary" >query</el-button>
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
            legendVisible: false,
            chartData: {
              columns: ['status', 'time'],
              rows: [
                { 'status': 'Init', 'time': 0 },
                { 'status': 'Injection', 'time': 0 },
                { 'status': 'Operation', 'time': 0 },
                { 'status': 'Setup', 'time': 0 },
              ]
            },
            gridData:[],
            pickerOptions: {
              shortcuts: [{
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
            value5: [new Date(Date.now()-3600*24*1000), new Date(Date.now())],
          }
        },
        mounted(){
          this.query();
        },
        methods:{
          query:function () {
            this.chartData.rows = []
            this.gridData = []
            let q = new Array();
            for(let i = 0; i < 4; i++){
              q.push(0)
            }
            let n;
            let _this = this;
            let date1 = new Date(this.value5[1]);
            let date2 = new Date(this.value5[0]);
            let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
            let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
            let startTime, endTime;
            let status = ["ShutDown", "Setup", "Injection", "Operation"]
            this.$axios.get('/history/id/1522/' + time2 + '/' + time1)
              .then(function (response) {
                n = response.data.length;
                console.log(response.data)
                for (let i = 0; i < n - 1; i++) {
                  startTime = new Date(response.data[i].smpl_time);
                  endTime = new Date(response.data[i + 1].smpl_time);
                  q[response.data[i].num_val] += endTime-startTime
                }
                let sum = q[0] + q[1] + q[2] + q[3];
                for(let i = 0; i < 4; i++) {
                  console.log("q:"+ q[i])
                  if(q[i]>0){
                    _this.chartData.rows.push({
                      status:status[i],
                      time:q[i]
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
                  time:((q[0]+q[1]+q[2]+q[3])/(1000*60*60)).toFixed(3),
                  percent:"100%"
                })
              })

          }
        }
    }


</script>

<style scoped>

</style>
