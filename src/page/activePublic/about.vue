<template>
  <div align="center" style="width: 100%">
    <el-card class="box-card" style="border-radius: 8px;margin-top: 20px; width: 70%" align="center">
      <table width="70%" align="center">
        <tr>
          <td>
            <h3><a id="_0"></a>系统说明</h3>
            <p>该系统全称为新一代合肥光源数据查询与分析系统，基于Spring Boot和Vue.js开发， 包含如下功能：</p>
            <ul>
              <li>运行状态24h实时显示
                <ul>
                  <li>束流流强和束流寿命  <a href="http://222.195.82.3/home">http://222.195.82.3/home</a></li>
                </ul>
              </li>
              <li>历史数据查询
                <ul>
                  <li>历史数据分组查询 <a href="http://222.195.82.3/history/customizedquery">http://222.195.82.3/history/customizedquery</a></li>
                  <li>历史数据自定义查询 <a href="http://222.195.82.3//history/freequery">http://222.195.82.3/history/freequery</a></li>
                </ul>
              </li>
              <li>数据分析
                <ul>
                  <li>运行模式与运行状态统计画图  <a href="http://222.195.82.3/analysis/operstatstatistics">http://222.195.82.3/analysis/operstatstatistics</a></li>
                  <li>列表显示 <a href="http://222.195.82.3/analysis/operstatlist">http://222.195.82.3/analysis/operstatlist</a></li>
                  <li>积分流强计算 <a href="http://222.195.82.3/analysis/integral">http://222.195.82.3/analysis/integral</a></li>
                </ul>
              </li>
              <li>报警信息查询
                <ul>
                  <li>查询pv记录的报警状态 <a href="">TODO</a></li>
                </ul>
              </li>
              <li>辐射计量监测
                <ul>
                  <li>实时监测环内辐射剂量变化<a href="http://222.195.82.3/radiation">http://222.195.82.88:8080/radiation</a></li>
                </ul>
              </li>
            </ul>
            <h3><a id="_15"></a>使用注意</h3>
            <ul>
              <li>当查询多条记录历史时，为了避免压缩图表绘图的空间，图例会分页展示，可点击图表左下角进行翻页</li>
              <li>在下载时会有进度条显示下载进度，此时请不要刷新页面，否则下载进程将中断，也不要点击其他PV，否则下载进度将不再显示</li>
              <li>如果前面长期没有人统计过积分流强，那么第一次统计积分流强会较缓慢，请耐心等待。</li>
              <li>如果页面出现卡顿或者其他异常，请尝试刷新页面</li>
              <li>在进行绘图时，由于性能限制，最多绘制4000个点，数据是由在数据库中按时间顺序和固定间隔取得</li>
              <li>在进行下载时，请先等待系统预估下载文件大小和下载时间，然后再点击确认下载</li>
            </ul>
            <h3><a id="_20"></a>其他</h3>
            <ul>
              <li>如有任何问题，请联系 <a href="mailto:xzyuan@mail.ustc.edu.cn">xzyuan@mail.ustc.edu.cn</a> 或者 <a href="mailto:gfliu@ustc.edu.cn">gfliu@ustc.edu.cn</a></li>
              <!--<li>系统源代码托管于 <a href="mailto:git@gitlab.com">git@gitlab.com:nsrl-control/hls.git</a>，若需要源代码或者需要开发文档,请申请加入gitlab中nsrl-control组，欢迎作为开发者加入nsrl-control。</li>-->
            </ul>
          </td>
        </tr>
      </table>
    </el-card>
  </div>
</template>

<script>
    export default {
        name: "help"
    }
</script>

<style scoped>
  body,table {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 16px;
  }
  a.a1:link {
    COLOR: #FFFFFF;
    TEXT-DECORATION: none;
    font-weight: bold;
    font-size: 18px
  }

  a.a1:visited {
    COLOR: #FFFFFF;
    TEXT-DECORATION: none;
    font-weight: bold;
    font-size: 18px
  }

  a.a1:active {
    COLOR: #F5F5F5;
    TEXT-DECORATION: underline;
    font-weight: bold;
    font-size: 18px
  }

  a.a1:hover {
    COLOR: #C0C0C0;
    TEXT-DECORATION: none;
    font-weight: bold;
    font-size: 18px
  }
</style>
