<template>
  <div class="point-container">
    <div class="head-wrapper">
      <div class="search">
        <el-select v-model="deptId" filterable clearable placeholder="请选择区域">
          <el-option label="全部" :value="null"></el-option>
          <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
        </el-select>
        <el-input v-model="pointDept.query" clearable placeholder="搜索监测点"></el-input>
      </div>
      <div class="operate">
        <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline" @click="selectPoint" :disabled="!deptId">批量添加</el-button>
        <el-button size="mini" type="primary" plain icon="el-icon-remove-outline" @click="deletePointDept" :disabled="!pointDept.pointKeys.length">批量移除</el-button>
      </div>
    </div>
    <el-table class="six-table" :data="pointDept.pointList" size="mini" stripe @selection-change="pointDeptChange">
      <el-table-column align="center" type="selection"></el-table-column>
      <el-table-column prop="name" label="名称"></el-table-column>
      <el-table-column prop="typeName" label="类型"></el-table-column>
      <el-table-column prop="address" label="地址" show-overflow-tooltip></el-table-column>
      <el-table-column align="center" label="坐标">
        <template slot-scope="scope">
          <el-tag type="primary">[{{scope.row.lat}}, {{scope.row.lng}}]</el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作">
        <template slot-scope="scope">
          <div class="operate">
            <el-button size="mini" icon="el-icon-edit" @click="updateUser(user)"></el-button>
            <el-button size="mini" icon="el-icon-delete" @click="deleteUser(user)"></el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page.sync="pointDept.currentPage"
      :page-size="pointDept.pageSize"
      layout="total, sizes, prev, pager, next"
      :total="pointDept.totalRecode">
    </el-pagination>
    <el-dialog class="none-padding" top="0" width="600px" title="监测点列表" :visible.sync="pointVisible" @close="closePointForm">
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
          <el-table-column prop="name" label="名称"></el-table-column>
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
  </div>
</template>

<script>
import { getDeptList } from '@/api/system'
import { getPointPage, insertPointDept, deletePointDept } from '@/api/datum'

export default {
  data () {
    return {
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
      pointVisible: false
    }
  },
  mounted () {
    this._initData()
  },
  methods: {
    selectPoint () {
      this._getPointListNone()
      this.pointVisible = true
    },
    changeQuery (val) {
    },
    handleSizeChange (val) {
    },
    handleCurrentChange (val) {
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
        this.pointVisible = false
      })
    },
    closePointForm () {
      this.pointNone.query = ''
      this.pointNone.pointList = []
      this.pointNone.pointKeys = []
    },
    _getPointListDept () {
      getPointPage(true, this.deptId, this.pointDept.query, this.pointDept.currentPage, this.pointDept.pageSize).then(res => {
        this.pointDept.totalRecode = res.data.total
        this.pointDept.pointList = res.data.data
      })
    },
    _getPointListNone () {
      getPointPage(false, null, this.pointNone.query, this.pointNone.currentPage, this.pointNone.pageSize).then(res => {
        this.pointNone.totalRecode = res.data.total
        this.pointNone.pointList = res.data.data
      })
    },
    _initData () {
      getDeptList(null, true).then(res => {
        this.deptList = res.data
      })
      this._getPointListDept()
    }
  }
}
</script>

<style lang="stylus" scoped>
.point-container
  height calc(100vh - 40px)
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
</style>