<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card class="box-card">
      <el-row>
        <el-col :span="8">
          <el-input  placeholder="请输入内容" v-model="query.query" clearable @clear='removeSearch' >
             <el-button @click="getGoodsList" slot="append" icon="el-icon-search"></el-button>
             </el-input>
        </el-col>

          <el-col :span="4">
          <el-button type="warning" plain @click="addGoods">添加商品</el-button>
          </el-col>
      </el-row>
      <!-- 渲染表格 -->
       <el-table :data="goodsList" width="100%"  stripe border >
        <el-table-column type="index" label="#" > </el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="700"> </el-table-column>
        <el-table-column  prop="goods_price" label="商品价格(元)">  </el-table-column>
        <el-table-column  prop="goods_weight" label="商品重量">  </el-table-column>
        <el-table-column  prop="add_time" label="发布时间">
          <template slot-scope="scope">
            <span>{{ scope.row.add_time | time}}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200">
          <template slot-scope="scope">
            <el-button type="warning" icon="el-icon-edit" size="mini" plain>编辑</el-button>
            <el-button type="danger"  icon="el-icon-delete" size="mini" plain @click="deleteGood(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
       </el-table>
       <!-- 分页功能 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="query.pagenum"
        :page-sizes="[3, 5, 10, 20]"
        :page-size="query.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
  </div>
</template>
<script>
export default {
  name: 'GoodsList',
  data () {
    return {
      goodsList: [],
      query: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', { params: this.query })
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      console.log(res)
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (value) {
      this.query.pagesize = value
      this.getGoodsList()
    },
    handleCurrentChange (value) {
      this.query.pagenum = value
      this.getGoodsList()
    },
    // 点击删除处理
    async deleteGood (goodsId) {
      const confirmRef = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (confirmRef !== confirm) return this.$message.error('取消了删除')
      const { data: res } = await this.$http.delete(`goods/${goodsId}`)
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.$message.success(res.meta.msg)
      this.getGoodsList()
    },
    // 删除搜索
    removeSearch () {
      this.query.query = ''
      this.getGoodsList()
    },
    // 点击添加商品时 跳转到添加商品的页面
    addGoods () {
      this.$router.push('/goods/addGoods')
    }
  }
}
</script>
<style lang="less" scoped>
.el-card{
  margin-top: 16px;
}
.el-pagination{
  text-align: center;
  margin-top: 16px;
}
</style>
