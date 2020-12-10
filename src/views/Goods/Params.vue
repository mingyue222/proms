<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 警告提示区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关的参数"
        type="warning"
        show-icon
      >
      </el-alert>

      <!-- 级联选择器 -->
      <el-row class="params-opt">
        <el-col>
          <span>选择商品分类：</span>
          <el-cascader
            v-model="selectKeys"
            :options="cateList"
            :props="cascaderOpt"
            @change="cascaderSelect"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs 切换栏 -->
      <!-- v-model：tabs 标签选中的 tab 项的 name 值 -->
      <!-- tab-click：tabs 发生切换时触发的事件 -->
      <el-tabs v-model="activeName" @tab-click="tabClick">
        <!-- label：tab 面板的标题  -->
        <!-- name：tab 面板的标识符，也是别名 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            size="small"
            :disabled="isBtnDisable"
            @click="addFormdialogVisible = true"
            >动态参数</el-button
          >

          <el-table :data="manyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleColse(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 新增属性参数 -->
                <!-- @keyup.enter.native：光标离开输入框 或者 按回车以后 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  icon="el-icon-edit"
                  type="warning"
                  @click="toEdit(scope.row)"
                  plain
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  icon="el-icon-delete"
                  type="danger"
                  @click="deleteParams(scope.row)"
                  plain
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-button
            size="small"
            :disabled="isBtnDisable"
            @click="addFormdialogVisible = true"
            >静态属性</el-button
          >

          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  closable
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  @close="handleColse(index, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 新增属性参数 -->
                <!-- @keyup.enter.native：光标离开输入框 或者 按回车以后 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"> </el-table-column>
            <el-table-column prop="attr_name" label="参数名称">
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="small"
                  icon="el-icon-edit"
                  type="warning"
                  @click="toEdit(scope.row)"
                  plain
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  icon="el-icon-delete"
                  type="danger"
                  @click="deleteParams(scope.row)"
                  plain
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加属性和参数 -->
    <el-dialog
      :title="'添加' + textTitle"
      :visible.sync="addFormdialogVisible"
      width="50%"
      @close="clearDialog"
    >
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addFormdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + textTitle"
      :visible.sync="editDialog"
      width="50%"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="textTitle" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog = false">取 消</el-button>
        <el-button type="primary" @click="toParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodsParams',
  data () {
    return {
      cateList: [], // 分类的数据列表
      selectKeys: [], // 选中的分类数组
      // 级联选择器的配置对象
      cascaderOpt: {
        expandTrigger: 'click', // 菜单展开方式
        value: 'cat_id', // 选择级联选择器后获取到的数据字段
        label: 'cat_name' // 级联选择器用户看到的文本信息
      },
      activeName: 'many', // tabs 标签选中项
      manyTableData: [], // 动态参数的数据列表
      onlyTableData: [], // 静态属性的数据列表
      addFormdialogVisible: false, // 控制添加属性弹框隐藏和展示
      // 添加属性的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加属性的表单数据对象的校验
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },
      editDialog: false, // 控制修改参数的弹框
      // 编辑属性的表单数据对象
      editForm: {},
      // 编辑属性的表单数据对象的校验
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入属性名称', trigger: 'blur' },
          { min: 1, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
        ]
      },
      inputVisible: false, // 控制按钮和文本框切换
      inputValue: '' // 文本框输入的内容
    }
  },
  created () {
    // 调用获取分类数据的方法
    this.getCate()
  },
  methods: {
    // 点击按钮控制输入框展示
    showInput (role) {
      role.inputVisible = true

      // 在修改数据之后立即使用这个方法，获取更新后的 DOM。
      // 当数据改变以后，会驱动 UI 发生改变
      // 但是最新的 UI 渲染到页面上需要一定的时间
      // 如果在更改状态、数据以后，直接来获取 DOM 元素，可能会失败
      // 因此如果想在 DOM 结构渲染好以后，执行某一个操作
      // 就必须把这个操作放到 this.$nextTick 内部的回调函数中
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus()
      })
    },

    // 输入框切换到按钮以后触发的事件
    async handleInputConfirm (role) {
      if (role.inputValue.trim().length === 0) {
        role.inputValue = ''
        role.inputVisible = false

        return
      }

      // 将最新的 inputvalue 值放到参数数组中
      role.attr_vals.push(role.inputValue)
      role.inputValue = ''
      role.inputVisible = false

      this.updateParams(role)
    },

    // 删除分类参数
    handleColse (i, role) {
      // 获取到索引和需要删除的数据(数据在 scope.row 中获取)
      // 使用 splice 删除相关的数据
      role.attr_vals.splice(i, 1)

      // 调用封装的方法，传入删除以后的数据即可
      this.updateParams(role)
    },

    // 添加/删除分类参数共用的方法
    // 就是放到 data 中的数据都具有响应式
    async updateParams (role) {
      // 发起请求
      const { data: res } = await this.$http.put(`categories/${this.getId}/attributes/${role.attr_id}`, {
        attr_name: role.attr_name,
        attr_sel: this.activeName,
        attr_vals: role.attr_vals.join(' ') // 后台接口要求传递的参数必须为 string 类型，因此需要使用 join 将数组转成 string
      })

      if (res.meta.status !== 200) {
        // 如果没有添加成功，需要将添加的那一项使用 pop() 进行移除
        role.attr_vals.pop()
        return this.$message.error(res.meta.msg)
      }

      // 给用户添加提示即可，不需要重新调用接口获取数据
      // 因为页面已经改变，同步到页面，用户刷新界面后，会重新获取数据，最新添加的也能够看到
      this.$message.success(res.meta.msg)
    },

    // 删除属性
    async deleteParams (paramsId) {
      const confimRes = await this.$confirm(
        '此操作将永久删除该文件, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)

      if (confimRes !== 'confirm') {
        return this.$message.error('您取消了删除')
      }

      const { data: res } = await this.$http.delete(
        `categories/${this.getId}/attributes/${paramsId.attr_id}`
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.$message.success(res.meta.msg)
      this.getTabsData()
    },

    // 编辑参数
    toParams () {
      this.$refs.editFormRef.validate(async (valid) => {
        // 预校验，查看参数是否正确
        if (!valid) {
          return this.$message.error('请输入正确的参数名')
        }

        // 调用接口，发起更新请求
        const { data: res } = await this.$http.put(
          `categories/${this.getId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success(res.meta.msg)
        // 重新渲染数据
        this.getTabsData()
        // 控制弹框隐藏
        this.editDialog = false
      })
    },

    // 属性和参数的编辑方法
    async toEdit (paramsInfo) {
      const { data: res } = await this.$http.get(
        `categories/${this.getId}/attributes/${paramsInfo.attr_id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      // 将返回的数据赋值给 editForm 即可
      this.editForm = res.data
      // 控制弹框的显示
      this.editDialog = true
    },

    // 添加属性
    addParams () {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请检查属性名')
        }

        const { data: res } = await this.$http.post(
          `categories/${this.getId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )

        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success(res.meta.msg)
        this.getTabsData()

        this.addFormdialogVisible = false
      })
    },

    // 清空添加属性的表单数据
    clearDialog () {
      this.$refs.addFormRef.resetFields()
    },

    // tabs 标签切换时触发的方法
    tabClick () {
      if (this.selectKeys.length !== 3) return false

      this.getTabsData()
    },

    // 获取静态属性和动态参数的方法
    async getTabsData () {
      // // 通过索引获取到三级分类的 ID
      // const index = this.selectKeys.length - 1
      // const id = this.selectKeys[index]

      const { data: res } = await this.$http.get(
        `categories/${this.getId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      console.log(res.data)
      res.data.forEach((item) => {
        // 边界问题
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      })

      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },

    // 级联选择器器改变时触发的方法
    cascaderSelect () {
      // 控制级联选择器选中的范围
      if (this.selectKeys.length !== 3) {
        this.selectKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        // 只写一个 return，代码检查工具会报错，写成 return false 即可
        return false
      }

      this.getTabsData()
    },

    // 获取分类数据的方法
    async getCate () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.cateList = res.data
    }
  },
  computed: {
    // 利用计算属性判断 this.selectKeys 的长度
    // 决定是否禁用按钮
    // 如果长度不等于 3 ，则禁用按钮
    // 否则不禁用按钮
    isBtnDisable () {
      if (this.selectKeys.length !== 3) {
        return true
      }

      return false
    },

    // 添加静态属性和动态参数的弹框文本
    textTitle () {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    },

    getId () {
      if (this.selectKeys.length !== 3) {
        return null
      }

      // 通过索引获取到三级分类的 ID
      const index = this.selectKeys.length - 1
      const id = this.selectKeys[index]

      return id
    }
  }
}
</script>

<style lang="less" scoped>
.params-opt {
  margin-top: 30px;
}

.el-tabs {
  margin-top: 16px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 100px;
}
</style>
