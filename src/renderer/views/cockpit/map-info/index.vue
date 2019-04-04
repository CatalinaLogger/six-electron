<template>
  <div class="map-info" :class="{'full-screen': full}">
    <base-map v-model="map" :center="center" :zoom="zoom" @ready="mapReady"></base-map>
    <div class="down-box" style="-webkit-app-region: no-drag" @click.stop="clickDown">
      <i class="el-icon-arrow-down"></i>
    </div>
<!--
    <div class="screen-box" @click="fullScreen">
      <svg-icon :icon-class="full? 'exit-screen': 'full-screen'"></svg-icon>
    </div>
-->
    <div class="search-box" :class="{'collapse': collapse}" style="-webkit-app-region: no-drag">
      <div class="query">
        <input type="text" placeholder="搜索监测点、位置" v-model="query">
      </div>
      <div class="icon" @click="switchSearch"><i class="el-icon-search"></i></div>
    </div>
    <div class="sar-box" @click="inSarClick">
      <div class="sar-rule" v-if="showSar">
        <div class="color-bar" v-for="item in ruleSar">
          <div class="sample" :style="{'background': item.color}"></div>
          <div class="number">{{item.text}}</div>
        </div>
      </div>
      <svg-icon icon-class="sar"></svg-icon>
    </div>
    <transition name="fade-result" mode="out-in">
      <el-scrollbar class="result-box" wrap-class="scrollbar-wrapper" v-if="!collapse && resultList.length">
        <div class="item" v-for="(result, index) in resultList" :key="index" @click="clickResult(result)">
          <span>{{result.name}}</span><br>
          <span>{{result.address}}</span>
        </div>
      </el-scrollbar>
    </transition>
    <div class="weather-box" v-if="zoom > 10 && weather.city">
      <span>{{weather.province}}</span>
      <span>{{weather.city}}</span>
      <span>{{weather.weather}}</span>
      <span>{{weather.temperature}}℃</span>
      <span>{{weather.winddirection}}</span>
      <span>{{weather.windpower}}级</span>
      <span>{{weather.humidity}}%RH</span>
    </div>
    <div class="mouse-box">
      <span>{{mouse.lat}}</span>
      <span>{{mouse.lng}}</span>
    </div>
    <transition name="fade-dialog" mode="out-in">
    <div class="dialog-box" :class="{'detail': detail}" v-if="resultVisible">
      <div class="close" @click="closeDialog"><i class="el-icon-close"></i></div>
      <div class="info-wrapper">
        <div class="box">
          <div class="name">{{result.name}}</div>
          <div>{{result.address}}</div>
        </div>
        <div class="box">
          <div>坐标</div>
          <div>[ {{result.lat.toFixed(6)}}, {{result.lng.toFixed(6)}} ]</div>
        </div>
      </div>
      <el-tabs class="six-tabs" v-model="chartTab">
        <el-tab-pane label="历史预警统计" name="line">
          <div class="chart"><chart :option="optionLine"></chart></div>
        </el-tab-pane>
        <el-tab-pane label="监测点现场" name="photo">
          <photo :point="result" v-if="chartTab === 'photo'"></photo>
        </el-tab-pane>
        <el-tab-pane v-if="labelTime" :label="labelTime" name="time">
          <div class="chart"><chart :option="optionTime"></chart></div>
        </el-tab-pane>
      </el-tabs>
      <el-tabs class="six-tabs" v-model="deviceTab">
        <el-tab-pane label="实时数据监测" name="data">
          <el-scrollbar class="detail-container" wrap-class="scrollbar-wrapper">
            <div class="device-wrapper">
              <div class="device-item" v-for="dev in deviceList" v-if="dev.data && dev.Type !== 12 && dev.Type !== 13 && showDevice(dev)">
                <div class="device-name">{{dev.Name}}</div>
                <div class="device-attr" v-for="sen in dev.Sensors" v-if="sen.ColName && typeof dev.data[sen.ColName] === 'number'">
                  <span>{{sen.Name}}</span>
                  <span class="data" @click="handleData(sen, dev.Mac, dev.Name)">{{Math.round(dev.data[sen.ColName] * 1000000) / 1000000}}</span>
                  <span>{{sen.Unit}}</span>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </el-tab-pane>
        <el-tab-pane label="现场调查情况" name="info">
          <div class="info-wrapper">
            <div class="item" v-if="pointInfo.c4"><div class="attr">地形</div>{{pointInfo.c4}}</div>
            <div class="item" v-if="pointInfo.c5"><div class="attr">坡度</div>{{pointInfo.c5}}</div>
            <div class="item" v-if="pointInfo.c6"><div class="attr">坡高</div>{{pointInfo.c6}}</div>
            <div class="item" v-if="pointInfo.c7"><div class="attr">岩性</div>{{pointInfo.c7}}</div>
            <div class="item" v-if="pointInfo.c8"><div class="attr">厚度</div>{{pointInfo.c8}}</div>
            <div class="item" v-if="pointInfo.c9"><div class="attr">规模</div>{{pointInfo.c9}}</div>
            <div class="item" v-if="pointInfo.c10"><div class="attr">土壤含水</div>{{pointInfo.c10}}</div>
            <div class="item" v-if="pointInfo.c11"><div class="attr">周边水系</div>{{pointInfo.c11}}</div>
            <div class="item" v-if="pointInfo.c12"><div class="attr">房屋建筑</div>{{pointInfo.c12}}</div>
            <div class="item" v-if="pointInfo.c13"><div class="attr">人类活动强度</div>{{pointInfo.c13}}</div>
            <div class="item" v-if="pointInfo.c14"><div class="attr">地质因素</div>{{pointInfo.c14}}</div>
            <div class="item" v-if="pointInfo.c15"><div class="attr">物理因素</div>{{pointInfo.c15}}</div>
            <div class="item" v-if="pointInfo.c16"><div class="attr">人为因素</div>{{pointInfo.c16}}</div>
            <div class="item" v-if="pointInfo.c17"><div class="attr">滑坡方向</div>{{pointInfo.c17}}</div>
            <div class="item" v-if="pointInfo.c18"><div class="attr">现场方向</div>{{pointInfo.c18}}</div>
            <div class="item" v-if="pointInfo.s5"><div class="attr">塌陷时间</div>{{pointInfo.s5}}</div>
            <div class="item" v-if="pointInfo.s6"><div class="attr">直径</div>{{pointInfo.s6}}</div>
            <div class="item" v-if="pointInfo.s7"><div class="attr">深度</div>{{pointInfo.s7}}</div>
            <div class="item" v-if="pointInfo.s8"><div class="attr">影响范围</div>{{pointInfo.s8}}</div>
            <div class="item" v-if="pointInfo.s9"><div class="attr">周边水系</div>{{pointInfo.s9}}</div>
            <div class="item" v-if="pointInfo.s10"><div class="attr">备注</div>{{pointInfo.s10}}</div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="预警广播推送" name="warn" v-if="deviceSend">
          <div class="send-message">
            <textarea v-model="message" placeholder="请输入广播内容"/>
            <el-button type="primary" @click="sendClick">点击发送</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    </transition>
  </div>
