<template>
  <div class="head-bar" style="-webkit-app-region: drag" >
    <div @click="toggleSideBar" class="collapse" style="-webkit-app-region: no-drag">
      <svg-icon icon-class="collapse" :class="{'icon-opened': sidebar.opened}"></svg-icon>
    </div>
    <div class="tool-bar"></div>
    <el-dropdown style="-webkit-app-region: no-drag" @command="handleCommand">
      <div class="avatar el-dropdown-link"><img :src="avatar"></div>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item command="center">个人中心</el-dropdown-item>
        <el-dropdown-item command="pass">修改密码</el-dropdown-item>
        <el-dropdown-item command="logout">退出</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <div style="-webkit-app-region: no-drag" class="hidden" @click="hidden"><i class="el-icon-minus"></i></div>
    <div style="-webkit-app-region: no-drag" class="change" @click="change"><svg-icon :icon-class="max ? 'min' : 'max'"/></div>
    <div style="-webkit-app-region: no-drag" class="closed" @click="closed"><i class="el-icon-close"></i></div>

    <el-dialog top="0" width="400px" title="修改密码" :visible.sync="passVisible" :close-on-click-modal="false" @close="closePassForm">
      <el-form :model="passModel" :rules="passRules" label-position="left" label-width="50px" ref="passForm">
        <el-form-item label="原始密码" label-width="80px" prop="oldPassword">
          <el-input v-model="passModel.oldPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="新的密码" label-width="80px" prop="newPassword">
          <el-input v-model="passModel.newPassword" type="password"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" label-width="80px" prop="andPassword">
          <el-input v-model="passModel.andPassword" type="password"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="passVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitPassModel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updatePassword } from '@/api/system'

export default {
  data () {
    const validateNew = (rule, value, callback) => {
      if (!value) {
        callback(new Error('新的密码不能为空'))
      } else if (value.length < 4 || value.length > 16) {
        callback(new Error('密码长度在4~16之间'))
      } else {
        callback()
      }
    }
    const validateAnd = (rule, value, callback) => {
      if (!value) {
        callback(new Error('确认密码不能为空'))
      } else if (value !== this.passModel.newPassword) {
        callback(new Error('输入密码与新的密码不一致'))
      } else {
        callback()
      }
    }
    return {
      max: false,
      passModel: {},
      passRules: {
        oldPassword: [{required: true, trigger: 'blur', message: '原始密码不能为空'}],
        newPassword: [{required: true, trigger: 'blur', validator: validateNew}],
        andPassword: [{required: true, trigger: 'blur', validator: validateAnd}]
      },
      passVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'name',
      'avatar'
    ])
  },
  methods: {
    toggleSideBar () {
      this.$store.dispatch('toggleSideBar')
    },
    handleCommand (command) {
      switch (command) {
        case 'logout': {
          this.$store.dispatch('LogOut').then(() => {
            location.reload()// In order to re-instantiate the vue-router object to avoid bugs
          })
          break
        }
        case 'pass': {
          this.passVisible = true
          break
        }
        case 'center': {
          console.log('*******')
          break
        }
      }
    },
    submitPassModel () {
      this.$refs.passForm.validate(valid => {
        if (valid) {
          updatePassword(this.passModel).then(() => {
            this.passVisible = false
          })
        }
      })
    },
    closePassForm () {
      this.passModel = {}
      this.$refs.passForm.clearValidate()
    },
    hidden () {
      let main = this.$electron.remote.getCurrentWindow()
      main.minimize()
    },
    change () {
      let main = this.$electron.remote.getCurrentWindow()
      if (this.max) {
        main.unmaximize()
        this.max = false
      } else {
        main.maximize()
        this.max = true
      }
    },
    closed () {
      let main = this.$electron.remote.getCurrentWindow()
      main.destroy()
    }
  }
}
</script>

<style scoped lang="stylus">

</style>