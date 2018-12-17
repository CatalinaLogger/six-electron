<template>
  <div class="role-container">
    <div class="tree-wrapper">
      <div class="head-wrapper">
        <div class="title">角色列表</div>
        <div class="operate">
          <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="insertRole()">新增角色组</el-button>
        </div>
      </div>
      <el-scrollbar class="role-body-wrapper" wrap-class="scrollbar-wrapper">
        <div class="six-tree">
          <el-tree node-key="id"
                   default-expand-all
                   highlight-current
                   :data="roleTree"
                   :props="roleProps"
                   :expand-on-click-node=false
                   @node-click="roleClick"
                   ref="roleTree">
          </el-tree>
        </div>
      </el-scrollbar>
    </div>
    <div class="role-wrapper" v-if="role.parentId === 0">
      <div class="head-wrapper">
        <div class="title">角色列表{{role.id ? ` __ ${role.name}` : ''}}</div>
        <div class="operate">
          <el-button size="mini" type="primary" plain icon="el-icon-edit" @click="updateRole(role)" :disabled="!role.edit">编辑</el-button>
          <el-button size="mini" type="primary" plain icon="el-icon-delete" @click="deleteRole(role)" :disabled="!role.edit">删除</el-button>
          <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="insertRole(role)" :disabled="!role.edit">新增角色</el-button>
        </div>
      </div>
      <el-scrollbar class="role-body-wrapper" wrap-class="scrollbar-wrapper">
        <div class="body-row title"><div>角色名称</div><div>更新时间</div><div>更新人员</div><div>操作</div></div>
        <div class="body-row" v-for="item in role.children" :key="item.id">
          <div>{{item.name}}</div>
          <div>{{item.operateTime}}</div>
          <div>{{item.operateName}}</div>
          <div>
            <el-button-group class="operate">
              <el-button size="mini" class="el-icon-upload2" @click="upRole(item)" :disabled="!item.edit"></el-button>
              <el-button size="mini" class="el-icon-download" @click="downRole(item)" :disabled="!item.edit"></el-button>
              <el-button size="mini" icon="el-icon-edit" @click="updateRole(item)" :disabled="!item.edit"></el-button>
              <el-button size="mini" icon="el-icon-delete" @click="deleteRole(item)" :disabled="!item.edit"></el-button>
            </el-button-group>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="user-wrapper" v-else>
      <div class="head-wrapper">
        <div class="title">用户列表{{role.id ? ` __ ${role.name}` : ''}}</div>
        <div class="operate">
          <el-input size="mini" v-model="roleUser.query" placeholder="姓名/手机/邮箱" clearable @change="changeQuery"></el-input>
          <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="selectUser" :disabled="!role.edit">添加成员</el-button>
          <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="deleteRoleUser" :disabled="!role.edit">批量移除</el-button>
        </div>
      </div>
      <el-scrollbar class="user-body-wrapper six-table flex-table" wrap-class="scrollbar-wrapper">
        <el-table :data="roleUser.userList" stripe @selection-change="roleUserChange">
          <el-table-column align="center" type="selection"></el-table-column>
          <el-table-column align="center" prop="name" label="姓名"></el-table-column>
          <el-table-column align="center" prop="phone" label="手机"></el-table-column>
          <el-table-column align="center" prop="mail" label="邮箱" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="区域" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-tag type="primary" v-for="(item, index) in scope.row.dept" :key="index" >{{item.name}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="状态">
            <template slot-scope="scope">
              <el-tag type="info" v-if="scope.row.status === 0">未激活</el-tag>
              <el-tag type="success" v-if="scope.row.status === 1">正常</el-tag>
              <el-tag type="danger" v-if="scope.row.status === 2">冻结</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
      <el-pagination
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="roleUser.currentPage"
        :page-size="roleUser.pageSize"
        layout="total, sizes, prev, pager, next"
        :total="roleUser.totalRecode">
      </el-pagination>
    </div>
    <el-dialog class="none-padding" top="0" width="400px" :title="roleTitle" :visible.sync="roleVisible" @close="closeRoleForm">
      <el-form :model="roleModel" :rules="roleRules" label-position="left" label-width="50px" ref="roleForm">
        <el-form-item class="form-wrapper" label="名称" prop="name" v-if="!roleModel.parent.id">
          <el-input v-model="roleModel.name"></el-input>
        </el-form-item>
        <el-scrollbar class="role-auth-tree" wrap-class="scrollbar-wrapper" v-else>
          <div class="form-wrapper">
            <el-form-item label="名称" prop="name">
              <el-input v-model="roleModel.name"></el-input>
            </el-form-item>
            <el-form-item label="权限">
              <el-tree node-key="id"
                       show-checkbox
                       insertRole-to-body
                       default-expand-all
                       :expand-on-click-node=false
                       :data="authTree"
                       :props="authProps"
                       ref="roleAuthTree">
              </el-tree>
            </el-form-item>
          </div>
        </el-scrollbar>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="roleVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitRoleModel">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="none-padding" top="0" width="600px" title="用户列表" :visible.sync="userVisible" @close="closeUserForm">
      <div class="operate">
        <el-input size="mini" v-model="roleNone.query" placeholder="姓名/手机/邮箱" clearable @change="changeQuery"></el-input>
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="roleNone.currentPage"
          :page-size="roleNone.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="roleNone.totalRecode">
        </el-pagination>
      </div>
      <el-scrollbar class="role-none-wrapper" wrap-class="scrollbar-wrapper" :key="1">
        <el-table :data="roleNone.userList" size="mini" stripe @selection-change="roleNoneChange">
          <el-table-column align="center" type="selection"></el-table-column>
          <el-table-column prop="name" label="姓名"></el-table-column>
          <el-table-column prop="phone" label="手机"></el-table-column>
          <el-table-column prop="mail" label="邮箱" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="区域" show-overflow-tooltip>
            <template slot-scope="scope">
              <el-tag type="primary" v-for="(item, index) in scope.row.dept" :key="index" >{{item.name}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column align="center" label="状态">
            <template slot-scope="scope">
              <el-tag type="info" v-if="scope.row.status === 0">未激活</el-tag>
              <el-tag type="success" v-if="scope.row.status === 1">正常</el-tag>
              <el-tag type="danger" v-if="scope.row.status === 2">冻结</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="primary" @click="insertRoleUser" :disabled="!roleNone.userKeys.length">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="none-padding tips-dialog" top="0" width="400px" :visible.sync="deleteVisible" :show-close="false">
      <div><i class="el-icon-warning"></i></div>
      <div class="message">确定要删除该{{roleModel.typeName}}吗？</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteRoleModel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {getAuthTree, getRoleTree, getAuthList, insertRole, updateRole, deleteRole, upRole, downRole, getRoleUserPage, insertRoleUser, deleteRoleUser} from '@/api/system'

  export default {
    name: 'system-role',
    data () {
      return {
        roleTree: [],
        roleProps: {
          children: 'children',
          label: 'name'
        },
        authTree: [],
        authProps: {
          children: 'children',
          label: 'name'
        },
        role: {},
        roleModel: {parent: {}, authKeys: []},
        roleRules: {name: [{required: true, trigger: 'blur', message: '名称不能为空'}]},
        roleTitle: '',
        roleVisible: false,
        deleteVisible: false,
        roleUser: {
          query: '',
          currentPage: 1,
          pageSize: 20,
          totalRecode: 0,
          userList: [], // 当前选中角色绑定的用户
          userKeys: [] // 选中的用户ID数组
        },
        roleNone: {
          query: '',
          currentPage: 1,
          pageSize: 20,
          totalRecode: 0,
          userList: [], // 当前选中角色未绑定的用户
          userKeys: [] // 选中的用户ID数组
        },
        userVisible: false
      }
    },
    mounted () {
      this._initData()
      this._getRoleTree()
    },
    methods: {
      roleClick (role) {
        this.role = role
        if (this.role.parentId) {
          this._getRoleUserList()
        }
      },
      insertRole (role) {
        if (role) {
          this.roleModel = {parent: role, authKeys: []}
          this.roleTitle = '新增角色'
        } else {
          this.roleModel = {parent: {}, authKeys: []}
          this.roleTitle = '新增角色组'
        }
        this.roleVisible = true
      },
      updateRole (role) {
        if (role.parentId) {
          let parent = this.roleTree.filter(item => {
            return item.id === role.parentId
          })[0]
          this.roleModel = {parent: {id: parent.id, name: parent.name}, authKeys: []}
          Object.assign(this.roleModel, role)
          getAuthList(role.id).then(res => {
            res.data.forEach(key => {
              this.$refs.roleAuthTree.setChecked(key, true)
            })
          })
          this.roleTitle = '编辑角色'
        } else {
          this.roleModel = {parent: {}, authKeys: []}
          Object.assign(this.roleModel, role)
          this.roleTitle = '编辑角色组'
        }
        this.roleVisible = true
      },
      deleteRole (role) {
        Object.assign(this.roleModel, role)
        if (role.parentId) {
          this.roleModel.typeName = '角色'
        } else {
          this.roleModel.typeName = '角色组'
        }
        this.deleteVisible = true
      },
      upRole (role) {
        upRole(role.id).then(() => {
          this._getRoleTree()
        })
      },
      downRole (role) {
        downRole(role.id).then(() => {
          this._getRoleTree()
        })
      },
      submitRoleModel () {
        this.$refs.roleForm.validate(valid => {
          if (valid) {
            if (this.roleModel.parent.id) {
              this.roleModel.authKeys = this.$refs.roleAuthTree.getCheckedKeys().concat(this.$refs.roleAuthTree.getHalfCheckedKeys())
            }
            if (!this.roleModel.id) {
              insertRole(this.roleModel).then(() => {
                this._getRoleTree()
                this.roleVisible = false
              })
            } else {
              updateRole(this.roleModel).then(() => {
                this._getRoleTree()
                this.roleVisible = false
              })
            }
          }
        })
      },
      deleteRoleModel () {
        deleteRole(this.roleModel.id).then(() => {
          this._getRoleTree()
          this.deleteVisible = false
        })
      },
      selectUser () {
        this._getRoleNoneList()
        this.userVisible = true
      },
      insertRoleUser () {
        insertRoleUser(this.role.id, this.roleNone.userKeys).then(() => {
          this._getRoleUserList()
          this.userVisible = false
        })
      },
      deleteRoleUser () {
        deleteRoleUser(this.role.id, this.roleUser.userKeys).then(() => {
          this._getRoleUserList()
        })
      },
      roleNoneChange (selection) {
        this.roleNone.userKeys = selection.map(item => {
          return item.id
        })
      },
      roleUserChange (selection) {
        this.roleUser.userKeys = selection.map(item => {
          return item.id
        })
      },
      changeQuery (val) {
        if (this.userVisible) {
          this.roleNone.query = val
          this._getRoleNoneList()
        } else {
          this.roleUser.query = val
          this._getRoleUserList()
        }
      },
      handleSizeChange (val) {
        if (this.userVisible) {
          if (val > this.pageSize) {
            this.roleNone.currentPage = Math.ceil(this.totalRecode / val)
          }
          this.roleNone.pageSize = val
          this._getRoleNoneList()
        } else {
          if (val > this.pageSize) {
            this.roleUser.currentPage = Math.ceil(this.totalRecode / val)
          }
          this.roleUser.pageSize = val
          this._getRoleUserList()
        }
      },
      handleCurrentChange (val) {
        if (this.userVisible) {
          this.roleNone.currentPage = val
          this._getRoleNoneList()
        } else {
          this.roleUser.currentPage = val
          this._getRoleUserList()
        }
      },
      closeRoleForm () {
        this.roleModel = {parent: {}, authKeys: []}
        this.$refs.roleForm.clearValidate()
        try {
          this.$refs.roleAuthTree.setCheckedKeys([])
        } catch (e) {
        }
      },
      closeUserForm () {
        this.roleNone.query = ''
        this.roleNone.userList = []
        this.roleNone.userKeys = []
      },
      _getRoleTree () {
        getRoleTree().then(res => {
          this.roleTree = res.data
          if (this.roleTree.length) {
            setTimeout(() => {
              let arr = this.roleTree.filter(item => {
                return item.id === this.role.id
              })
              if (arr.length) {
                this.role = arr[0]
                this.$refs.roleTree.setCurrentNode(this.role)
              } else {
                this.role = this.roleTree[0]
                this.$refs.roleTree.setCurrentNode(this.role)
              }
            }, 10)
          }
        })
      },
      _getRoleUserList () {
        getRoleUserPage(true, this.role.id, this.roleUser.query, this.roleUser.currentPage, this.roleUser.pageSize).then(res => {
          this.roleUser.totalRecode = res.data.total
          this.roleUser.userList = res.data.data
        })
      },
      _getRoleNoneList () {
        getRoleUserPage(false, this.role.id, this.roleNone.query, this.roleNone.currentPage, this.roleNone.pageSize).then(res => {
          this.roleNone.totalRecode = res.data.total
          this.roleNone.userList = res.data.data
        })
      },
      _initData () {
        getAuthTree().then(res => {
          this.authTree = res.data
        })
      }
    }
  }
</script>

<style scoped lang="stylus">
.role-container
  display flex
  height calc(100vh - 50px)
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
        margin-right 10px
        width 200px
  .tree-wrapper
    min-width 200px
    border-right 1px solid #eee
  .user-body-wrapper
    height calc(100vh - 112px)
  .role-body-wrapper
    height calc(100vh - 80px)
    .body-row
      display flex
      align-items center
      justify-content space-around
      height 40px
      font-size 14px
      &.active
        color #409eff
        background #d7eaff !important
      &.title
        color white
        background #409eff !important
      &:hover
        background #d7eaff
      &:nth-child(even)
        background linear-gradient(90deg, #fff, #eee)
        &:hover
          background #d7eaff
      div
        flex 1
        text-align center
        flex 1
        text-align center
  .role-wrapper
  .user-wrapper
    position relative
    flex-grow 1
  .role-auth-tree
    height 350px
  .form-wrapper
    padding 20px 20px 0 20px
.el-dialog
  .operate
    display flex
    padding 5px 0 5px 20px
    background #eee
    .el-input
      display inline-block
      padding-top 2px
      width 160px
    .el-pagination
      flex-grow 1
      text-align right
  .role-none-wrapper
    height 300px
.el-tag
  margin 2px 2px
</style>