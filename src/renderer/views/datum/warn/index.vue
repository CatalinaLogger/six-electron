<template>
  <div class="warn-container">
    <div class="head-wrapper">
      <div class="search">
        <el-select v-model="deptId" filterable clearable placeholder="请选择区域" @change="changeSelect">
          <el-option label="全部" :value="null" v-if="deptList.length > 1"></el-option>
          <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
        </el-select>
        <el-input v-model="warnPoint.query" clearable placeholder="搜索监测点" @change="changeQuery"></el-input>
      </div>
      <div class="operate">
        <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="updateWarn" :disabled="!warnPoint.warnKeys.length">发布预警</el-button>
<!--
        <el-button size="mini" type="primary" plain icon="el-icon-remove-outline" @click="deleteWarn" :disabled="!warnPoint.warnKeys.length">取消预警</el-button>
-->
      </div>
    </div>
    <el-table class="six-table" :data="warnPoint.warnList" size="mini" stripe @selection-change="warnPointChange">
      <el-table-column align="center" type="selection"></el-table-column>
      <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="typeName" label="类型"></el-table-column>
      <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
      <el-table-column align="center" label="预警结果">
        <template slot-scope="scope">
          <div :class="'level' + scope.row.level" @click="changeLevel(scope.row)">{{levelName[scope.row.level]}}</div>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="time" label="预警时间" show-overflow-tooltip></el-table-column>
    </el-table>
    <el-pagination
      v-if="warnPoint.warnList.length"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="warnPoint.currentPage"
      :page-size="warnPoint.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="warnPoint.totalRecode">
    </el-pagination>
    <el-dialog class="none-padding tips-dialog" top="0" width="400px" :visible.sync="visible" :show-close="false">
      <div><i class="el-icon-warning"></i></div>
      <div class="message">确定要{{title}} {{this.warnPoint.warnKeys.length}} 个预警结果吗？</div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="warning" @click="submitModel(0)">只发布</el-button>
        <el-button type="primary" @click="submitModel(1)">发布并发送短信</el-button>
      </div>
    </el-dialog>
    <el-dialog top="0" width="400px" title="预警结论" :visible.sync="levelVisible" @close="closeLevelForm">
      <el-form :model="levelModel" :rules="levelRules" label-position="left" label-width="70px" ref="levelForm">
        <el-form-item label="触发事件">
          <el-input type="textarea" :autosize="{ minRows: 5}" readonly resize="none" v-model="levelModel.remark"></el-input>
        </el-form-item>
        <el-form-item label="预警等级" prop="level">
          <el-select v-model="levelModel.level" placeholder="请选择" style="width: 100%">
            <el-option label="红色预警" :value="4"></el-option>
            <el-option label="橙色预警" :value="3"></el-option>
            <el-option label="黄色预警" :value="2"></el-option>
            <el-option label="蓝色预警" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="设备">
          <el-input :maxlength="20" v-model="levelModel.device"></el-input>
        </el-form-item>
        <el-form-item label="事件">
          <el-input :maxlength="20" v-model="levelModel.event"></el-input>
        </el-form-item>
        <el-form-item label="短信预览">
          <el-input type="textarea" :autosize="{ minRows: 6}" readonly resize="none" v-model="message"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="closeLevelForm">取 消</el-button>
        <el-button type="primary" @click="submitLevelModel">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDeptList } from '@/api/system'
import { getWarnPage, updateWarn, deleteWarn, updateWarnLevel } from '@/api/datum'

export default {
  data () {
    return {
      deptList: [],
      deptId: null,
      warnPoint: {
        query: '',
        currentPage: 1,
        pageSize: 20,
        totalRecode: 0,
        warnList: [], // 区域监测点
        warnKeys: [] // 选中的监测点ID数组
      },
      levelName: ['数据缺失', '蓝色预警', '黄色预警', '橙色预警', '红色预警'],
      visible: false,
      title: '',
      type: true,
      levelVisible: false,
      levelModel: {},
      levelRules: {
        remark: [{required: true, trigger: 'blur', message: '变更原因不能为空'}]
      },
      sendVisible: false
    }
  },
  computed: {
    message () {
      return `【北斗微芯】您有新的预警信息：${this.levelModel.address}于${this.levelModel.time}已确认${this.levelModel.device}发生了${this.levelModel.event},监测系统发出${this.levelName[this.levelModel.level]}信息。请加密观测，加强群测群防工作。`
    }
  },
  mounted () {
    this._initData()
  },
  methods: {
    changeSelect () {
      this._getWarnList()
    },
    changeQuery () {
      this._getWarnList()
    },
    updateWarn () {
      this.title = '发布'
      this.type = true
      this.visible = true
    },
    updateSend () {
      this.sendVisible = true
    },
    deleteWarn () {
      this.title = '排除'
      this.type = false
      this.visible = true
    },
    submitModel (send) {
      if (this.type) {
        updateWarn(this.warnPoint.warnKeys, send).then(() => {
          this._getWarnList()
          this.visible = false
        })
      } else {
        deleteWarn(this.warnPoint.warnKeys).then(() => {
          this._getWarnList()
          this.visible = false
        })
      }
    },
    handleSizeChange (val) {
      if (val > this.warnPoint.pageSize) {
        this.warnPoint.currentPage = Math.ceil(this.warnPoint.totalRecode / val)
      }
      this.warnPoint.pageSize = val
      this._getWarnList()
    },
    handleCurrentChange (val) {
      this.warnPoint.currentPage = val
      this._getWarnList()
    },
    warnPointChange (selection) {
      this.warnPoint.warnKeys = selection.map(item => {
        return item.warnId
      })
    },
    changeLevel (row) {
      console.log(row)
      this.levelModel = {level: 1, remark: '', device: '', event: ''}
      Object.assign(this.levelModel, row)
      this.levelVisible = true
    },
    submitLevelModel () {
      this.$refs.levelForm.validate(valid => {
        if (valid) {
          updateWarnLevel(this.levelModel).then(() => {
            this._getWarnList()
            this.levelVisible = false
          })
        }
      })
    },
    closeLevelForm () {
      this.$refs.levelForm.clearValidate()
      this.levelVisible = false
    },
    _getWarnList () {
      getWarnPage(this.deptId, this.warnPoint.query, this.warnPoint.currentPage, this.warnPoint.pageSize).then(res => {
        this.warnPoint.totalRecode = res.data.total
        this.warnPoint.warnList = res.data.data
      })
    },
    _initData () {
      getDeptList(null, true).then(res => {
        this.deptList = res.data
        if (this.deptList.length === 1) {
          this.deptId = this.deptList[0].id
        }
      })
      this._getWarnList()
    }
  }
}
</script>

<style lang="stylus" scoped>
.warn-container
  .head-wrapper
    position relative
    padding 0 10px
    height 40px
    background linear-gradient(90deg, #f5f5f5, #eee)
    .search
      padding-top 4px
      .el-select
        width 200px
      .el-input
        display inline-block
        width 200px
    .operate
      position absolute
      top 6px
      right 10px
  .level0
    color #909399
    cursor pointer
  .level1
    color #409EFF
    cursor pointer
  .level2
    color #f4e925
    cursor pointer
  .level3
    color #E6A23C
    cursor pointer
  .level4
    color #F56C6C
    cursor pointer
</style>