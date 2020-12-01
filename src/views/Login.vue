<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- form表单区域 -->
      <el-form
        ref="loginRefForm"
        label-width="0px"
        class="loginForm"
        :model="loginForm"
        :rules="loginLules"
      >
        <el-form-item prop="username">
          <el-input
            prefix-icon="el-icon-user-solid"
            v-model="loginForm.username"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            type="password"
          ></el-input>
        </el-form-item>
        <el-form-item class="btns">
          <el-button type="primary" @click="loginBtn">登录</el-button>
          <el-button type="info" @click="reateFrom">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      // 登录表单的数据
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单的数据验证
      loginLules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 9, message: '长度在 3 到 9 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 16, message: '请输入正确的密码', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置表单
    reateFrom () {
      // console.log(this)
      this.$refs.loginRefForm.resetFields()
    },

    // 登录操作
    loginBtn () {
      this.$refs.loginRefForm.validate(async (vaild) => {
        if (!vaild) return

        const { data: res } = await this.$http.post('login', this.loginForm)
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        // 登陆成功后将token保存到本地
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #2b4b6b;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  .avatar_box {
    width: 130px;
    height: 130px;
    border-radius: 50%;
    border: 1px solid #ccc;
    padding: 10px;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }
  .loginForm {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0px 20px;
    box-sizing: border-box;

    .btns {
      text-align: center;
    }
  }
}
</style>
