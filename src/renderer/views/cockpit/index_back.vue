<template>
  <el-scrollbar class="cockpit-container" wrap-class="scrollbar-wrapper" style="min-width: 1368px">
    <img class="map-bg" src="/static/images/map.svg" alt="">
    <div class="header">
      <!--<chart class="earth" :class="{'show': earthShow}" :option="optionEarth"></chart>-->
      <div class="title">宁乡市地质灾害监测平台</div>
      <div class="message">
        <div class="text-wrapper">
          <transition name="roll-transform" mode="out-in">
            <div class="text" v-if="notice" v-html="notice.text"></div>
          </transition>
        </div>
      </div>
      <div class="time" v-html="now"></div>
      <div class="shutdown" @click="logout">
        <svg-icon icon-class="shutdown"></svg-icon>
      </div>
    </div>
    <div class="content">
      <div class="left">
        <block :style="{'height': height + 'px'}" style="min-height: 324px">
          <arrow :size="15"></arrow>
          <div class="head">预警统计</div>
          <div class="info">监测点数量<span class="number">{{infoModel.warn}}</span>个</div>
          <div class="info">红色预警<span class="number">{{infoModel.red}}</span>个</div>
          <div class="info">橙色预警<span class="number">{{infoModel.orange}}</span>个</div>
          <div class="body">
            <chart :option="optionWarn"></chart>
          </div>
        </block>
        <block :style="{'height': height + 'px'}" style="min-height: 324px">
          <div class="head">{{showType? '隐患点类型' : '设备类型'}}</div>
          <template v-if="showType">
            <div class="info">隐患点数量<span class="number">{{infoModel.point}}</span>个</div>
            <div class="info"></div>
            <div class="info"></div>
          </template>
          <template v-else>
            <div class="info">总设备数量<span class="number">{{infoModel.online + infoModel.offline}}</span>台</div>
            <div class="info">在线数量<span class="number">{{infoModel.online}}</span>台</div>
            <div class="info">离线数量<span class="number">{{infoModel.offline}}</span>台</div>
          </template>
          <div class="body">
            <chart :option="optionType"></chart>
          </div>
        </block>
      </div>
      <div class="center">
        <block :style="{'height': height + 150 + 'px'}" style="min-height: 474px">
          <div class="head"><svg-icon icon-class="warn"></svg-icon><span class="label">隐患点预警等级分布</span></div>
          <chart class="level" :option="optionMap" @click="clickPoint"></chart>
        </block>
        <block :style="{'height': height - 150 + 'px'}" style="min-height: 174px">
          <arrow :size="30"></arrow>
          <div class="head">设备在线情况统计</div>
          <div class="body">
            <chart :option="optionDevice"></chart>
          </div>
        </block>
      </div>
      <div class="right">
        <block style="height: 170px">
          <arrow></arrow>
          <div class="head">监测数据统计</div>
          <div class="body count">
            <div class="outside">
              <div class="inside">
                {{infoModel.total}}
                <div class="title">总数据量</div>
                <div class='corner left-top'></div>
                <div class='corner right-top'></div>
                <div class='corner right-bottom'></div>
                <div class='corner left-bottom'></div>
              </div>
            </div>
            <div class="outside">
              <div class="inside">
                {{infoModel.today}}
                <div class="title">今日数据</div>
                <div class='corner left-top'></div>
                <div class='corner right-top'></div>
                <div class='corner right-bottom'></div>
                <div class='corner left-bottom'></div>
              </div>
            </div>
          </div>
        </block>
        <block class="level" style="height: 200px">
          <div class="row">
            <div class="col">四级预警</div><div class="col">三级预警</div><div class="col">二级预警</div><div class="col">一级预警</div>
          </div>
          <div class="row">
            <div class="col level-2">蓝色</div><div class="col level-3">黄色</div><div class="col level-4">橙色</div><div class="col level-5">红色</div>
          </div>
          <div class="row">
            <div class="col">正常</div><div class="col">加强观察、观测</div><div class="col">暂停活动，排除险情恢复</div><div class="col">全部撤离，并警戒</div>
          </div>
        </block>
        <block :style="{'height': height * 2 - 380 + 'px'}" style="min-height: 268px">
          <arrow></arrow>
          <div class="head" @click="toLink('/datum/point')">隐患点列表</div>
          <el-scrollbar class="body point" wrap-class="scrollbar-wrapper">
            <div class="row" :class="'level-' + item.level" v-for="item in pointList" :key="item.id" @click="showMap(item)">{{item.name}}&nbsp;&nbsp;&nbsp;&nbsp;{{item.address}}</div>
          </el-scrollbar>
        </block>
      </div>
    </div>
    <transition name="fade-map" mode="out-in">
      <map-info class="map-wrapper" v-if="mapVisible" :point="point" @close="mapVisible = false"></map-info>
    </transition>
  </el-scrollbar>
