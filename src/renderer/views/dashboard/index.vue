<template>
  <div class="dashboard-container">
    <div class="chart-wrapper" :class="{'vacuity': mapVisible}">
      <div :style="{'min-width': minWidth + 'px', 'height': height + 'px'}">
        <div class="head">实况预警</div>
        <div class="body">
          <chart class-name="ring" :option="optionRing" @click="clickRing"></chart>
        </div>
      </div>
      <div :style="{'min-width': minWidth + 'px', 'height': height + 'px'}">
        <div class="head">预警统计</div>
        <div class="body">
          <chart class-name="line" :option="optionLine" @click="clickRing"></chart>
        </div>
      </div>
      <div :style="{'min-width': minWidth + 'px', 'height': height + 'px'}">
        <div class="head">监测点</div>
        <div class="body">
          <el-scrollbar class="point-wrapper" wrap-class="scrollbar-wrapper">
            <div class="point-row" :class="'level-' + item.level" v-for="item in pointList" :key="item.id" @click="showMap">
              <span class="label">{{item.name}}&nbsp;&nbsp;&nbsp;&nbsp;径向渐变 - 颜色结点均匀分布（默认情况下)径向渐变 - 颜色结点均匀分布（默认情况下)径向渐变 - 颜色结点均匀分布（默认情况下)</span>
            </div>
          </el-scrollbar>
        </div>
      </div>
      <div :style="{'min-width': minWidth + 'px', 'height': height + 'px'}">
        <div class="head">最新动态</div>
        <div class="body">
        </div>
      </div>
    </div>
    <transition name="fade-map" mode="out-in">
      <map-info class="map-wrapper" v-if="mapVisible" @close="mapVisible = false"></map-info>
    </transition>
  </div>
</template>

<script>
import Chart from '@/components/chart'
import MapInfo from './map-info'
import { getPointPage } from '@/api/datum'

export default {
  data () {
    return {
      optionRing: null,
      optionLine: null,
      pointList: [
        {id: 1, name: '隐患点1', level: 0},
        {id: 2, name: '隐患点2', level: 1},
        {id: 3, name: '隐患点3', level: 2},
        {id: 4, name: '隐患点4', level: 2},
        {id: 5, name: '隐患点5', level: 2},
        {id: 6, name: '隐患点6', level: 2},
        {id: 7, name: '隐患点7', level: 1},
        {id: 8, name: '隐患点8', level: 2},
        {id: 9, name: '隐患点9', level: 3},
        {id: 10, name: '隐患点10', level: 4},
        {id: 11, name: '隐患点11', level: 0},
        {id: 12, name: '隐患点12', level: 1},
        {id: 13, name: '隐患点13', level: 2},
        {id: 14, name: '隐患点14', level: 3},
        {id: 15, name: '隐患点15', level: 4},
        {id: 16, name: '隐患点16', level: 0},
        {id: 17, name: '隐患点17', level: 1},
        {id: 18, name: '隐患点18', level: 2},
        {id: 19, name: '隐患点19', level: 3},
        {id: 20, name: '隐患点10', level: 4},
        {id: 21, name: '隐患点21', level: 0},
        {id: 22, name: '隐患点22', level: 1},
        {id: 23, name: '隐患点23', level: 2},
        {id: 24, name: '隐患点24', level: 3},
        {id: 25, name: '隐患点25', level: 4},
        {id: 26, name: '隐患点26', level: 0}
      ],
      height: 0,
      minWidth: 0,
      mapVisible: false
    }
  },
  mounted () {
    this._initData()
    this.drawRing()
    let resize = () => {
      let width = window.innerWidth
      let height = window.innerHeight
      this.minWidth = (width - 230) / 2
      this.height = (height - 50) / 2
    }
    resize()
    window.addEventListener('resize', resize)
  },
  methods: {
    clickRing (params) {
      console.log(params)
    },
    showMap () {
      this.mapVisible = true
    },
    drawRing () {
      this.optionRing = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        legend: {
          orient: 'vertical',
          left: '5px',
          data: ['红色预警', '橙色预警', '黄色预警', '蓝色预警', '监测正常']
        },
        series: [
          {
            name: '预警级别',
            type: 'pie',
            data: [
              {value: 335, name: '红色预警', type: 4, itemStyle: {color: '#F56C6C'}},
              {value: 310, name: '橙色预警', type: 3, itemStyle: {color: '#E6A23C'}},
              {value: 234, name: '黄色预警', type: 2, itemStyle: {color: '#e2e200'}},
              {value: 135, name: '蓝色预警', type: 1, itemStyle: {color: '#409EFF'}},
              {value: 1548, name: '监测正常', type: 0, itemStyle: {color: '#67C23A'}}
            ]
          }
        ]
      }
      this.optionLine = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        grid: {
          left: '0%',
          top: '8%',
          right: '6%',
          bottom: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'value'
        },
        yAxis: {
          type: 'category',
          data: ['监测正常', '蓝色预警', '黄色预警', '橙色预警', '红色预警']
        },
        series: [
          {
            type: 'bar',
            label: {
              normal: {
                show: true,
                position: 'insideRight'
              }
            },
            data: [
              {value: 1548, name: '监测正常', type: 0, itemStyle: {color: '#67C23A'}},
              {value: 135, name: '蓝色预警', type: 1, itemStyle: {color: '#409EFF'}},
              {value: 234, name: '黄色预警', type: 2, itemStyle: {color: '#e2e200'}},
              {value: 310, name: '橙色预警', type: 3, itemStyle: {color: '#E6A23C'}},
              {value: 335, name: '红色预警', type: 4, itemStyle: {color: '#F56C6C'}}
            ]
          }
        ]
      }
    },
    _initData () {
      getPointPage(true, null, 1, null, 1, 100).then(res => {
        console.log(res)
      })
    }
  },
  components: {
    Chart,
    MapInfo
  }
}
</script>

<style scoped lang="stylus">
$text-show = #409EFF
$red = #F56C6C
$orange = #E6A23C
$yellow = #f4e925
$blue = #409EFF
$green = #67C23A

.dashboard-container
  position relative
  min-height calc(100vh - 40px)
  background radial-gradient(#fff, #eee)
  .chart-wrapper
    display flex
    flex-wrap wrap
    width 100%
    &.vacuity
      filter blur(20px)
    &>div
      position relative
      flex 1
      .head
        width 100%
        height 30px
        text-align center
        font-size 14px
        font-weight bold
        line-height 30px
        color #409EFF
      .body
        position absolute
        top 0
        width 100%
        height 100%
        padding-top 30px
    .point-wrapper
      height 100%
      .point-row
        display flex
        margin 0 10px 2px
        height 30px
        line-height 30px
        cursor pointer
        &:hover
          background #fff !important
        .label
          margin 0 20px
          font-size 14px
          overflow hidden
          text-overflow ellipsis
          white-space nowrap
          // text-shadow $text-show 1px 0 0, $text-show 0 1px 0, $text-show -1px 0 0, $text-show 0 -1px 0
          // filter Glow(color=$text-show, strength=1)
        &.level-0
          background $green
        &.level-1
          background $blue
        &.level-2
          background $yellow
        &.level-3
          background $orange
        &.level-4
          background $red
  .map-wrapper
    position absolute
    top 0
    left 0
    width 100%
    height 100%
    z-index 100
</style>