</template>

<script>
import L from 'leaflet'
import Photo from './photo'
import Chart from '@/components/chart'
import BaseMap from '@/components/base-map'
import wgsToGcj from '@/common/utils/location'
import {debounce} from '@/common/utils'
import { mapGetters } from 'vuex'
import { getDevice, getDeviceData, sendMessage, getSarJson } from '@/api/cockpit'
import { geocode, weather, place, around } from '@/api/amap'
import { getPointPage, getPoint, getPointLevelList } from '@/api/datum'
let factory = require('./markers')
L.CanvasIconLayer = factory(L)

export default {
  props: {
    point: {
      type: Object
    }
  },
  data () {
    return {
      baseUrl: process.env.BASE_API,
      map: {},
      center: [],
      zoom: 17,
      mouse: {lat: 0, lng: 0}, // 鼠标指正所在点经纬度
      full: false,
      address: {},
      weather: {},
      collapse: true, // 搜索栏是否折叠
      query: '', // 搜索条件
      queryPlace: debounce(() => {
        this.getPlace()
      }, 500),
      resultList: [], // 搜索结果
      result: null,
      marker: null, // 标记点
      resultVisible: false,
      detail: false, // 是否展开详情
      picker: [],
      chartTab: 'line',
      deviceTab: 'data',
      optionLine: null,
      optionTime: null,
      labelTime: null,
      deviceList: [],
      deviceSend: null,
      message: '',
      intervalData: null,
      intervalTime: null,
      warnLevel: ['蓝色预警：正常', '黄色预警：加强观察、观测', '橙色预警：暂停活动，排除险情恢复', '红色预警：全部撤离，并警戒'],
      pointInfo: {},
      showSar: false,
      layerSar: null,
      ruleSar: []
    }
  },
  computed: {
    ...mapGetters([
      'roles'
    ])
  },
  mounted () {
    let lonLat = wgsToGcj(this.point.lng, this.point.lat)
    this.result = this.point
    this.result.lng = lonLat[0]
    this.result.lat = lonLat[1]
    this.center = [lonLat[1], lonLat[0]]
    this.getAddress()
  },
  methods: {
    clickResult (data) {
      if (data.level > -1) {
        let lonLat = wgsToGcj(data.lng, data.lat)
        this.result = data
        this.result.lng = lonLat[0]
        this.result.lat = lonLat[1]
        this.closeDialog()
        this.renderPoint(this.result)
        this.map.flyTo([this.result.lat, this.result.lng], 18)
      } else {
        let location = data.location.split(',')
        this.renderMarker({lat: location[1], lng: location[0]})
        this.map.flyTo([location[1], location[0]], 18)
      }
    },
    mapReady () {
      let loadData = debounce(() => {
        this.getAddress()
      }, 2000)
      this.map.on('moveend', () => {
        let center = this.map.getCenter()
        this.center = [center.lat, center.lng]
        this.zoom = this.map.getZoom()
        loadData()
      })
      this.map.on('mousemove', (event) => {
        this.mouse.lat = event.latlng.lat
        this.mouse.lng = event.latlng.lng
      })
      setTimeout(() => {
        this.renderPoint(this.result)
      }, 500)
    },
    /** 渲染监测点 */
    renderPoint (result) {
      if (this.marker) {
        this.marker.remove()
      }
      let icon = L.icon({iconUrl: `static/svg/coast${result.level}.svg`, iconSize: [50, 50], iconAnchor: [25, 50]})
      this.marker = L.marker([this.result.lat, this.result.lng], {icon: icon, riseOnHover: true, title: result.address}).addTo(this.map)
      // let tooltip = L.tooltip({direction: 'bottom', permanent: true, offset: L.point(0, 0)}).setContent(result.address)
      // this.marker.bindTooltip(tooltip).openTooltip()
      this.marker.on('click', () => {
        this._getPointLevelList()
        this._getDevice()
        this._getPointInfo()
        this.resultVisible = true
      })
    },
    /** 渲染位置 */
    renderMarker (result) {
      if (this.marker) {
        this.marker.remove()
      }
      let icon = L.icon({iconUrl: `static/svg/point.svg`, iconSize: [50, 50], iconAnchor: [25, 50]})
      this.marker = L.marker([result.lat, result.lng], {icon: icon, riseOnHover: true}).addTo(this.map)
    },
    /** 获取地图中心点数据 */
    getAddress () {
      geocode(this.center[1], this.center[0]).then(res => {
        if (res.status === '1') {
          this.address = res.regeocode.addressComponent
          this.getWeather()
        }
      })
    },
    /** 获取地图中心点天气 */
    getWeather () {
      weather(this.address.adcode, 'base').then(res => {
        if (res.status === '1') {
          this.weather = res.lives[0]
        } else {
          this.weather = {}
        }
      })
    },
    /** 关键字搜索 */
    getPlace () {
      this.resultList = []
      getPointPage(true, null, 0, this.query, 1, 5).then(res => {
        this.resultList = this.resultList.concat(res.data.data)
        around(this.query, `${this.center[1].toFixed(6)},${this.center[0].toFixed(6)}`).then(res => {
          if (res.status === '1') {
            this.resultList = this.resultList.concat(res.pois)
          }
        })
        place(this.query, `${this.address.city}/${this.address.citycode}/${this.address.adcode}`).then(res => {
          if (res.status === '1') {
            this.resultList = this.resultList.concat(res.pois)
          }
        })
      })
    },
    lookDevice () {
      let size = this.roles.filter(item => {
        return item.id < 4
      }).length
      if (size > 0) {
        return true
      }
      return false
    },
    showDevice (dev) {
      let size = 0
      if (dev.Sensors) {
        dev.Sensors.forEach(sen => {
          if (sen.ColName && typeof dev.data[sen.ColName] === 'number') {
            size++
          }
        })
      }
      return size
    },
    closeDialog () {
      if (this.intervalData) {
        clearInterval(this.intervalData)
      }
      if (this.intervalTime) {
        clearInterval(this.intervalTime)
      }
      this.chartTab = 'line'
      this.labelTime = null
      this.message = ''
      this.resultVisible = false
    },
    drawLine (xData, yData) {
      this.optionLine = {
        tooltip: {
          trigger: 'axis',
          formatter: '{b}'
        },
        xAxis: {
          boundaryGap: false,
          data: xData
        },
        yAxis: {
          show: false,
          min: 1,
          splitLine: {
            show: false
          }
        },
        grid: {
          left: '2%',
          right: '2%',
          bottom: '14%',
          top: '3%',
          containLabel: true
        },
        dataZoom: [{
          startValue: '01-02'
        }, {
          type: 'inside'
        }],
        visualMap: {
          show: false,
          top: 0,
          right: 10,
          orient: 'horizontal',
          pieces: [{
            gt: 0.5,
            lte: 1.5,
            color: '#409EFF'
          }, {
            gt: 1.5,
            lte: 2.5,
            color: '#FFFF00'
          }, {
            gt: 2.5,
            lte: 3.5,
            color: '#E6A23C'
          }, {
            gt: 3.5,
            lte: 4.5,
            color: '#F56C6C'
          }]
        },
        series: {
          name: name,
          type: 'line',
          symbolSize: 10,
          lineStyle: {
            width: 3
          },
          data: yData
        }
      }
    },
    drawTime (xData, yData, name, unit) {
      this.optionTime = {
        title: {
          text: `${name} (${unit})`,
          textStyle: {
            fontSize: 14,
            color: '#409EFF'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#409EFF'
            }
          },
          data: xData
        },
        yAxis: {
          type: 'value',
          boundaryGap: false,
          splitLine: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: '#409EFF'
            }
          }
        },
        grid: {
          left: '2%',
          right: '2%',
          bottom: '0%',
          top: '10%',
          containLabel: true
        },
        series: [{
          type: 'line',
          smooth: true,
          showSymbol: false,
          lineStyle: {
            width: 3,
            color: '#f4e925'
          },
          data: yData
        }]
      }
    },
    sendClick () {
      sendMessage(this.message, this.deviceSend).then(() => {
        this.$message({
          message: '预警广播已成功推送',
          type: 'success'
        })
      })
    },
    _getPointLevelList () {
      let self = this
      function loadLevelList (pointId, start, end, index, xData, yData) {
        index++
        getPointLevelList(pointId, start, end, index).then(res => {
          if (res.data.length > 0) {
            xData = xData.concat(res.data.map(item => {
              return item.time
            }))
            yData = yData.concat(res.data.map(item => {
              return item.level
            }))
            loadLevelList(pointId, start, end, index, xData, yData)
          } else {
            self.drawLine(xData, yData)
          }
        })
      }
      loadLevelList(this.result.id, this.picker[0], this.picker[1], 0, [], [])
    },
    _getPointInfo () {
      getPoint(this.result.id).then(res => {
        if (res.data.jsonInfo) {
          this.pointInfo = JSON.parse(res.data.jsonInfo)
        } else {
          this.pointInfo = {}
        }
      })
    },
    _getDevice () {
      if (this.intervalData) {
        clearInterval(this.intervalData)
      }
      getDevice(this.result.id).then(res => {
        this.deviceList = res
        let loadData = () => {
          for (let key in this.deviceList) {
            if (this.deviceList[key].Type === 12) {
              this.deviceSend = this.deviceList[key].Name
            }
            getDeviceData(this.deviceList[key].Mac, 1).then(res => {
              if (res) {
                this.$set(this.deviceList[key], 'data', res[0])
              } else {
                this.$set(this.deviceList[key], 'data', null)
              }
            })
          }
        }
        loadData()
        this.intervalData = setInterval(loadData, 1000 * 60)
      })
    },
    handleData (sen, mac, name) {
      this.chartTab = 'time'
      this.labelTime = name
      if (this.intervalTime) {
        clearInterval(this.intervalTime)
      }
      getDeviceData(mac, 30).then(res => {
        if (res) {
          let XData = res.map(item => {
            return item.gps_time
          })
          let yData = res.map(item => {
            return item[sen.ColName]
          })
          this.drawTime(XData, yData, sen.Name, sen.Unit)
          this.intervalTime = setInterval(() => {
            getDeviceData(mac, 1).then(res => {
              let lastTime = this.optionTime.xAxis.data[this.optionTime.xAxis.data.length - 1]
              if (res && lastTime !== res[0].gps_time) {
                this.optionTime.xAxis.data.shift()
                this.optionTime.xAxis.data.push(res[0].gps_time)
                this.optionTime.series[0].data.shift()
                this.optionTime.series[0].data.push(res[0][sen.ColName])
              }
            })
          }, 1000)
        }
      })
    },
    switchSearch () {
      this.collapse = !this.collapse
    },
    clickDown () {
      this.closeDialog()
      this.$emit('close')
    },
    fullScreen () {
      this.full = !this.full
      setTimeout(() => {
        this.map.invalidateSize(true)
      }, 10)
    },
    inSarClick () {
      if (this.showSar) {
        this._hiddenInSar()
      } else {
        this._renderInSar()
      }
    },
    _renderInSar () {
      this.showSar = true
      if (this.layerSar) {
        this.layerSar.onAdd(this.map)
      } else {
        getSarJson().then(res => {
          /** 渲染inSar数据 */
          let ciLayer = L.canvasIconLayer({}).addTo(this.map)
          var markers = []
          res.forEach(item => {
            this.ruleSar.push({color: `#${item.color}`, text: `${item.min_mean_velocity} ~ ${item.max_mean_velocity}`})
            let icon = L.icon({
              iconUrl: `${this.baseUrl}/datum/image?color=${item.color}`,
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
            // const color = item.color
            item.points.forEach(item => {
              var marker = L.marker(item, {icon: icon, id: item.id})
              markers.push(marker)
            })
          })
          ciLayer.addLayers(markers)
          this.layerSar = ciLayer
        })
      }
    },
    _hiddenInSar () {
      this.showSar = false
      if (this.layerSar) {
        this.layerSar.onRemove(this.map)
      }
    }
  },
  watch: {
    query (val) {
      if (val) {
        this.queryPlace()
      } else {
        this.resultList = []
        if (this.marker) {
          this.marker.remove()
        }
      }
    }
  },
  components: {
    Photo,
    Chart,
    BaseMap
  }
}
</script>

