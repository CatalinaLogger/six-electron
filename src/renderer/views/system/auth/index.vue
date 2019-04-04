<template>
  <div class="app-wrapper">
    <div class="six-table">
      <tree-table :data="authTree" :columns="authColumns" expandAll stripe>
        <el-table-column align="center" label="权限类型" width="100">
          <template slot-scope="scope">
            <el-tag type="warning" v-if="scope.row.type === 0">目录</el-tag>
            <el-tag type="success" v-if="scope.row.type === 1">菜单</el-tag>
            <el-tag type="success" v-if="scope.row.type === 2">路由</el-tag>
            <el-tag v-if="scope.row.type === 3">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="图标" width="60">
          <template slot-scope="scope">
            <svg-icon v-if="scope.row.icon" :icon-class="scope.row.icon"></svg-icon>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="operateTime" label="更新时间" width="160"></el-table-column>
        <el-table-column align="center" prop="operateName" label="更新人员" width="100"></el-table-column>
        <el-table-column align="center" label="操作" width="160">
          <template slot-scope="scope">
            <el-button-group class="operate">
              <el-button size="mini" class="el-icon-upload2" @click="upAuth(scope.row)"></el-button>
              <el-button size="mini" class="el-icon-download" @click="downAuth(scope.row)"></el-button>
              <el-button size="mini" class="el-icon-circle-plus-outline" @click="insertAuth(scope.row)" :disabled="scope.row.type === 2"></el-button>
              <el-button size="mini" class="el-icon-edit" @click="updateAuth(scope.row)"></el-button>
              <el-button size="mini" class="el-icon-delete" @click="deleteAuth(scope.row)"></el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </tree-table>
      <div class="footer-bar">
        <span @click="insertAuth()"><i class="el-icon-plus"></i> 新增权限</span>
      </div>
    </div>
    <el-dialog top="0" width="400px" :title="authTitle" :visible.sync="authVisible" @close="closeAuthForm">
      <el-form :model="authModel" :rules="authRules" label-width="78px" ref="authForm">
        <el-form-item label="上级权限" v-if="authModel.parent.id">
          <el-input :value="authModel.parent.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="authModel.name"></el-input>
        </el-form-item>
        <el-form-item label="权限编码" prop="path">
          <el-input v-model="authModel.path"></el-input>
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="authModel.type">
            <el-radio-button :label="0" v-if="!authModel.parent.type">目录</el-radio-button>
            <el-radio-button :label="1" v-if="!authModel.parent.type">菜单</el-radio-button>
            <el-radio-button :label="2" v-if="authModel.parent.type">路由</el-radio-button>
            <el-radio-button :label="3" v-if="authModel.parent.type">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="隐藏">
          <el-row>
            <el-col :span="4">
              <el-switch
                v-model="authModel.hidden"
                :active-value="1"
                :inactive-value="0"
                active-color="#409eff"
                inactive-color="#d9dce2">
              </el-switch>
            </el-col>
<!--
            <template v-if="authModel.type === 1 || authModel.type === 2">
              <el-col class="form-label" :span="4">缓存</el-col>
              <el-col :span="4">
                <el-switch
                  v-model="authModel.cache"
                  :active-value="1"
                  :inactive-value="0"
                  active-color="#409eff"
                  inactive-color="#d9dce2">
                </el-switch>
              </el-col>
            </template>
-->
            <el-col class="form-label" :span="4">图标</el-col>
            <el-col :span="8">
              <el-button type="primary" size="mini" style="width: 100%" @click="selectIcon">
                <svg-icon v-if="authModel.icon" className="icon-current" :icon-class="authModel.icon"></svg-icon>
                <span class="icon-current" v-else>选择图标</span>
              </el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="重定向" v-if="authModel.type === 1 || authModel.type === 2">
          <el-input v-model="authModel.redirect"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="authModel.remark"></el-input>
        </el-form-item>
      </el-form>
      <el-dialog class="none-padding"
        title="图标列表"
        top="0"
        width="400px"
        :visible.sync="iconVisible"
        append-to-body>
        <el-scrollbar class="auth-scroll" wrap-class="scrollbar-wrapper">
          <div class="auth-wrapper">
            <div class="icon-box" :class="{select:authModel.icon === item}" v-for="item of iconList" :key="item" @click="submitIcon(item)">
              <svg-icon className="icon-option" :icon-class="item"></svg-icon>
            </div>
          </div>
        </el-scrollbar>
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitAuthModel">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="none-padding tips-dialog" top="0" width="400px" :visible.sync="deleteVisible" :show-close="false">
      <div><i class="el-icon-warning"></i></div>
      <div class="message">确定要删除该权限吗？</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteAuthModel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TreeTable from '@/components/tree-table'
