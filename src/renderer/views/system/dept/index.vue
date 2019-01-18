<template>
  <div class="dept-container">
    <div class="six-table">
      <tree-table :data="deptTree" :columns="deptColumns" expandAll stripe>
        <el-table-column align="center" label="负责人" width="160" show-overflow-tooltip>
          <template slot-scope="scope">
            <el-tag type="primary" v-for="(item, index) in scope.row.lead" :key="index" >{{item.name}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="operateTime" label="更新时间" width="160"></el-table-column>
        <el-table-column align="center" prop="operateName" label="更新人员" width="100"></el-table-column>
        <el-table-column align="center" label="操作" width="160">
          <template slot-scope="scope">
            <el-button-group class="operate">
              <el-button size="mini" class="el-icon-upload2" @click="upDept(scope.row)"></el-button>
              <el-button size="mini" class="el-icon-download" @click="downDept(scope.row)"></el-button>
              <el-button size="mini" class="el-icon-circle-plus-outline" @click="insertDept(scope.row)"></el-button>
              <el-button size="mini" class="el-icon-edit" @click="updateDept(scope.row)"></el-button>
              <el-button size="mini" class="el-icon-delete" @click="deleteDept(scope.row)" :disabled="!scope.row.parentId"></el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </tree-table>
    </div>
    <el-dialog top="0" width="400px" :title="deptTitle" :visible.sync="deptVisible" @close="closeDeptForm">
      <el-form :model="deptModel" :rules="deptRules" label-position="left" label-width="80px" ref="deptForm">
        <el-form-item label="上级" v-if="deptModel.parent.id">
          <el-input :value="deptModel.parent.name" disabled></el-input>
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="deptModel.name"></el-input>
        </el-form-item>
        <el-form-item label="负责人" v-if="deptModel.id">
          <el-button plain style="width: 100%; overflow: hidden" @click="selectLead">
            <div v-if="deptModel.leadKeys.length > 0">
              <span class="lead-block" v-for="(item, index) in deptModel.leadNames" :key="index" >{{item}}</span>
            </div>
            <span class="lead-empty" v-else>添加成员</span>
          </el-button>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="deptModel.remark"></el-input>
        </el-form-item>
      </el-form>
      <el-dialog class="none-padding" title="选择人员" top="0" width="496px" :visible.sync="leadVisible" append-to-body>
        <div class="operate">
          <el-input placeholder="姓名/手机/邮箱" clearable @change="changeQuery"></el-input>
        </div>
        <el-transfer
          filter-placeholder="请输入姓名"
          :titles="titles"
          :data="userData"
          v-model="leadList">
        </el-transfer>
        <div slot="footer" class="dialog-footer">
          <el-button @click="leadVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitLead">确 定</el-button>
        </div>
      </el-dialog>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deptVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitDeptModel">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="none-padding tips-dialog" top="0" width="400px" :visible.sync="deleteVisible" :show-close="false">
      <div><i class="el-icon-warning"></i></div>
      <div class="message">确定要删除该组织吗？</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteDeptModel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TreeTable from '@/components/tree-table'
import {getDeptTree, getUserPageDept, insertDept, updateDept, deleteDept, upDept, downDept} from '@/api/system'

export default {
  name: 'system-dept',
  data () {
    return {
      deptTree: [],
      deptColumns: [{text: '名称', value: 'name'}],
      dept: {},
      deptModel: {parent: {}, leadKeys: [], leadNames: []},
      deptRules: {
        name: [{required: true, message: '名称不能为空', trigger: 'blur'}]
      },
      deptTitle: '',
      deptVisible: false,
      deleteVisible: false,
      titles: ['选择', '已选'],
      userData: [],
      leadList: [],
      leadVisible: false
    }
  },
  mounted () {
    this._getDeptTree()
  },
  methods: {
    insertDept (dept) {
      this.deptModel = {parent: {id: dept.id, name: dept.name}}
      this.deptTitle = '新增组织'
      this.deptVisible = true
    },
    updateDept (dept) {
      Object.assign(this.deptModel, dept)
      if (dept.lead) {
        this.deptModel.leadKeys = dept.lead.map(item => {
          return item.id
        })
        this.deptModel.leadNames = dept.lead.map(item => {
          return item.name
        })
        this.leadList = this.deptModel.leadKeys
      }
      this._getDeptUserList()
      this.deptTitle = '编辑组织'
      this.deptVisible = true
    },
    selectLead () {
      this.leadVisible = true
    },
    submitLead () {
      let leadList = this.userData.filter(user => {
        let bool = false
        this.leadList.forEach(key => {
          if (key === user.key) {
            bool = true
          }
        })
        return bool
      })
      this.deptModel.leadKeys = leadList.map(item => {
        return item.key
      })
      this.deptModel.leadNames = leadList.map(item => {
        return item.label
      })
      this.leadVisible = false
    },
    deleteDept (dept) {
      Object.assign(this.deptModel, dept)
      this.deleteVisible = true
    },
    upDept (dept) {
      upDept(dept.id).then(() => {
        this._getDeptTree()
      })
    },
    downDept (dept) {
      downDept(dept.id).then(() => {
        this._getDeptTree()
      })
    },
    submitDeptModel () {
      this.$refs.deptForm.validate(valid => {
        if (valid) {
          if (!this.deptModel.id) {
            insertDept(this.deptModel).then(() => {
              this._getDeptTree()
              this.deptVisible = false
            })
          } else {
            updateDept(this.deptModel).then(() => {
              this._getDeptTree()
              this.deptVisible = false
            })
          }
        }
      })
    },
    deleteDeptModel () {
      deleteDept(this.deptModel.id).then(() => {
        this._getDeptTree()
        this.deleteVisible = false
      })
    },
    closeDeptForm () {
      this.leadList = []
      this.deptModel = {parent: {}, leadKeys: [], leadNames: []}
      this.$refs.deptForm.clearValidate()
    },
    changeQuery (val) {
      this.query = val
      this._getDeptUserList()
    },
    _getDeptTree () {
      getDeptTree().then(res => {
        this.deptTree = res.data
      })
    },
    _getDeptUserList () {
      this.userData = []
      getUserPageDept(this.deptModel.id, this.query, 1, 20).then(res => {
        if (res.data.data) {
          res.data.data.forEach(user => {
            this.userData.push({
              label: user.name,
              key: user.id
            })
          })
        }
      })
    }
  },
  components: {
    TreeTable
  }
}
</script>

<style scoped lang="stylus">
.el-tag
  margin 0 2px
.lead-block
  padding 5px
  margin-right 5px
  background #eee
.lead-empty
  color #ccc
.none-padding
  .operate
    padding 10px
    background linear-gradient(90deg, #fff, #f5f5f5)
  .el-transfer
    margin-bottom 10px
</style>