</template>

<script>
import echarts from 'echarts'
import 'echarts-gl'
import Chart from '@/components/chart'
import Block from '@/components/block'
import Arrow from '@/components/arrow'
import MapInfo from './map-info'
import { mapGetters } from 'vuex'
import { weather } from '@/api/amap'
import { getPointPage } from '@/api/datum'
import { getOnline, getCount, getNxJson } from '@/api/cockpit'

export default {
  data () {
    return {
      mapVisible: false,
      height: 0,
      now: '',
      earthShow: false,
      optionEarth: {},
      optionMap: {},
      optionSar: {},
      optionWarn: {}, // 监测预警分布图
      optionDevice: {}, // 设备在线掉线直方图
      optionType: {}, // 监测点、设备类型数量饼图
      showType: true,
      poiType: [],
      devType: [],
      rollList: [], // 顶部滚动输出列表
      notice: null, // 当前顶部显示文字
      pointList: [],
      point: {},
      index: null,
      infoModel: {
        warn: 0,
        red: 0,
        orange: 0,
        point: 0,
        online: 0,
        offline: 0,
        total: null, // 总数据量
        today: null // 今日数据
      }
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  mounted () {
    this.$store.dispatch('setFullScreen', true)
    this._initJson()
    let resize = () => {
      let height = window.innerHeight
      this.height = (height - 80) / 2
    }
    resize()
    window.addEventListener('resize', resize)
  },
  beforeDestroy () {
    this.$store.dispatch('setFullScreen', false)
    this._clearData()
  },
  methods: {
    logout () {
      let main = this.$electron.remote.getCurrentWindow()
      main.destroy()
    },
    clickPoint (event) {
      if (event.componentType === 'series') {
        let pointId = event.value[2]
        let point = this.pointList.filter(item => {
          return item.id === pointId
        })[0]
        if (point) {
          this.showMap(point)
        }
      }
    },
    showMap (point) {
      this.point = point
      this.mapVisible = true
    },
    toLink (point) {
      let size = this.roles.filter(item => {
        return item.id < 4
      }).length
      if (size > 0) {
        this.$router.push(point)
      }
    },
    drawChart () {
      this.optionEarth = {
        globe: {
          baseTexture: '/static/images/earth.jpg',
          heightTexture: '/static/images/earth.jpg',
          displacementScale: 0.04,
          shading: 'realistic',
          realisticMaterial: {
            roughness: 0.9
          },
          postEffect: {
            enable: true
          },
          light: {
            main: {
              intensity: 5,
              shadow: true
            },
            ambientCubemap: {
              diffuseIntensity: 0.2
            }
          }
        }
      }
      setTimeout(() => {
        this.earthShow = true
      }, 1000)
      this.optionWarn = {
        tooltip: {
          trigger: 'item',
          formatter: '{b} <br/>{c} ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: ['0', '50%'],
          center: ['50%', '60%'],
          label: {
            formatter: ['{b}', '{d}%'].join('\n')
          },
          data: []
        }]
      }
      this.optionType = {
        tooltip: {
          trigger: 'item',
          formatter: '{b} <br/>{c} ({d}%)'
        },
        series: [{
          type: 'pie',
          radius: ['0', '50%'],
          center: ['50%', '60%'],
          label: {
            formatter: ['{b}', '{d}%'].join('\n')
          },
          data: []
        }]
      }
      this.optionDevice = {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}'
        },
        grid: {
          left: 10,
          top: 15,
          right: 5,
          bottom: 5,
          containLabel: true
        },
        xAxis: {
          splitLine: {show: false},
          splitArea: {show: false},
          axisLabel: {
            interval: 0
          },
          type: 'category',
          data: []
        },
        yAxis: {
          splitLine: {show: false},
          splitArea: {show: false},
          type: 'value'
        },
        series: [
          {
            name: '在线',
            type: 'bar',
            label: {normal: {show: true, position: 'top'}},
            itemStyle: {color: '#67C23A'},
            data: []
          },
          {
            name: '离线',
            type: 'bar',
            label: {normal: {show: true, position: 'top'}},
            itemStyle: {color: '#F56C6C'},
            data: []
          }
        ]
      }
    },
    formatWeek (week) {
      if (week === '7' || week === 7) {
        return '星期日'
      }
      let weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
      return weekday[week]
    },
    _initData () {
      /** 天气预报数据 */
      let loadWeather = () => {
        weather(430182, 'all').then(res => {
          if (res.status === '1') {
            res.forecasts[0].casts.forEach(item => {
              let date = new Date(item.date.replace(/-/g, '/'))
              let week = this.formatWeek(item.week)
              let tmp = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${week}`
              let day = `白天 ${item.dayweather} ${item.daytemp}℃ ${item.daywind}风 ${item.daypower}级`
              let night = `晚上 ${item.nightweather} ${item.nighttemp}℃ ${item.nightwind}风 ${item.daypower}级`
              this.rollList.push({type: 'info', text: `${tmp}&emsp;${day}&emsp;${night}`})
            })
          }
        }, () => {
          setTimeout(loadWeather, 5000)
        })
      }
      loadWeather()
      this.weatherTimer = setInterval(loadWeather, 1000 * 60 * 60)

      /** 监测点数据 */
      let levels = [
        {name: '数据缺失', color: '#909399'},
        {name: '监测正常', color: '#409EFF'},
        {name: '黄色预警', color: '#f4e925'},
        {name: '橙色预警', color: '#E6A23C'},
        {name: '红色预警', color: '#F56C6C'}
      ]
      let getPointList = (index) => {
        if (!index) {
          index = 0
          this.infoModel.warn = 0
        }
        index++
        getPointPage(true, null, 0, null, index, 100).then(res => {
          if (res.data.count > 0) {
            if (index === 1) {
              this.pointList = []
            }
            this.pointList = this.pointList.concat(res.data.data)
            getPointList(index)
          } else {
            let dataList = []
            let typeList = []
            this.pointList.sort((a, b) => {
              return a.name - b.name
            })
            this.pointList.forEach(item => {
              // if (item.level > 0) {
              //   this.infoModel.warn++
              // }
              // if (!dataList[item.level - 1]) {
              //   dataList[item.level - 1] = []
              // }
              // dataList[item.level - 1].push({
              //   name: item.name,
              //   value: [item.lng, item.lat, item.id]
              // })
              // if (!typeList[item.typeId - 1]) {
              //   typeList[item.typeId - 1] = {value: 1, name: item.typeName}
              // } else {
              //   typeList[item.typeId - 1].value = typeList[item.typeId - 1].value + 1
              // }
              this.infoModel.warn++
              if (!dataList[item.level]) {
                dataList[item.level] = []
              }
              dataList[item.level].push({
                name: item.address,
                value: [item.lng, item.lat, item.id]
              })
              if (!typeList[item.typeId]) {
                typeList[item.typeId] = {value: 1, name: item.typeName}
              } else {
                typeList[item.typeId].value = typeList[item.typeId].value + 1
              }
            })
            if (dataList[5]) {
              this.infoModel.red = dataList[5].length
            }
            if (dataList[4]) {
              this.infoModel.orange = dataList[4].length
            }
            this.infoModel.point = this.pointList.length
            let top = true
            let mapSeries = []
            let warnSeriesData = []
            let symbol = 6
            for (let i = dataList.length - 1; i >= 0; i--) {
              let data = dataList[i]
              if (data) {
                warnSeriesData.push({value: data.length, name: levels[i].name, type: i + 1, itemStyle: {color: levels[i].color}})
                if (top) {
                  top = false
                  mapSeries.push({
                    name: levels[i].name,
                    type: 'effectScatter',
                    coordinateSystem: 'geo',
                    data: data,
                    symbolSize: 4 * symbol--,
                    showEffectOn: 'render',
                    rippleEffect: {
                      brushType: 'stroke'
                    },
                    hoverAnimation: true,
                    label: {
                      normal: {
                        formatter: '{b}',
                        position: 'right',
                        show: false
                      }
                    },
                    itemStyle: {
                      normal: {
                        color: levels[i].color,
                        shadowBlur: 10,
                        shadowColor: '#333'
                      }
                    },
                    zlevel: i + 1
                  })
                } else {
                  mapSeries.push({
                    name: levels[i].name,
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: data,
                    symbolSize: 4 * symbol--,
                    label: {
                      normal: {
                        formatter: '{b}',
                        position: 'right',
                        show: false
                      },
                      emphasis: {
                        show: true
                      }
                    },
                    itemStyle: {
                      normal: {
                        color: levels[i].color
                      }
                    },
                    zlevel: i + 1
                  })
                }
              }
            }
            this.$set(this.optionMap, 'series', mapSeries)
            this.$set(this.optionWarn.series[0], 'data', warnSeriesData)
            this.poiType = typeList
            this.$set(this.optionType.series[0], 'data', typeList)
          }
        })
      }
      getPointList(0)
      this.pointTimer = setInterval(getPointList, 1000 * 60 * 10)

      /** 设备在线数据 */
      let getOnlineList = () => {
        this.infoModel.online = 0
        this.infoModel.offline = 0
        getOnline().then(res => {
          if (res) {
            let name = []
            let online = []
            let offline = []
            let typeList = []
            res.forEach(item => {
              name.push(item.name)
              online.push(item.online + item.gnssonline)
              offline.push(item.offline)
              typeList.push({value: item.online + item.gnssonline + item.offline, name: item.name})
              this.infoModel.online += item.online + item.gnssonline
              this.infoModel.offline += item.offline
            })
            this.$set(this.optionDevice.xAxis, 'data', name)
            this.$set(this.optionDevice.series[0], 'data', online)
            this.$set(this.optionDevice.series[1], 'data', offline)
            this.devType = typeList
          }
        })
      }
      getOnlineList()
      this.onlineTimer = setInterval(getOnlineList, 1000 * 60 * 30)

      /** 监测数据 */
      let getCountInfo = () => {
        getCount(this.index).then(res => {
          this.infoModel.total = res.total
          this.infoModel.today = res.total_today
        })
      }
      getCountInfo()
      this.countIimer = setInterval(getCountInfo, 10000)
    },
    _showData () {
      let formatNow = () => {
        let date = new Date()
        this.now = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes()}&emsp;${this.formatWeek(date.getDay())}`
      }
      formatNow()
      this.dateTimer = setInterval(formatNow, 1000)

      let running = () => {
        this.notice = null
        setTimeout(() => {
          let data = this.rollList.shift()
          this.notice = data
          this.rollList.push(data)

          let point = this.pointList.shift()
          this.pointList.push(point)
        }, 300)
      }
      running()
      this.rollTimer = setInterval(running, 5000)

      this.switchTimer = setInterval(() => {
        this.showType = !this.showType
        this.$set(this.optionType.series[0], 'data', this.showType ? this.poiType : this.devType)
      }, 10000)
    },
    _clearData () {
      clearInterval(this.weatherTimer)
      clearInterval(this.pointTimer)
      clearInterval(this.onlineTimer)
      clearInterval(this.countIimer)
      clearInterval(this.dateTimer)
      clearInterval(this.rollTimer)
      clearInterval(this.switchTimer)
    },
    _initJson () {
      getNxJson().then(res => {
        echarts.registerMap('nx', res)
        this.optionMap = {
          tooltip: {
            trigger: 'item',
            formatter: '{a}<br/>{b}'
          },
          geo: {
            map: 'nx',
            label: {
              emphasis: {
                show: true,
                color: '#3685FE',
                fontSize: 14
              }
            },
            roam: true,
            itemStyle: {
              normal: {
                areaColor: '#323c48',
                borderColor: '#111'
              },
              emphasis: {
                areaColor: '#2a333d'
              }
            },
            zoom: 1.2
          },
          series: []
        }
        this.drawChart()
        setTimeout(() => {
          this._initData()
          this._showData()
        }, 1000)
      })
    }
  },
  components: {
    Chart,
    Block,
    Arrow,
    MapInfo
  }
}
</script>

<style scoped lang="stylus">
$borderSize = 1px
$red = #F56C6C
$orange = #E6A23C
$yellow = #f4e925
$blue = #409EFF
$green = #67C23A
$gray = #909399

.cockpit-container
  position fixed
  left 0
  top 0
  right 0
  bottom 0
  background #040f25
  .map-bg
    position absolute
    width 100%
    z-index -1
  .header
    display flex
    padding 0 10px
    width 100%
    z-index 100
    .earth
      display inline-block
      margin 5px
      width 50px
      height 50px
      opacity 0
      transition opacity 2s
      &.show
        opacity 1
    .title
      line-height 60px
      font-size 25px
      letter-spacing 2px
      color #327CC8
    .message
      display flex
      flex-grow 1
      padding 15px
      height 60px
      text-align center
      .text-wrapper
        width 100%
        height 100%
        overflow hidden
        .text
          line-height 30px
          color #3685FE
    .time
      line-height 60px
      font-size 15px
      color #327CC8
    .shutdown
      margin 0 10px
      line-height 55px
      font-size 24px
      color #3685FE
      cursor pointer
      &:hover
        color #c3d9ff
  .content
    display flex
    margin-top -10px
    padding 0 5px
    height calc(100vh - 60px)
    .left
      flex 3
      padding 0px 5px
    .center
      flex 6
      padding 0px 5px
      .head
        .svg-icon
          margin-top 5px
          padding 5px
          width 30px
          height 30px
          color white
          background #327CC8
          border-radius 50%
        .label
          position absolute
          top 0
          margin-left 5px
      .level
        position absolute
        top 0
    .right
      flex 4
      padding 0px 5px
      .count
        padding 0px 10px 0
        display flex
        align-items center
        .outside
          flex 1
          padding 0 20px
          .inside
            position relative
            height 60px
            font-size 22px
            font-weight bold
            line-height 60px
            text-align center
            color #49c7d9
            box-shadow inset 0 0 1px #077ccb
            .title
              position absolute
              left 0
              top 0
              margin-top -20px
              line-height 14px
              font-size 14px
              color #3685FE
            .corner
              position absolute
              width 10px
              height 10px
              &.left-top
                top 0
                border-left $borderSize solid #49c7d9 !important
                border-top $borderSize solid #49c7d9 !important
              &.right-top
                top 0
                right 0
                border-top $borderSize solid #49c7d9 !important
                border-right $borderSize solid #49c7d9 !important
              &.right-bottom
                right 0
                bottom 0
                border-right $borderSize solid #49c7d9 !important
                border-bottom $borderSize solid #49c7d9 !important
              &.left-bottom
                bottom 0
                border-left $borderSize solid #49c7d9 !important
                border-bottom $borderSize solid #49c7d9 !important
      .level
        .row
          display table
          width 100%
          height 50px
          &:last-child
            height 100px
            .col
              color #49c7d9
              font-size 14px
              font-weight normal
              border-bottom none
          .col
            display table-cell
            width 20%
            text-align center
            vertical-align middle
            color #3685FE
            font-size 14px
            font-weight bold
            border-right 1px solid #077ccb
            border-bottom 1px solid #077ccb
            &:last-child
              border-right none
          .level-1
            color $green
          .level-2
            color $blue
          .level-3
            color $yellow
          .level-4
            color $orange
          .level-5
            color $red
      .point
        .row
          padding-left 20%
          line-height 30px
          cursor pointer
          &:hover
            font-size 18px
            background rgba(7, 124, 203, 0.2)
          &.level-0
            color $gray
          &.level-1
            color $blue
          &.level-2
            color $yellow
          &.level-3
            color $orange
          &.level-4
            color $red
.block
  margin 10px 0
  .head
    padding-left 10px
    font-size 20px
    font-family KaiTi
    font-weight bold
    line-height 40px
    color #327CC8
    cursor pointer
    z-index 1
    &:hover
      color #3685FE
  .info
    margin-bottom 5px
    text-align center
    color #3685FE
    font-size 14px
    font-weight bold
    .number
      margin 0 5px
      font-size 20px
      color #E6A23C
  .body
    position absolute
    top 40px
    bottom 0
    width 100%
  .arrow
    position absolute
    top 10px
    right 10px

.map-wrapper
  position absolute
  top 0
  width 100vw
  height 100vh
  z-index 1000
</style>
