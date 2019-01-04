<template>
  <div class="user-container">
    <div class="dept-wrapper">
      <div class="head-wrapper"><div class="title">区域列表</div></div>
      <el-scrollbar class="dept-body-wrapper" wrap-class="scrollbar-wrapper">
        <div class="six-tree">
          <el-tree node-key="id"
                   default-expand-all
                   highlight-current
                   :data="deptTree"
                   :props="deptProps"
                   :expand-on-click-node=false
                   @node-click="deptClick"
                   ref="deptTree">
          </el-tree>
        </div>
      </el-scrollbar>
    </div>
    <div class="user-wrapper">
      <div class="head-wrapper">
        <div class="title">用户列表{{dept.id ? ` __ ${dept.name}` : ''}}</div>
        <div class="operate">
          <el-input size="mini" v-model="query" placeholder="姓名/手机/邮箱" clearable @change="changeQuery"></el-input>
          <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="insertUser">新增用户</el-button>
        </div>
      </div>
      <el-scrollbar class="user-body-wrapper" wrap-class="scrollbar-wrapper">
        <div class="six-row title"><div>姓名</div><div>手机</div><div>邮箱</div><div>状态</div><div>操作</div></div>
        <div class="six-row" v-for="user in userList" :key="user.id">
          <div>{{user.name}}</div>
          <div>{{user.phone}}</div>
          <div>{{user.mail}}</div>
          <div>
            <el-tag type="info" v-if="user.status === 0">未激活</el-tag>
            <el-tag type="success" v-if="user.status === 1">正常</el-tag>
            <el-tag type="danger" v-if="user.status === 2">冻结</el-tag>
          </div>
          <div>
            <div class="operate">
              <el-button size="mini" icon="el-icon-edit" @click="updateUser(user)"></el-button>
              <el-button size="mini" icon="el-icon-delete" @click="deleteUser(user)"></el-button>
            </div>
          </div>
        </div>
      </el-scrollbar>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="currentPage"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="totalRecode">
      </el-pagination>
    </div>
    <el-dialog top="0" width="400px" :title="userTitle" :visible.sync="userVisible" @close="closeUserForm">
      <el-form :model="userModel" :rules="userRules" label-position="left" label-width="65px" ref="userForm">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userModel.username"></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="userModel.name"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="phone">
          <el-input v-model="userModel.phone"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="mail">
          <el-input v-model="userModel.mail"></el-input>
        </el-form-item>
        <el-form-item label="区域" prop="deptKeys">
          <el-button plain style="width: 100%; overflow: hidden" @click="selectDept">
            <div v-if="userModel.deptKeys.length > 0">
              <span class="dept-block" v-for="(item, index) in userModel.deptNames" :key="index" >{{item}}</span>
            </div>
            <span class="dept-empty" v-else>请选择部门</span>
          </el-button>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="userModel.remark"></el-input>
        </el-form-item>
      </el-form>
      <el-dialog class="none-padding" title="选择区域" top="0" width="400px" :visible.sync="deptVisible" append-to-body>
        <el-scrollbar class="user-dept-tree" wrap-class="scrollbar-wrapper">
          <el-tree
            node-key="id"
            show-checkbox
            check-strictly
            append-to-body
            default-expand-all
            :expand-on-click-node=false
            :data="deptTree"
            :props="deptProps"
            :default-checked-keys="userModel.deptKeys"
            ref="userDeptTree">
          </el-tree>
        </el-scrollbar>
        <div slot="footer" class="dialog-footer">
          <el-button @click="deptVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitDept">确 定</el-button>
        </div>
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="danger" plain @click="stopUser" v-if="userModel.status === 1">冻 结</el-button>
        <el-button type="success" plain @click="startUser" v-if="userModel.status === 2">解 冻</el-button>
        <el-button type="primary" @click="submitUserModel">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="none-padding tips-dialog" top="0" width="400px" :visible.sync="deleteVisible" :show-close="false">
      <div><i class="el-icon-warning"></i></div>
      <div class="message">确定要删除该用户吗？</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteUserModel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getDeptTree, getUserPageDept, getDeptList, existsUser, insertUser, updateUser, stopUser, startUser, deleteUser} from '@/api/system'

