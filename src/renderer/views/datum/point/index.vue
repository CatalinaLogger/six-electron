<template>
  <div class="point-container">
    <div class="head-wrapper">
      <div class="search">
        <el-select v-model="deptId" filterable clearable placeholder="请选择区域">
          <el-option v-for="dept in deptList" :key="dept.id" :label="dept.name" :value="dept.id"></el-option>
        </el-select>
        <el-input v-model="query" clearable placeholder="搜索监测点"></el-input>
      </div>
      <div class="operate">
        <el-button size="mini" type="primary" plain icon="el-icon-circle-plus-outline">批量添加</el-button>
        <el-button size="mini" type="primary" plain icon="el-icon-remove-outline">批量移除</el-button>
      </div>
    </div>
    <el-scrollbar class="point-body-wrapper" wrap-class="scrollbar-wrapper">
      <div class="point title"><div>名称</div><div>类型</div><div>位置</div><div>状态</div><div>操作</div></div>
      <div class="point" v-for="point in pointList" :key="point.id">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import { getDeptList } from '@/api/system'

export default {
  data () {
    return {
      deptList: [],
      deptId: null,
      query: ''
    }
  },
  mounted () {
    this._initData()
  },
  methods: {
    _initData () {
      getDeptList(null, true).then(res => {
        this.deptList = res.data
      })
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
  .point-body-wrapper
    height calc(100vh - 80px)
    .point
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
        white-space nowrap
        text-overflow ellipsis
        overflow hidden
</style>