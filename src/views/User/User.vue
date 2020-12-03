<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="query.query" clearable @clear='getUserList'>
            <el-button slot="append" icon="el-icon-search" @click='searchHandle'></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary">添加用户</el-button>
        </el-col>
      </el-row>
    <el-table :data="userList" style="width: 100%" border stripe>
      <el-table-column type="index"></el-table-column>
      <el-table-column
        align="center"
        label="姓名"
        prop="username"
      ></el-table-column>
      <el-table-column
        align="center"
        label="邮箱"
        prop="email"
      ></el-table-column>
      <el-table-column
        align="center"
        label="电话"
        prop="mobile"
      ></el-table-column>
      <el-table-column
        align="center"
        label="角色"
        prop="role_name"
      ></el-table-column>
      <el-table-column align="center" label="状态" prop="mg_state">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change='userStateChanged(scope.row)'></el-switch>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template>
          <el-button
            size="small"
            icon="el-icon-edit"
            type="primary"
            plain
          ></el-button>
          <el-button
            size="small"
            icon="el-icon-delete"
            type="warning"
            plain
          ></el-button>
          <el-tooltip
            class="item"
            effect="dark"
            content="分配权限"
            placement="top"
            :enterable="false"
          >
            <el-button
              size="small"
              icon="el-icon-s-tools"
              type="warning"
              plain
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="query.pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="query.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    >
    </el-pagination>

   </el-card>
  </div>
</template>

<script>
export default {
  data () {
    return {
      query: {
        query: '', // 用户搜索，查询的关键字
        pagenum: 1, // 当前的页码
        pagesize: 5 // 每页显示的太偶数
      },
      userList: [],
      total: 0
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    searchHandle () {
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.query
      })

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 12px;
}

.el-table {
  margin-top: 15px;
  font-size: 12px;
}

.el-pagination {
  margin-top: 15px;
}
</style>
