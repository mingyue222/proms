<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="box-card">
      <el-row>
       <el-col :span="4">
          <el-button type="primary" plain>添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table :data="rolesList" style="width: 100%" stripe border >
        <el-table-column align="center" type='expand'>
        <template slot-scope="scope">
          <!-- 一级权限 -->

          <el-row :class="['border-b',index1 ===0 ? 'border-t' : '']" v-for="(item ,index1) in scope.row.children" :key="item.id">
            <el-col :span="5">
              <el-tag @close='removeRight(scope.row, item.id)' type="success"> {{ item.authName }} </el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>

            <!-- 二级权限 -->
            <el-col :span="19">
              <el-row :class="[index2 === 0 ? '' :'border-t']" v-for="(item2,index2) in item.children" :key="item2.id">
                  <el-tag @close='removeRight(scope.row, item2.id)' type="success"> {{ item2.authName }} </el-tag>
                  <i class="el-icon-caret-right"></i>
                  <!-- 三级权限 -->
                    <el-col :span="19">
                  <el-tag @close='removeRight(scope.row, item3.id)' closable type="danger" v-for="item3 in item2.children" :key="item3.id">{{ item3.authName }}</el-tag>
            </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
        </el-table-column>
        <el-table-column align="center" label="#" type="index"></el-table-column>
        <el-table-column align="center" label="角色管理" prop='roleName'></el-table-column>
        <el-table-column align="center" label="角色描述" prop='roleDesc' ></el-table-column>
        <el-table-column align="center" label="操作" >
          <template>
              <el-button size="small" type="success" icon="el-icon-search" plain>编辑</el-button>
              <el-button size="small" type="warning" icon="el-icon-delete" plain>删除</el-button>
              <el-button size="small" type="danger" icon="el-icon-s-tools" plain>编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      rolesList: []
    }
  },
  created () {
    this.getRolesList()
  },
  methods: {
    // 删除指定权限
    async removeRight (role, rightId) {
      // 询问是否要删除
      const confirmRes = await this.$confirm('是否确定删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRes !== 'confirm') {
        return this.$message.error('取消删除')
      }

      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.error('删除失败！ ')
      this.$message.success('删除用户成功！ ')
      role.children = res.data
    },

    // 获取用户权限列表
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

      this.rolesList = res.data
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag{
  margin: 10px;
}
.border-t{
  border-top: 1px solid #eee;
}
.border-b{
  border-bottom: 1px solid #eee;
}
</style>