<style scoped lang="stylus">
$box-bg = rgba(0, 0, 0, 0.7)
$color = white
$back-color = #409eff

.full-screen
  position fixed !important
  width 100vw
  height 100vh
.down-box
  position absolute
  left 0
  top 0
  right 0
  margin auto
  width 100px
  height 30px
  font-size 30px
  text-align center
  z-index 1000
  color $color
  background $box-bg
  cursor resulter
  border-bottom-left-radius 50%
  border-bottom-right-radius 50%
  &:hover
    background $back-color
.sar-box
  position absolute
  right 0
  bottom 16px
  width 50px
  height 50px
  z-index 1000
  color $color
  background $box-bg
  border-top-left-radius 100%
  &:hover
    background $back-color
  .sar-rule
    position absolute
    top -400px
    left -150px
    width 200px
    height 450px
    background $box-bg
    .color-bar
      display flex
      .sample
        width 40px
        background green
      .number
        flex-grow 1
        text-align center
  .svg-icon
    position absolute
    right 8px
    bottom 8px
    width 20px
    height 20px
.search-box
  position absolute
  left 0
  top 0
  display flex
  width 20vw
  color $color
  z-index 1001
  transition transform .5s
  &.collapse
    transform translateX(-17vw)
    .icon
      border-top-right-radius 50%
      border-bottom-right-radius 50%
  .query
    flex-grow 1
    input
      padding 0 10px
      width 100%
      height 40px
      font-size 14px
      caret-color $color
      color $color
      background $box-bg
      border none
      outline none
      box-shadow none
    input::-webkit-input-placeholder
      color $color
      font-size 12px
  .icon
    width 40px
    text-align center
    font-size 20px
    line-height 40px
    background $box-bg
    cursor resulter
    &:hover
      color $back-color
