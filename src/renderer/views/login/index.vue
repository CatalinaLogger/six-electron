<template>
  <div class="login" style="-webkit-app-region: drag">
    <div class="head">
      <div class="title">
        <span class="en">BDMC</span>
        <span class="zh">北斗微芯</span>
      </div>
      <div style="-webkit-app-region: no-drag" @click="hidden"><i class="el-icon-minus"></i></div>
      <div style="-webkit-app-region: no-drag" @click="closed"><i class="el-icon-close"></i></div>
    </div>
    <div class="body">
      <el-form class="login-form" :model="loginModel" :rules="loginRules" style="-webkit-app-region: no-drag">
        <el-form-item prop="username">
          <el-input v-model="loginModel.username" placeholder="账号/手机/邮箱"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginModel.password" placeholder="密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%;">登录</el-button>
        </el-form-item>
      </el-form>
      
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      loginModel: {},
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
      }
    }
  },
  methods: {
    hidden () {
      let main = this.$electron.remote.getCurrentWindow()
      main.minimize()
    },
    closed () {
      let main = this.$electron.remote.getCurrentWindow()
      main.destroy()
    }
  }
}
</script>

<style lang="stylus">
.login
  width 100%
  height 100vh
  background linear-gradient(135deg, blue, gray)
  .head
    display flex
    .title
      padding 10px 20px
      flex-grow 1
      font-weight bold
      .en
        font-size 34px
        color white
      .zh
        color #ccc
    i
      display inline-block
      width 30px
      height 30px
      text-align center
      font-size 20px
      line-height 30px
      color white
      &:hover
        background rgba(00, 00, 00, .2)
  .body
    .el-form-item
      border 1px solid $form_bg
      border-radius 5px
      background white
    input:-webkit-autofill
      -webkit-box-shadow 0 0 0px 1000px #ffffff inset !important
      -webkit-text-fill-color #000000 !important
    input
      background transparent
      border 0px
      -webkit-appearance none
      border-radius 0px
      padding 12px 5px 12px 15px
      color #000000
      height 47px
    .login-form
      padding 40px
</style>