import icons from './icons'
import {getAuthTree, insertAuth, updateAuth, deleteAuth, upAuth, downAuth} from '@/api/system'

export default {
  name: 'system-auth',
  data () {
    const validateName = (rule, value, callback) => {
      if (!value || value.length < 1 || value.length > 10) {
        callback(new Error('权限名称长度在1~10位之间'))
      } else {
        callback()
      }
    }
    const validatePath = (rule, value, callback) => {
      if (!value || value.length < 1 || value.length > 50) {
        callback(new Error('权限编码长度在1~50位之间'))
      } else {
        callback()
      }
    }
    return {
      authTree: [],
      authColumns: [{text: '权限名称', value: 'name'}],
      auth: {},
      authModel: {parent: {}, type: 0, hidden: 0, cache: 0},
      authRules: {
        name: [{required: true, trigger: 'blur', validator: validateName}],
        path: [{required: true, trigger: 'blur', validator: validatePath}],
        type: [{required: true, trigger: 'blur', message: '权限类型不能为空'}]
      },
      authTitle: '',
      authVisible: false,
      iconVisible: false,
      iconList: [''],
      deleteVisible: false
    }
  },
  mounted () {
    this._getAuthTree()
    const iconList = icons.state.iconsMap.map((i) => {
      return i.default.id.substring(5)
    }).filter((i) => {
      return i.indexOf('menu-') > -1
    })
    this.iconList = this.iconList.concat(iconList)
  },
  methods: {
    authClick (auth) {
      this.auth = auth
    },
    insertAuth (auth) {
      if (auth) {
        this.authModel = {parent: auth, type: auth.parent ? 3 : 1, hidden: 0, cache: 0}
      } else {
        this.authModel = {parent: {}, type: 0, hidden: 0, cache: 0}
      }
      this.authTitle = '新增权限'
      this.authVisible = true
    },
    updateAuth (auth) {
      Object.assign(this.authModel, auth)
      if (!this.authModel.parent.type && this.authModel.type === 3) {
        this.authModel.type = 1
      }
      this.authTitle = '编辑权限'
      this.authVisible = true
    },
    selectIcon () {
      this.iconVisible = true
    },
    submitIcon (icon) {
      this.authModel.icon = icon
      this.iconVisible = false
    },
    deleteAuth (auth) {
      Object.assign(this.authModel, auth)
      this.deleteVisible = true
    },
    upAuth (auth) {
      upAuth(auth.id).then(() => {
        this._getAuthTree()
      })
    },
    downAuth (auth) {
      downAuth(auth.id).then(() => {
        this._getAuthTree()
      })
    },
    submitAuthModel () {
      this.$refs.authForm.validate(valid => {
        if (valid) {
          if (!this.authModel.id) {
            insertAuth(this.authModel).then(() => {
              this._getAuthTree()
              this.authVisible = false
            })
          } else {
            updateAuth(this.authModel).then(() => {
              this._getAuthTree()
              this.authVisible = false
            })
          }
        }
      })
    },
    deleteAuthModel () {
      deleteAuth(this.authModel.id).then(() => {
        this._getAuthTree()
        this.deleteVisible = false
      })
    },
    closeAuthForm () {
      this.authModel = {parent: {}, type: 0, hidden: 0, cache: 0}
      this.$refs.authForm.clearValidate()
    },
    _getAuthTree () {
      getAuthTree().then(res => {
        this.authTree = res.data
      })
    }
  },
  components: {
    TreeTable
  }
}
</script>

<style scoped lang="stylus">
.app-wrapper
  border-top 1px solid #eee
  .footer-bar
    height 40px
    text-align center
    line-height 40px
    cursor pointer
    &:hover
      color #409eff
.form-label
  text-align right
  padding-right 10px
.auth-scroll
  height 300px
  .auth-wrapper
    padding 20px 0
    .icon-box
      display inline-block
      padding-top 15px
      width 50px
      height 50px
      font-size 20px
      text-align center
      cursor pointer
      &:hover
        background #eee
      &.select
        color white
        background #409eff
</style>