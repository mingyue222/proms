<template>
  <el-container class="home_container">
    <el-header>
      <div>
        <img src="../assets/heima.png" alt="" />
        <span>电商管理系统</span>
      </div>
      <el-button type="success" @click="logout">退出</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width='iscollapse? width = "64px":width="200px" '>
        <div class="toggle_btn" @click="toggleCollapse">| | |</div>
        <el-menu
          class="el-menu-vertical-demo"
          background-color="yellowgreen"
          text-color="#fff"
          active-text-color="pink"
          unique-opened
          :collapse="iscollapse"
          :collapse-transition="false"
          router
          :default-active='activePath'
        >
          <el-submenu
            :index="item.id + ''"
            v-for="item in menusList"
            :key="item.id"
          >
            <template slot="title">
              <i :class="iconsObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/' + subItem.path "
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavActive('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>

      <!-- 右侧内容区 -->
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menusList: [],
      iconsObj: {
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        103: 'iconfont icon-tijikongjian',
        125: 'iconfont icon-user',
        145: 'iconfont icon-baobiao'
      },
      iscollapse: false,
      activePath: ''
    }
  },
  created () {
    this.getMenus()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    saveNavActive (activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    },
    logout () {
      window.sessionStorage.removeItem('token')
      this.$router.push('/login')
    },

    async getMenus () {
      const { data: res } = await this.$http.get('menus')

      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }

      this.menusList = res.data
    },

    toggleCollapse () {
      this.iscollapse = !this.iscollapse
    }
  }
}
</script>

<style lang='less' scope>
.home_container {
  height: 100%;

  .el-header {
    background-color: skyblue;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 20px;
    padding: 20px;

    div {
      display: flex;
      align-items: center;

      span {
        margin-left: 20px;
      }
    }
  }

  .el-aside {
    background-color: yellowgreen;

    .iconfont {
      margin-right: 10px;
    }

    .el-menu {
      border-right: none;
    }

    .toggle_btn {
      height: 24px;
      line-height: 24px;
      text-align: center;
      color: #fff !important;
      background-color: lightcoral;
      font-size: 12px;
      cursor: pointer;
     }
  }

  .el-main {
    background-color: #ccc;
  }
}

</style>
