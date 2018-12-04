<template>
    <el-table :data="gridData">
      <el-table-column label="文件名"></el-table-column>
      <el-table-column label="生成日期"></el-table-column>
      <el-table-column label="文件大小"></el-table-column>
    </el-table>
</template>

<script>
    export default {
        name: "filerecords",
        date:{
          return:{
            gridData:[]
          }
        }
    }
</script>

<style scoped>

</style>
