<template>
  <div >
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-alert title="消息提示的文案" type="info" center show-icon></el-alert>
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form :model="addGoodsForm" :rules="addGoodRules" ref="addGoodsForm" label-width="100px" label-position='left'>
        <!-- tab栏切换 -->
        <el-tabs v-model="activeIndex" tab-position="left" :before-leave='beforeLeave' @tab-click='changeTabsHandle'>
          <el-tab-pane label="基本信息" name="0" >
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name" ></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" ></el-input>
            </el-form-item>

            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" ></el-input>
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" ></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="AddGoodsList"
                :props="cascaderProps"
                @change="handleChange"></el-cascader>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label='item.attr_name' v-for="item in manyData " :key="item.attr_id">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label='item1' v-for="(item1, index1) in item.attr_vals " :key="index1" ></el-checkbox>
                </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>

          <el-tab-pane label="商品属性" name="2">商品属性
            <el-form-item :label='item.attr_name' v-for="(item ,index) in onlyData " :key="index">
               <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              action="http://8.131.91.46:7000/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :headers='handerObj'
              :on-success='handleSuccess'
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <el-button type="warning" class="publish" @click="publish">发布商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <el-dialog
  title="图片预览"
  :visible.sync="previewDialog"
  width="50%" @close='removeImage'>
 <img src="previewImg" class="preview-img" alt="">
</el-dialog>
  </div>
</template>

<script>

export default {
  name: 'AddGoods',
  data () {
    return {
      activeIndex: 0,
      addGoodsForm: {
        goods_name: '',
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_cat: [],
        pics: []
      },
      addGoodRules: {
        goods_name: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入活动名称', trigger: 'blur' }
        ]

      },
      // 商品分类参数列表
      AddGoodsList: [],
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      manyData: [],
      onlyData: [],
      handerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      previewDialog: false,
      previewImg: ''
    }
  },
  created () {
    this.getAddGoodsList()
  },
  methods: {
    async getAddGoodsList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.AddGoodsList = res.data
    },
    // 切换tabs时触发的方法
    beforeLeave (activeName, oldActiveName) {
      if (this.addGoodsForm.goods_cat.length !== 3 && oldActiveName === '0') {
        this.$message.error('请选择分类')
        // retun false 组织跳转到另一个tab
        return false
      }
    },
    // 联级选择器下发生change时触发的方法
    handleChange () {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },
    // 切换tabs 栏事件
    async changeTabsHandle () {
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes`,
          { params: { sel: 'many' } })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.$message.success(res.meta.msg)
        console.log(res)
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.getCateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
        this.onlyData = res.data
      }
    },
    // 预览图片的方法
    handlePreview (file) {
      const imgUrl = file.response.data.imgUrl
      this.previewImg = imgUrl
      this.previewDialog = true
    },
    // 关闭弹框以后，移除data中的预览图片
    removeImage () {
      this.previewImg = ''
    },

    // 删除上传图片的方法
    // handleRemove (file) {
    //   const removeImg = file.response.data.tmp_path
    //   const index = this.addGoodsForm.pics.findIndex(item => item.pic === removeImg)
    //   this.addGoodsForm.pics.splice(index, 1)
    // },
    // j解构写法
    handleRemove (file) {
      const { pics } = this.addGoodsForm
      const removeImg = file.response.data.tmp_path
      const index = pics.findIndex(item => item.pic === removeImg)
      pics.splice(index, 1)
    },

    // 图片上传触发的方法
    handleSuccess (response) {
      if (response.meta.status !== 200) {
        return this.$message.error('上传失败，请重新上传')
      }
      const imgObj = {
        pic: response.data.tmp_path
      }
      this.addGoodsForm.pics.push(imgObj)
    },
    // 点击发布的事件
    publish () {
      this.$refs.addGoodsForm.validate(async valid => {
        if (!valid) return this.$message.error('请输入商品的参数')
        const { goods_cat: goodsCat } = this.addGoodsForm
        this.addGoodsForm.goods_cat = goodsCat.join(',')
        // 处理动态参数为接口要求的个式
        this.manyData.forEach(item => {
          const newData = {
            attr_id: item.attr_id,
            attr_value: item.attr_value.join(',')
          }
          this.addGoodsForm.attrs.push(newData)
        })
        this.onlyData.forEach(item => {
          const newData = {
            att_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addGoodsForm.attrs.push(newData)
        })
      })
    }
  },
  computed: {
    getCateId () {
      const { goods_cat: goodsCat } = this.addGoodsForm
      if (goodsCat.length !== 3) {
        return null
      }
      const length = goodsCat.length
      return goodsCat[length - 1]
    }
  }
}
</script>

<style lang="less" scoped>
.box-card{
  margin-top: 16px;
}

.el-steps{
margin: 20px 0;

  /deep/ .el-step__title {
  font-size: 14px;
}
}
</style>