export default {
  name: 'system-user',
  data () {
    const validateUsername = (rule, value, callback) => {
      if (!value) {
        callback(new Error('用户名为必填项'))
      } else {
        existsUser(this.userModel.id, 'username', value).then(res => {
          if (res.data) {
            callback(new Error('用户名已被占用'))
          } else {
            callback()
          }
        })
      }
    }
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('手机不能为空'))
      } else if (!/^[1][3,4,5,7,8,9][0-9]{9}$/.test(value)) {
        callback(new Error('手机格式有误'))
      } else {
        existsUser(this.userModel.id, 'phone', value).then(res => {
          if (res.data) {
            callback(new Error('手机已被占用'))
          } else {
            callback()
          }
        })
      }
    }
    const validateMail = (rule, value, callback) => {
      if (!value) {
        callback(new Error('邮箱不能为空'))
      } else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
        callback(new Error('邮箱格式有误'))
      } else {
        existsUser(this.userModel.id, 'mail', value).then(res => {
          if (res.data) {
            callback(new Error('邮箱已被占用'))
          } else {
            callback()
          }
        })
      }
    }
    return {
      deptTree: [],
      dept: {},
      deptProps: {
        children: 'children',
        label: 'name'
      },
      userList: [],
      userModel: {deptKeys: [], deptNames: []},
      userRules: {
        username: [{required: true, trigger: 'blur', validator: validateUsername}],
        name: [{required: true, trigger: 'blur', message: '姓名不能为空'}],
        phone: [{required: true, trigger: 'blur', validator: validatePhone}],
        mail: [{required: true, trigger: 'blur', validator: validateMail}],
        deptKeys: [{required: true, trigger: 'blur', message: '区域不能为空'}]
      },
      userTitle: '',
      userVisible: false,
      deptVisible: false,
      deleteVisible: false,
      query: '',
      currentPage: 1,
      pageSize: 20,
      totalRecode: 0
    }
  },
  mounted () {
    this._initData()
  },
  methods: {
    deptClick (dept) {
      this.dept = dept
      this._getUserList()
    },
    insertUser () {
      this.userModel = {
        deptKeys: [this.dept.id],
        deptNames: [this.dept.name]
      }
      this.userTitle = '新增用户'
      this.userVisible = true
    },
    updateUser (user) {
      Object.assign(this.userModel, user)
      getDeptList(user.id).then(res => {
        this.userModel.deptKeys = res.data.map(item => {
          return item.id
        })
        this.userModel.deptNames = res.data.map(item => {
          return item.name
        })
      })
      this.userTitle = '编辑用户'
      this.userVisible = true
    },
    selectDept () {
      this.deptVisible = true
    },
    submitDept () {
      this.userModel.deptKeys = this.$refs.userDeptTree.getCheckedKeys()
      this.userModel.deptNames = this.$refs.userDeptTree.getCheckedNodes().map(item => {
        return item.name
      })
      this.deptVisible = false
    },
    stopUser () {
      stopUser(this.userModel.id).then(() => {
        this._getUserList()
        this.userVisible = false
      })
    },
    startUser () {
      startUser(this.userModel.id).then(() => {
        this._getUserList()
        this.userVisible = false
      })
    },
    deleteUser (user) {
      Object.assign(this.userModel, user)
      this.deleteVisible = true
    },
    submitUserModel () {
      this.$refs.userForm.validate(valid => {
        if (valid) {
          if (!this.userModel.id) {
            insertUser(this.userModel).then(() => {
              this._getUserList()
              this.userVisible = false
            })
          } else {
            updateUser(this.userModel).then(() => {
              this._getUserList()
              this.userVisible = false
            })
          }
        }
      })
    },
    deleteUserModel () {
      deleteUser(this.userModel.id).then(() => {
        this._getUserList()
        this.deleteVisible = false
      })
    },
    closeUserForm () {
      this.userModel = {deptKeys: [], deptNames: []}
      this.$refs.userForm.clearValidate()
      try {
        this.$refs.userDeptTree.setCheckedKeys([])
      } catch (e) {
      }
    },
    handleSizeChange (val) {
      if (val > this.pageSize) {
        this.currentPage = Math.ceil(this.totalRecode / val)
      }
      this.pageSize = val
      this._getUserList()
    },
    handleCurrentChange (val) {
      this.currentPage = val
      this._getUserList()
    },
    changeQuery (val) {
      this.query = val
      this._getUserList()
    },
    _getUserList () {
      getUserPageDept(this.dept.id, this.query, this.currentPage, this.pageSize).then(res => {
        this.totalRecode = res.data.total
        this.userList = res.data.data
      })
    },
    _initData () {
      getDeptTree().then(res => {
        this.deptTree = res.data
        this.dept = this.deptTree[0]
        this._getUserList()
        setTimeout(() => {
          this.$refs.deptTree.setCurrentNode(this.dept)
        }, 10)
      })
    }
  }
}
</script>

<style scoped lang="stylus">
.user-container
  display flex
  height calc(100vh - 40px)
  .head-wrapper
    position relative
    padding 0 10px
    height 40px
    background linear-gradient(90deg, #f5f5f5, #eee)
    .title
      font-size 14px
      line-height 40px
      color #409eff
    .operate
      position absolute
      top 6px
      right 10px
      .el-input
        display inline-block
        width 200px
  .dept-body-wrapper
    height calc(100vh - 80px)
  .user-body-wrapper
    height calc(100vh - 112px)
  .dept-wrapper
    min-width 200px
    border-right 1px solid #eee
  .user-wrapper
    flex-grow 1
.dept-block
  padding 5px
  margin-right 5px
  background #eee
.dept-empty
  color #ccc
.user-dept-tree
  height 400px
</style>