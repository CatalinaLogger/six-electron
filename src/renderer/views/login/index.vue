<template>
  <div class="login" style="-webkit-app-region: drag">
    <div class="head">
      <div class="title"></div>
      <div style="-webkit-app-region: no-drag" @click="hidden"><i class="el-icon-minus"></i></div>
      <div style="-webkit-app-region: no-drag" @click="closed"><i class="el-icon-close"></i></div>
    </div>
    <div class="body">
      <el-form style="-webkit-app-region: no-drag">
        <el-form-item>
          <el-button type="primary">登录</el-button>
        </el-form-item>
      </el-form>
      
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {}
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
  background linear-gradient(135deg, #F56C6C, #409EFF)
  .head
    display flex
    height 30px
    text-align right
    .title
      flex-grow 1
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
</style>
