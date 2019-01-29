<template>
  <div>
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
    <el-row>
      <el-col align="center" style="margin-top: 2px;">
        <el-button v-on:click="query1" type="primary" :disabled="disabled">query</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col align="center">
        <el-table v-loading="pieLoading"
          :data="gridData.slice((currentPage-1)*pageSize,currentPage*pageSize)" style="width: 100%" align="center"
          :row-class-name="tableRowClassName" :highlight-current-row = 'true'>
          <el-table-column prop="startTime" label="Start Time" width="180" align="center"></el-table-column>
          <el-table-column prop="endTime" label="End Time" width="180" align="center"></el-table-column>
          <el-table-column prop="interval" label="Interval" width="180" align="center"></el-table-column>
          <el-table-column prop="status" label="Status" width="180" align="center"></el-table-column>
        </el-table>
      </el-col>
    </el-row>
    <el-row>
      <div align="center">
        <span class="demonstration">page select</span>
      </div>
      <el-pagination
        layout="prev, pager, next,jumper"
        :page-count="pageNumber"
        :current-page.sync="currentPage"
        @current-change="pageChange" align="center">
      </el-pagination>
    </el-row>
  </div>
</template>

<script>
    export default {
        name: "operstatlist",
        data(){
          return {
            disabled:false,
            pieLoading:true,

            pageNumber:0,
            pageSize:50,
            currentPage:1,

            gridData: [],
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
            value5: [new Date(Date.now()-3600*24*1000), new Date(Date.now())],
          }
        },
      mounted(){
          this.query();
      },
        methods:{
          query1:function(){
            this.query();
          },
          query:function () {
            this.disabled = true;
            this.pieLoading = true;
            let q = new Array();
            let n;
            let _this = this;
            let date1 = new Date(this.value5[1]);
            let date2 = new Date(this.value5[0]);
            let time1 = date1.format("yyyy-MM-dd hh:mm:ss");
            let time2 = date2.format("yyyy-MM-dd hh:mm:ss");
            let startTime,endTime;
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
            // let status = ["Init","ShutDown","Injection","BeamAvailable","Tuning"]
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
                        q.push({
                          startTime:date2.format("yyyy-MM-dd hh:mm:ss").toString(),
                          endTime:date1.format("yyyy-MM-dd hh:mm:ss").toString(),
                          interval:24.00.toFixed(2),
                          status:status[lastest.num_val]
                        })
                        _this.gridData = q;
                        _this.pieLoading = false
                        _this.disabled = false
                        return;
                      }
                    n = response.data.length;
                      _this.pageNumber = Math.ceil(n%_this.pageSize ? n/_this.pageSize : n/_this.pageSize +1);
                      q.push({
                      startTime:date2.format("yyyy-MM-dd hh:mm:ss").toString(),
                      endTime:new Date(response.data[0].smpl_time).format("yyyy-MM-dd hh:mm:ss").toString(),
                      interval:((new Date(response.data[0].smpl_time) - date2)/(60*60*1000)).toFixed(2),
                      status:status[lastest.num_val]
                    })
                  for (let i = 0; i < n-1; i++){
                    startTime = new Date(response.data[i].smpl_time);
                    endTime = new Date(response.data[i+1].smpl_time);
                    q.push({
                      startTime:startTime.format("yyyy-MM-dd hh:mm:ss").toString(),
                      endTime:endTime.format("yyyy-MM-dd hh:mm:ss").toString(),
                      interval:((endTime-startTime)/(60*60*1000)).toFixed(2),
                      status:status[response.data[i].num_val]
                    })
                  }
                  q.push({
                    startTime:new Date(response.data[n-1].smpl_time).format("yyyy-MM-dd hh:mm:ss").toString(),
                    endTime:date1.format("yyyy-MM-dd hh:mm:ss").toString(),
                    interval:((date1 - (new Date(response.data[n-1].smpl_time)))/(60*60*1000)).toFixed(2),
                    status:status[response.data[n-1].num_val]
                  })
                  _this.gridData = q;
                  _this.pieLoading = false
                  _this.disabled = false
                })
              })
            function  calc1(date3) {
              var days=Math.floor(date3/(24*3600*1000))
              let result = "";
              if(days != 0){
                result = result + days + " d "

              }
              //计算出小时数

              var leave1=date3%(24*3600*1000)    //计算天数后剩余的毫秒数
              var hours=Math.floor(leave1/(3600*1000))
              if(hours != 0){
                result = result + hours + " h "
              }
              //计算相差分钟数
              var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
              var minutes=Math.floor(leave2/(60*1000))
              //计算相差秒数
              if(minutes != 0){
                result = result + minutes + " min "
              }
              var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
            var seconds=Math.round(leave3/1000)
            var milliseconds = leave3%1000
            if(seconds != 0){
              result = result + seconds + " s "
            }
            if(milliseconds != 0){
              result = result + milliseconds + " ms "
            }
            return result
            }
          },
          pageChange:function (val) {
            this.currentPage = val;
          },
          tableRowClassName({row, rowIndex}) {
            if (rowIndex === 1) {
              return 'warning-row';
            } else if (rowIndex === 3) {
              return 'success-row';
            }
            return '';
          }
        }
    }

</script>

<style scoped>
  .el-table .warning-row {
    background: oldlace;
  }

  .el-table .success-row {
    background: #f0f9eb;
  }
</style>
