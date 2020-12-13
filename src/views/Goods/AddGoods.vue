<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- 提示栏 -->
      <el-alert title="添加商品信息" type="info" center show-icon> </el-alert>

      <!-- 步骤条 -->
      <!-- active: 被选中，被激活的那一项，值只 number 类型 -->
      <el-steps :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsRef"
        label-width="100px"
      >
        <!-- tabs 标签页 -->
        <!-- v-model：被选中的 tab 项，值为 string 类型 -->
        <el-tabs
          v-model="activeIndex"
          tab-position="left"
          :before-leave="beforeLeave"
          @tab-click="changeTabsHandle"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称：" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格：" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量：" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量：" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类：" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cascaderOpt"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item1"
                  v-for="(item1, index1) in item.attr_vals"
                  :key="index1"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="(item, index) in onlyData"
              :key="index"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action：必选参数，上传的地址 -->
            <el-upload
              action="http://8.131.91.46:7000/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :headers="headerObj"
              list-type="picture"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>

            <el-button @click="publish" class="publish" type="warning">发布商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <el-dialog
      title="图片预览"
      :visible.sync="previewDialog"
      width="50%"
      @close="removeImg"
    >
      <img :src="previewImg" class="preview-img" alt="" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'addGoods',
  data () {
    return {
      previewDialog: false, // 控制预览图片的弹框
      previewImg: '', // 预览的图片
      activeIndex: '0',
      // 添加商品的数据对象
      addGoodsForm: {
        goods_name: '', // 商品名称
        goods_price: '', // 商品价格
        goods_weight: '', // 商品重量
        goods_number: '', // 商品数量
        goods_cat: [], // 商品分类
        pics: [], // 上传的图片列表
        goods_introduce: '', // 商品的内容
        attrs: []
      },
      // 添加商品的数据对象的校验规则
      addGoodsFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ]
      },
      cateList: [], // 商品分类参数列表
      // 级联选择器配置对象
      cascaderOpt: {
        expandTrigger: 'hover',
        label: 'cat_name',
        value: 'cat_id'
      },
      manyData: [], // 动态参数数据
      onlyData: [], // 静态属性数据
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      }
    }
  },
  created () {
    // 调用获取商品的分类
    this.getGoodsCate()
  },
  methods: {
    // 发布商品
    publish () {
      this.$refs.addGoodsRef.validate(async valid => {
        if (!valid) return this.$message.error('请输入商品的参数')

        const { goods_cat: goodsCat } = this.addGoodsForm

        // 商品分类处理成字符串形式
        const newGoodsCate = goodsCat.join(',')
        this.addGoodsForm.goods_cat = newGoodsCate

        // 处理动态参数为接口要求的格式
        this.manyData.forEach(item => {
          const newData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(',')
          }

          this.addGoodsForm.attrs.push(newData)
        })

        // 处理静态参数为接口要求的形式
        this.onlyData.forEach(item => {
          const newData = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }

          this.addGoodsForm.attrs.push(newData)
        })

        // 处理参数
        this.addGoodsForm.pics = JSON.stringify(this.addGoodsForm.pics)
        // this.addGoodsForm.pics = this.addGoodsForm.pics.toString()

        console.log(this.addGoodsForm)
        const { data: res } = await this.$http.post('goods', this.addGoodsForm)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }

        this.$message.success(res.meta.msg)
        this.$router.push('/goods')
      })
    },

    // 图片上传成功触发的方法
    handleSuccess (response) {
      if (response.meta.status !== 200) {
        return this.$message.error('上传失败，请重新上传')
      }

      // 处理上传的图片
      const imgObj = {
        pic: response.data.tmp_path
      }

      this.addGoodsForm.pics.push(imgObj)
    },

    // 预览图片的方法
    // file 为预览的那一条图片信息
    handlePreview (file) {
      // 获取到阅览的图片
      const imgUrl = file.response.data.url

      // 赋值给 data 中的数据，并赋值给弹框中的 src
      this.previewImg = imgUrl
      // 控制展示弹框的展示
      this.previewDialog = true
    },

    // 关闭弹框以后，移除 data 中的预览图片
    removeImg () {
      this.previewImg = ''
    },

    // 删除上传图片的方法
    // file 参数就是指被移除的图片信息
    handleRemove (file) {
      const { pics } = this.addGoodsForm
      // 根据 file 获取到删除的图片
      const removeImg = file.response.data.tmp_path
      // 从 pics 中获取到删除图片的索引
      const index = pics.findIndex((item) => item.pic === removeImg)
      // 从数组中根据索引移除图片
      pics.splice(index, 1)
    },

    // 切换 tabs 栏事件
    async changeTabsHandle () {
      // 如果activeIndex === 1，说明是商品参数
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.getCateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta)
        }

        res.data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })

        this.manyData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.getCateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.onlyData = res.data
      }
    },

    // 切换 tabs 时触发的方法
    beforeLeave (activeName, oldActiveName) {
      const cateLength = this.addGoodsForm.goods_cat.length
      if (cateLength !== 3 && oldActiveName === '0') {
        this.$message.error('请选择分类')

        // return false 阻止跳转到另一个 tab
        return false
      }
    },

    // 级联选择器切换时触发的方法
    handleChange () {
      const cateLength = this.addGoodsForm.goods_cat.length

      if (cateLength !== 3) {
        this.addGoodsForm.goods_cat = []
      }
    },

    // 获取商品的分类
    async getGoodsCate () {
      const { data: res } = await this.$http.get('categories')

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.cateList = res.data
    }
  },
  computed: {
    getCateId () {
      // 从 this.addGoodsForm 对象中解构出 goods_cat 分类数组
      // 并将 goods_cat 重命名为 goodsCat
      const { goods_cat: goodsCat } = this.addGoodsForm

      // 判断分类数组的长度，是否等于 3 ，如果等于 3，说明是三级分类
      // 如果不等于 3 ，说明是 一级 或者 二级

      // 如果不等于 3 ，直接返回 null
      if (goodsCat.length !== 3) {
        return null
      }
      // 如果等于 3，获取到分类数据的长度，然后减 1，等于 2
      // 然后取到数组中索引为 2 的那一项，就是分类的 ID
      const length = goodsCat.length
      return goodsCat[length - 1]
    }
  }
}
</script>

<style lang="less" scoped>
.el-steps {
  margin: 20px 0;

  // /deep/ 称为深度选择器
  // 默认情况下，样式不能够作用到子组件
  // 有时候，我们必须对子组件样式进行调整
  // 这时候，就可以给类名前面添加 /deep/
  // 如果 /deep/ 报错，可以使用 >>> 或者 ::v-deep 来替换
  /deep/ .el-step__title {
    font-size: 14px;
  }
}

.el-checkbox {
  margin-right: 10px;
}

.preview-img {
  width: 100%;
  height: 100%;
}

/deep/ .ql-editor {
  height: 300px;
}

.publish {
  margin-top: 20px;
}
</style>
