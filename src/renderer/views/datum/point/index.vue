<template>
  <div class="point-container">
    <div class="head-wrapper">
      <div class="search">
        <el-select v-model="deptId" filterable clearable placeholder="请选择区域" @change="changeSelect">
          <el-option label="全部" :value="null" v-if="deptList.length > 1"></el-option>
          <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
        </el-select>
        <el-input v-model="pointDept.query" clearable placeholder="搜索监测点" @change="changeQuery"></el-input>
      </div>
      <div class="operate">
        <el-button size="mini" type="primary" plain icon="el-icon-upload" @click="templateVisible = true">上传数据</el-button>
        <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="selectPoint" :disabled="!deptId" v-if="button.batchInsert && !button.batchInsert.hidden">批量添加</el-button>
        <el-button size="mini" type="primary" plain icon="el-icon-remove-outline" @click="deletePointDept" :disabled="!pointDept.pointKeys.length" v-if="button.batchDelete && !button.batchDelete.hidden">批量移除</el-button>
      </div>
    </div>
    <el-table class="six-table" :data="pointDept.pointList" size="mini" stripe @selection-change="pointDeptChange">
      <el-table-column align="center" type="selection"></el-table-column>
      <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
      <el-table-column prop="typeName" label="类型"></el-table-column>
      <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
      <el-table-column align="center" label="坐标">
        <template slot-scope="scope">
          <el-tag type="primary">[{{scope.row.lat}}, {{scope.row.lng}}]</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作" width="100">
        <template slot-scope="scope">
          <div class="operate">
            <el-button size="mini" icon="el-icon-search" @click="detailPoint(scope.row)"></el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      v-if="pointDept.pointList.length"
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pointDept.currentPage"
      :page-size="pointDept.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="pointDept.totalRecode">
    </el-pagination>
    <el-dialog top="0" width="400px" title="批量上传" :visible.sync="templateVisible">
      <el-upload
        class="upload-detail"
        ref="upload"
        :action="baseUrl+'/datum/point/upload/template'"
        :headers="headers"
        :data="{'deptId': deptId}"
        :file-list="fileList"
        :on-success="onSuccess"
        :auto-upload="false">
        <el-button slot="trigger" size="mini" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="mini" type="success" @click="downloadTemplate">下载模板文件</el-button>
        <div slot="tip" class="el-upload__tip">只能上传xls/xlsx文件，且只能使用上方模板上传</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button @click="templateVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadTemplate">确 定</el-button>
      </div>
    </el-dialog>
    <el-dialog class="none-padding" top="0" width="600px" title="监测点列表" :visible.sync="selectVisible" @close="closeSelectForm">
      <div class="operate">
        <el-input size="mini" v-model="pointNone.query" placeholder="搜索监测点" clearable @change="changeQuery"></el-input>
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="pointNone.currentPage"
          :page-size="pointNone.pageSize"
          layout="total, sizes, prev, pager, next"
          :total="pointNone.totalRecode">
        </el-pagination>
      </div>
      <el-scrollbar class="point-none-wrapper" wrap-class="scrollbar-wrapper" :key="1">
        <el-table :data="pointNone.pointList" size="mini" stripe @selection-change="pointNoneChange">
          <el-table-column align="center" type="selection"></el-table-column>
          <el-table-column prop="name" label="名称" show-overflow-tooltip></el-table-column>
          <el-table-column prop="typeName" label="类型"></el-table-column>
          <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
          <el-table-column align="center" label="坐标">
            <template slot-scope="scope">
              <el-tag type="primary">[{{scope.row.lat}}, {{scope.row.lng}}]</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-scrollbar>
      <div slot="footer" class="dialog-footer">
        <el-button @click="userVisible = false">取 消</el-button>
        <el-button type="primary" @click="insertPointDept" :disabled="!pointNone.pointKeys.length">确 定</el-button>
      </div>
    </el-dialog>
    <transition name="fade">
      <detail class="detail-dialog" v-if="pointVisible" :point="point" :button="button" @close="closeDetail"></detail>
    </transition>
  </div>
</template>

<script>
import Detail from './detail'
import { download } from '@/common/utils'
import { getToken } from '@/common/utils/auth'
import { getDeptList } from '@/api/system'
import { getPointPage, insertPointDept, deletePointDept, downloadTemplate } from '@/api/datum'

