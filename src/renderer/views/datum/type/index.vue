<template>
  <div class="type-container">
    <div class="type-wrapper">
      <div class="head-wrapper">
        <div class="title">类型</div>
      </div>
      <el-scrollbar class="type-body-wrapper" wrap-class="scrollbar-wrapper">
        <div class="option" :class="{'active': item.id === type.id}" v-for="item in typeList" :key="item.id" @click="selectType(item)">{{item.name}}</div>
      </el-scrollbar>
    </div>
    <div class="data-wrapper">
      <div class="head-wrapper">
        <div class="title">类型值</div>
        <div class="operate">
          <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="insertType" :disabled="!type.id">新增类型值</el-button>
        </div>
      </div>
      <el-scrollbar class="data-body-wrapper" wrap-class="scrollbar-wrapper">
        <div class="six-row title"><div>名称</div><div>更新时间</div><div>更新人员</div><div>操作</div></div>
        <div class="six-row" v-for="item in dataList" :key="item.id">
          <div>{{item.name}}</div>
          <div>{{item.operateTime}}</div>
          <div>{{item.operateName}}</div>
          <div>
            <el-button-group class="operate">
              <el-button size="mini" class="el-icon-upload2" @click="upType(item)"></el-button>
              <el-button size="mini" class="el-icon-download" @click="downType(item)"></el-button>
              <el-button size="mini" icon="el-icon-edit" @click="updateType(item)"></el-button>
              <el-button size="mini" icon="el-icon-delete" @click="deleteType(item)"></el-button>
            </el-button-group>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <el-dialog top="0" width="400px" :title="typeTitle" :visible.sync="typeVisible" @close="closeTypeForm">
      <el-form :model="typeModel" :rules="typeRules" label-position="left" label-width="50px" ref="typeForm">
        <div class="form-wrapper">
          <el-form-item label="名称" prop="name">
            <el-input v-model="typeModel.name"></el-input>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="typeModel.remark"></el-input>
          </el-form-item>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="typeVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitTypeModel">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="none-padding tips-dialog" top="0" width="400px" :visible.sync="deleteVisible" :show-close="false">
      <div><i class="el-icon-warning"></i></div>
      <div class="message">确定要删除该类型值吗？</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="deleteVisible = false">取 消</el-button>
        <el-button type="primary" @click="deleteTypeModel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getTypeList, insertType, updateType, deleteType, upType, downType } from '@/api/datum'

export default {
  data () {
    return {
      typeList: [],
      type: {},
      dataList: [],
      typeModel: {parent: {}},
      typeRules: {name: [{required: true, trigger: 'blur', message: '名称不能为空'}]},
      typeTitle: '',
      typeVisible: false,
      deleteVisible: false
    }
  },
  mounted () {
    this._initData()
  },
  methods: {
    selectType (type) {
      this.type = type
      this._getDataList()
    },
    insertType () {
      this.typeModel = {parent: this.type}
      this.typeTitle = '新增类型值'
      this.typeVisible = true
    },
    updateType (type) {
      this.typeModel = {parent: this.type}
      Object.assign(this.typeModel, type)
      this.typeTitle = '编辑类型值'
      this.typeVisible = true
    },
    deleteType (type) {
      Object.assign(this.typeModel, type)
      this.deleteVisible = true
    },
    upType (type) {
      upType(type.id).then(() => {
        this._getDataList()
      })
    },
    downType (type) {
      downType(type.id).then(() => {
        this._getDataList()
      })
    },
    submitTypeModel () {
      this.$refs.typeForm.validate(valid => {
        if (valid) {
          if (!this.typeModel.id) {
            insertType(this.typeModel).then(() => {
              this._getDataList()
              this.typeVisible = false
            })
          } else {
            updateType(this.typeModel).then(() => {
              this._getDataList()
              this.typeVisible = false
            })
          }
        }
      })
    },
    deleteTypeModel () {
      deleteType(this.typeModel.id).then(() => {
        this._getDataList()
        this.deleteVisible = false
      })
    },
    closeTypeForm () {
      this.typeModel = {parent: {}}
      this.$refs.typeForm.clearValidate()
    },
    _getDataList () {
      getTypeList(this.type.id).then(res => {
        this.dataList = res.data
      })
    },
    _initData () {
      getTypeList().then(res => {
        this.typeList = res.data
        this.type = this.typeList[0]
        this._getDataList()
      })
    }
  }
}
</script>

<style scoped lang="stylus">
.type-container
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
  .type-wrapper
    min-width 200px
    border-right 1px solid #eee
  .data-wrapper
    position relative
    flex-grow 1
  .type-body-wrapper
    height calc(100vh - 80px)
    .option
      padding-left 10px
      height 40px
      font-size 14px
      line-height 40px
      cursor pointer
      &.active
        color white
        background #409eff !important
      &:hover
        background #d7eaff
  .data-body-wrapper
    height calc(100vh - 80px)
</style>