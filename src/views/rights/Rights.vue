<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 表格区域 -->
      <el-table :data="rightsList" style="width: 100%" border stripe>
        <el-table-column type="index" label="#" align="center">
        </el-table-column>
        <el-table-column prop="authName" label="权限名称" align="center">
        </el-table-column>
        <el-table-column prop="path" label="路径" align="center">
        </el-table-column>
        <el-table-column prop="level" label="权限等级" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.level==='0'" type="success">一级</el-tag>
            <el-tag v-else-if="scope.row.level==='1'" type="warning">二级</el-tag>
            <el-tag v-else type="danger">三级</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data () {
    return {
      rightsList: []
    }
  },
  created () {
    // 调用获取权限列表的方法
    this.getRightsList()
  },
  methods: {
    // 获取权限列表的方法
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      // console.log(res)
      if (res.meta.status !== 200) {
        return this.$msg.error(res.meta.msg)
      }
      this.rightsList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 16px;
}
</style>
