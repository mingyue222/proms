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
          <template slot-scope='scope'>
              <el-button size="small" type="success" icon="el-icon-search" plain>编辑</el-button>
              <el-button size="small" type="warning" icon="el-icon-delete" plain>删除</el-button>
              <el-button size="small" type="danger" icon="el-icon-s-tools" plain @click="showSetRightDialog(scope.row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width="50%"
  @close='hideSetRightsDiglog'
  >
  <!-- data:是数据源 -->
  <!-- props:就是告诉tree组件按照那种格式渲染数据，确定渲染的父子级别关系 -->
 <el-tree ref="rightRef" :data="rightList" :props="treeProps" show-checkbox default-expand-all node-key='id' :default-checked-keys='defKeys'></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary" @click="setRghts">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      rolesList: [],
      setRightDialogVisible: false,
      rightList: [],

      // 树形组件需要的属性格式
      treeProps: {
        label: 'authName', // 是指树形组件显示为文本
        children: 'children' // 只是如何确认数据的父子级别关系
      },
      defKeys: [],
      roldId: ''
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
    },
    // 设置处理默认选中项的方法
    async showSetRightDialog (role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.rightList = res.data
      this.roldId = role.id
      // 调用处理默认选中的方法
      this.getLetKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // node 指需要处理的数据
    // arr:实际上就是指 defkeys
    getLetKeys (node, arr) {
      // 如果没有处理的数据没有children 属性，说明是三级的权限，只需要将id追加到defkeys
      if (!node.children) return arr.push(node.id)
      // 如果包含 children 属性 说明一级或者二级权限。需要进行遍历
      // 遍历以后对每一项都调用 getLetKeys 方法， 判断是否存在children属性
      node.children.forEach(item => this.getLetKeys(item, arr))
    },
    hideSetRightsDiglog () {
      this.defKeys = []
    },
    async setRghts () {
      const keys = [...this.$refs.rightRef.getCheckedKeys(), ...this.$refs.rightRef.getHalfCheckedKeys()]
      console.log(keys)
      const newKeys = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roldId}/rights`, { rids: newKeys })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success('权限分配成功')
      this.getRolesList()
      this.setRightDialogVisible = false
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
