<template>
  <div class="login" style="-webkit-app-region: drag" v-if="show">
    <div class="head">
      <div class="title">
        <span class="en">BDMC</span>
        <span class="zh">北斗微芯</span>
      </div>
      <div style="-webkit-app-region: no-drag" @click="hidden"><i class="el-icon-minus"></i></div>
      <div style="-webkit-app-region: no-drag" @click="closed"><i class="el-icon-close"></i></div>
    </div>
    <div class="body">
      <el-form class="login-form" :model="loginModel" :rules="loginRules" ref="loginForm" style="-webkit-app-region: no-drag">
        <el-form-item prop="username">
          <div class="icon"><svg-icon icon-class="username" /></div>
          <div class="input"><el-input v-model="loginModel.username" placeholder="账号/手机/邮箱"></el-input></div>
        </el-form-item>
        <el-form-item prop="password">
          <div class="icon"><svg-icon icon-class="password" /></div>
          <div class="input"><el-input type="password" v-model="loginModel.password" placeholder="密码"></el-input></div>
        </el-form-item>
        <el-button type="primary" style="width: 100%;" :loading="loading" @click.native.prevent="handleLogin">登录</el-button>
        <div class="option">
          <el-checkbox v-model="loginModel.remember">记住密码</el-checkbox>
          <el-checkbox v-model="loginModel.automation">自动登录</el-checkbox>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import {getUsername, getPassword, getAutomation, getRemember} from '@/common/utils/auth'

export default {
  data () {
    return {
      loginModel: {
        username: getUsername(),
        password: getPassword(),
        automation: getAutomation(),
        remember: getRemember()
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', message: '账号不能为空' }],
        password: [{ required: true, trigger: 'blur', message: '密码不能为空' }]
      },
      loading: false,
      show: true
    }
  },
  mounted () {
    this._initWindow()
  },
  methods: {
    handleLogin () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('Login', this.loginModel).then(() => {
            this.loading = false
            this.show = false
            this.$router.push({ path: '/cockpit' })
          }).catch(() => {
            this.loading = false
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    handleForget () {
      let main = this.$electron.remote.getCurrentWindow()
      let BrowserWindow = this.$electron.remote.BrowserWindow
      let forget = new BrowserWindow({
        parent: main,
        title: '北斗微芯',
        useContentSize: true,
        autoHideMenuBar: true
      })
      forget.show()
      forget.loadURL('http://cloud.bdsmc.net')
      forget.on('closed', () => {
        forget = null
      })
    },
    hidden () {
      let main = this.$electron.remote.getCurrentWindow()
      main.minimize()
    },
    closed () {
      let main = this.$electron.remote.getCurrentWindow()
      main.destroy()
    },
    _initWindow () {
      console.log('login')
      this.$store.dispatch('setFullScreen', false)
      let main = this.$electron.remote.getCurrentWindow()
      main.setMinimumSize(400, 360)
      main.setSize(400, 360)
      main.center()
      if (this.loginModel.automation) {
        setTimeout(() => {
          this.handleLogin()
        }, 2000)
      }
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
    padding 40px
    .el-form-item
      border 1px solid $form_bg
      border-radius 5px
      background white
      .el-form-item__content
        width 100%
        display flex
        .icon
          width 30px
          text-align right
          color #889aa4
          .svg-icon
            margin-top 16px
        .input
          flex-grow 1
    .option
      display flex
      margin-top 5px
      .el-checkbox
        flex 1
        color white
        &:last-child
          text-align right
      .forget
        flex 1
        float right
        text-align right
        font-size 14px
        line-height 19px
        color white
        cursor pointer
        &:hover
          color #409eff
    input:-webkit-automationfill
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
</style>
