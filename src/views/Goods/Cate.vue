<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区 -->
    <el-card>
      <el-row>
        <el-col :span="4">
          <el-button type="primary" plain @click="showAddDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :show-row-hover="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" type="success" v-if="scope.row.cat_level === 0"
            >标签二</el-tag>
          <el-tag
            size="mini"
            type="warning"
            v-else-if="scope.row.cat_level === 1">标签四</el-tag>
          <el-tag size="mini" type="danger" v-else>标签五</el-tag>
        </template>

        <template slot="opt">
          <el-button size="mini" type="primary" icon="el-icon-edit" disabled
            >编辑</el-button
          >
          <el-button size="mini" type="danger" icon="el-icon-delet" disabled
            >删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="query.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="query.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>

    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="restCateDiaLogClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateRuleForm" label-width="100px" >
        <el-form-item label="活动名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

          <!-- options指向的是数据源 -->
        <el-form-item label="父级分类" >
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderOpt"
            @change="handleChange"
            clearable
            change-on-select>
          </el-cascader>
        </el-form-item>

      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data () {
    return {
      query: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template', // 表示当前的列定义为模板
          template: 'isok' // 作用域插槽名称
        },
        {
          label: '排序',
          type: 'template', // 表示当前的列定义为模板
          template: 'order' // 作用域插槽名称
        },
        {
          label: '操作',
          type: 'template', // 表示当前的列定义为模板
          template: 'opt' // 作用域插槽名称
        }
      ],
      addCateDialogVisible: false,
      // 添加分类对话框的显示与隐藏
      addCateForm: {
        cat_name: '', // 分类名称
        cat_pid: 0, // 分类id
        cat_level: 0 // 权限层级
      },
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }

        ]
      },
      cascaderOpt: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      parentCateList: []
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    async getCateList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.query
      })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      console.log(res.data.result)
      this.cateList = res.data.result
    },
    handleSizeChange (newSize) {
      this.query.pagesize = newSize
      this.getCateList()
    },
    handleCurrentChange (newNum) {
      this.query.pagenum = newNum
      this.getCateList()
    },
    // 点击添加分类按钮 ，展示添加分类的对话框
    showAddDialog () {
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类的对话框
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败')
      this.parentCateList = res.data
    },
    // 点击按钮，展示添加分类的对话框
    handleChange () {
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        // 为当前分类的等级赋值
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    addCate () {
      this.$refs.addCateRuleForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 2001) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },

    // 监听对话框的关闭事件，重置表单数据
    restCateDiaLogClosed () {
      this.$refs.addCateRuleForm.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    }
    // 点击确定时添加新的分类
  }
}
</script>

<style>
</style>