export default {
  data () {
    return {
      baseUrl: process.env.BASE_API,
      headers: {
        'X-Token': getToken()
      },
      button: {},
      deptList: [],
      deptId: null,
      pointDept: {
        query: '',
        currentPage: 1,
        pageSize: 20,
        totalRecode: 0,
        pointList: [], // 区域监测点
        pointKeys: [] // 选中的监测点ID数组
      },
      pointNone: {
        query: '',
        currentPage: 1,
        pageSize: 20,
        totalRecode: 0,
        pointList: [], // 未绑定区域的监测点
        pointKeys: [] // 选中的监测点ID数组
      },
      templateVisible: false,
      fileList: [],
      selectVisible: false,
      point: {},
      pointVisible: false
    }
  },
  mounted () {
    this._initData()
  },
  methods: {
    changeSelect () {
      this._getPointListDept()
    },
    changeQuery () {
      this._getPointListDept()
    },
    uploadTemplate () {
      this.$refs.upload.submit()
    },
    onSuccess (res) {
      if (res.code === 1) {
        this.$message({
          message: res.msg,
          type: 'success'
        })
        this.fileList = []
        this.templateVisible = false
      } else {
        this.fileList = []
        this.$message.error(res.msg)
      }
    },
    downloadTemplate () {
      downloadTemplate().then(res => {
        download(res, '源数据采集.xlsx')
      })
    },
    selectPoint () {
      this._getPointListNone()
      this.selectVisible = true
    },
    detailPoint (point) {
      this.point = point
      this.pointVisible = true
    },
    closeDetail () {
      this.pointVisible = false
    },
    handleSizeChange (val) {
      if (this.selectVisible) {
        if (val > this.pointNone.pageSize) {
          this.pointNone.currentPage = Math.ceil(this.pointNone.totalRecode / val)
        }
        this.pointNone.pageSize = val
        this._getPointListNone()
      } else {
        if (val > this.pointDept.pageSize) {
          this.pointDept.currentPage = Math.ceil(this.pointDept.totalRecode / val)
        }
        this.pointDept.pageSize = val
        this._getPointListDept()
      }
    },
    handleCurrentChange (val) {
      if (this.userVisible) {
        this.pointNone.currentPage = val
        this._getPointListNone()
      } else {
        this.pointDept.currentPage = val
        this._getPointListDept()
      }
    },
    pointDeptChange (selection) {
      this.pointDept.pointKeys = selection.map(item => {
        return item.id
      })
    },
    pointNoneChange (selection) {
      this.pointNone.pointKeys = selection.map(item => {
        return item.id
      })
    },
    deletePointDept () {
      deletePointDept(this.pointDept.pointKeys).then(() => {
        this._getPointListDept()
      })
    },
    insertPointDept () {
      insertPointDept(this.deptId, this.pointNone.pointKeys).then(() => {
        this._getPointListDept()
        this.selectVisible = false
      })
    },
    closeSelectForm () {
      this.pointNone.query = ''
      this.pointNone.pointList = []
      this.pointNone.pointKeys = []
    },
    _getPointListDept () {
      getPointPage(true, this.deptId, null, this.pointDept.query, this.pointDept.currentPage, this.pointDept.pageSize).then(res => {
        this.pointDept.totalRecode = res.data.total
        this.pointDept.pointList = res.data.data
      })
    },
    _getPointListNone () {
      getPointPage(false, null, null, this.pointNone.query, this.pointNone.currentPage, this.pointNone.pageSize).then(res => {
        this.pointNone.totalRecode = res.data.total
        this.pointNone.pointList = res.data.data
      })
    },
    _initData () {
      Object.assign(this.button, this.$route.meta.button)
      getDeptList(null, true).then(res => {
        this.deptList = res.data
        if (this.deptList.length === 1) {
          this.deptId = this.deptList[0].id
        }
      })
      this._getPointListDept()
    }
  },
  components: {
    Detail
  }
}
</script>

<style lang="stylus" scoped>
.point-container
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
    .point-none-wrapper
      height 300px
  .detail-dialog
    position absolute
    top 0
    left 0
    z-index 1000
    height calc(100vh - 40px)
  .upload-detail
    padding-bottom 20px
</style>