.result-box
  position absolute
  top 40px
  width 20vw
  height calc(100vh - 58px)
  color $color
  z-index 1000
  opacity 1
  transition all .5s
  .item
    margin 1px 0
    padding 14px 10px
    font-size 12px
    background $box-bg
    &:hover
      color $back-color
.weather-box
  position absolute
  bottom 0
  right 0
  font-size 14px
  color $color
  background $box-bg
  z-index 1000
.mouse-box
  position absolute
  left 0
  bottom 0
  font-size 14px
  color $color
  background $box-bg
  z-index 1000
.dialog-box
  position absolute
  top 0
  right 0
  width 45vw
  height 100vh
  background $box-bg
  color white
  overflow hidden
  z-index 10000
  .info-wrapper
    display flex
    text-align center
    .box
      flex 1
      .name
        font-size 16px
        font-weight bold
        color #409eff
      div
        height 30px
        line-height 30px
        font-size 14px
  .detail-container
    height calc(62vh - 160px)
    .device-wrapper
      display flex
      flex-wrap wrap
      text-align center
      .device-item
        padding-bottom 10px
        width 15vw
        color #409eff
        .device-name
          margin-bottom 10px
          font-size 14px
          font-weight bold
          color white
        .device-attr
          font-size 12px
          line-height 18px
          .data
            font-size 16px
            font-weight bold
            color #f4e925
            cursor pointer
            &:active
              font-size 14px
  .info-wrapper
    display flex
    flex-wrap wrap
    .item
      padding 0 10px
      width 15vw
      font-size 16px
      font-weight bold
      color #f4e925
      line-height 18px
      text-align left
      word-break break-word
      .attr
        float left
        font-size 12px
        color #409eff
  .send-message
    height calc(62vh - 160px)
    padding 10px 20px 20px
    textarea
      display block
      width 100%
      height 100%
      resize none
      font-size 14px
      caret-color $color
      color $color
      border 1px solid #409eff
      border-radius 5px
      outline none
      box-shadow none
      background rgba(0, 0, 0, 0)
      &::-webkit-scrollbar/*滚动条整体样式*/
        width 0px     /*高宽分别对应横竖滚动条的尺寸*/
        height 0px
      &::-webkit-input-placeholder
        color #409eff
        font-size 14px
    .el-button
      float right
      margin -37px 5px 0px 0px
  .photo
  .chart
      height 38vh
  .close
    display inline-block
    position absolute
    top 0px
    right 0px
    font-size 30px
    color white
    z-index 1
    cursor resulter
    &:hover
      color #409eff
  .fly-to
    display inline-block
    position absolute
    right 30px
    margin-top -60px
    color #409eff
    background white
    border-radius 50%
    box-shadow 0 0 20px gray
    cursor resulter
    &:hover
      color white
      background #409eff
    .svg-icon
      margin 15px 15px 10px 10px
      width 50px
      height 50px
  .content
    position absolute
    top 0
    padding-top 180px
    width 100%
    height 100%
    background white
    z-index -1
    transition all .5s
    p
      margin 5px 10px
    .name
      font-weight bold
    .address
      font-size 14px
    .remark
      display block
      margin 10px
      height 125px
      overflow hidden
      transition all .5s

/*fade-result*/
.fade-result-leave-active,
.fade-result-enter-active
  transition all .5s

.fade-result-enter
  opacity 0
  transform translateX(-20vw)

.fade-result-leave-to
  opacity 0
  transform translateX(-20vw)

/*fade-dialog*/
.fade-dialog-leave-active,
.fade-dialog-enter-active
  transition all .5s

.fade-dialog-enter
  opacity 0
  transform translateX(45vw)

.fade-dialog-leave-to
  opacity 0
  transform translateX(45vw)
</style>