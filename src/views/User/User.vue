<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="searchHandle"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
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
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChanged(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <el-button
              size="small"
              icon="el-icon-edit"
              type="primary"
              plain
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <el-button
              size="small"
              icon="el-icon-delete"
              type="warning"
              plain
              @click="deleteUser(scope.row.id)"
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
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加新用户 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addUserForm"
    >
      <el-form
        :rules="userRules"
        ref="userRefForm"
        :model="addUserForm"
        label-width="70px"
      >
        <el-form-item label="用户" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="电话" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="提示" :visible.sync="aditDialogVisible" width="50%">
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="ruleForm"
        label-width="80px"
        @close="clearEditForm"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.username"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="aditDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="aditDialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    // 验证邮箱的正则表达式
    var checkEmail = (rule, value, callback) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) return callback()
      callback(new Error('请输入合法的邮箱'))
    }
    // 验证手机的正则表达式
    var checkMobile = (rule, value, callback) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) return callback()
      callback(new Error('请输入正确的手机号码'))
    }
    return {
      queryInfo: {
        query: '', // 用户搜索，查询的关键字
        pagenum: 1, // 当前的页码
        pagesize: 5 // 每页显示的太偶数
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户列表的弹出层的验证规则
      userRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '请输入正确的密码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入正确邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入正确手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      aditDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入正确邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入正确手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]

      }
    }
  },
  created () {
    this.getUserList()
  },
  methods: {
    async deleteUser (id) {
      // 询问是否要删除
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.error('已经取消删除')
      }
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败！ ')
      this.$message.success('删除用户成功！ ')
      this.getUserList()
    },
    // 删除用户
    // async deleteUser (userId) {
    //   const confirmRes = await this.$confirm('是否删除该用户, 是否继续?', '提示', {
    //     confirmButtonText: '确定',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).cath(err => err)
    //   if (confirmRes !== 'confirm') {
    //     return this.$message.error('已经取消删除')
    //   }
    //   const { data: res } = await this.$http.delete(`users/${userId}`)
    //   if (res.meta.status !== 200) return this.$message.error('删除用户失败！ ')
    //   this.$message.success('删除用户成功！ ')
    //   this.getUserList()
    // },
    // 编辑用户
    toEdit () {
      this.$refs.ruleForm.validate(async (vaild) => {
        if (!vaild) return this.$message.error('请检查用户名')

        const { data: res } = await this.$http.put(`users/${this.editForm.id}, this.editForm`)
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.editDialogVisibale = false
        this.getUserList()
      })
    },
    // 重置用户
    clearEditForm () {
      this.$refs.ruleForm.resetFields()
    },

    // 展示编辑用户弹框
    async showEditDialog (userId) {
      this.aditDialogVisible = true
      const { data: res } = await this.$http.get(`users/${userId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.editForm = res.data
      this.aditDialogVisible = true
    },

    // 点击确定时将弹出表单添加到用户列表中
    async addUser () {
      const { data: res } = await this.$http.post('users', this.addUserForm)
      if (res.meta.status !== 201) return res.$message.error('用户创建失败')

      this.getUserList()
      this.$message.success(res.meta.msg)
      this.addDialogVisible = false
    },
    searchHandle () {
      this.getUserList()
    },
    async userStateChanged (userInfo) {
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error(res.meta.msg)
      }
      this.$message.success(res.meta.msg)
    },
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
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
