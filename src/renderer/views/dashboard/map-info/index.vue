<template>
  <div class="map-info" :class="{'full-screen': full}">
    <base-map v-model="map" :center="center" :zoom="zoom" @ready="mapReady"></base-map>
    <div class="down-box" style="-webkit-app-region: no-drag" @click.stop="clickDown">
      <i class="el-icon-arrow-down"></i>
    </div>
    <div class="screen-box" @click="fullScreen">
      <svg-icon :icon-class="full? 'exit-screen': 'full-screen'"></svg-icon>
    </div>
    <div class="search-box" :class="{'collapse': collapse}" style="-webkit-app-region: no-drag">
      <div class="query">
        <input type="text" placeholder="搜索监测点、位置" v-model="query">
      </div>
      <div class="icon" @click="switchSearch"><i class="el-icon-search"></i></div>
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
    <div class="dialog-box" :class="{'detail': detail}" v-if="pointVisible">
      <div class="photo"><img src="static/img/demo.jpg"></div>
      <div class="close" @click="pointVisible = false"><i class="el-icon-close"></i></div>
      <div class="fly-to"><svg-icon icon-class="airplane"></svg-icon></div>
      <div class="content">
        <p class="name">岳麓区</p>
        <p class="address">望月湖小区9片15栋</p>
        <p class="remark" @mouseenter="detail = true" @mouseleave="detail = false">3路;26路/26路快;215路/215路快;308路;355路;903路;W107路;W116路;W168路;社区巴士10号线;高新园区穿梭巴士3号线3路;26路/26路快;
          215路/215路快;308路;355路;903路;W107路;W116路;W168路;社区巴士10号线;高新园区穿梭巴士3号线
          3路;26路/26路快;215路/215路快;308路;355路;903路;W107路;W116路;W168路;社区巴士10号线;高新园区穿梭巴士3号线
          3路;26路/26路快;215路/215路快;308路;355路;903路;W107路;W116路;W168路;社区巴士10号线;高新园区穿梭巴士3号线
          3路;26路/26路快;215路/215路快;308路;355路;903路;W107路;W116路;W168路;社区巴士10号线;高新园区穿梭巴士3号线
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import BaseMap from '@/components/base-map'
import {debounce} from '@/common/utils'
import {geocode, weather, place, around} from '@/api/amap'

export default {
  data () {
    return {
      map: {},
      center: [28.2, 112.9],
      zoom: 12,
      mouse: {lat: 0, lng: 0}, // 鼠标指正所在点经纬度
      full: false,
      pointList: [],
      address: {},
      weather: {},
      collapse: true, // 搜索栏是否折叠
      query: '', // 搜索条件
      queryPlace: debounce(() => {
        this.getPlace()
      }, 500),
      resultList: [], // 搜索结果
      marker: null, // 标记点
      pointVisible: false,
      detail: false // 是否展开详情
    }
  },
  mounted () {
    this.getAddress()
  },
  methods: {
    clickResult (data) {
      let location = data.location.split(',')
      this.renderMarker({lat: location[1], lng: location[0]})
      this.map.flyTo([location[1], location[0]], 18)
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
        this.generatePoint()
        this.pointList.forEach(point => {
          this.renderPoint(point)
        })
      }, 500)
    },
    /** 渲染监测点 */
    renderPoint (point) {
      let icon = L.icon({iconUrl: `static/svg/coast${point.level}.svg`, iconSize: [50, 50], iconAnchor: [25, 50]})
      let marker = L.marker([point.lat, point.lng], {icon: icon, riseOnHover: true, title: point.name}).addTo(this.map)
      marker.on('click', (event) => {
        this.pointVisible = true
      })
    },
    /** 渲染位置 */
    renderMarker (point) {
      if (this.marker) {
        this.marker.remove()
      }
      let icon = L.icon({iconUrl: `static/svg/point.svg`, iconSize: [50, 50], iconAnchor: [25, 50]})
      this.marker = L.marker([point.lat, point.lng], {icon: icon, riseOnHover: true}).addTo(this.map)
    },
    generatePoint () {
      this.pointList = []
      for (let i = 1; i < 100; i++) {
        this.pointList.push({id: i, name: `隐患点${i}`, level: i % 6, lat: 28.2 + i / 1000, lng: 112.9 + i / 100})
      }
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
    },
    switchSearch () {
      this.collapse = !this.collapse
    },
    clickDown () {
      this.$emit('close')
    },
    fullScreen () {
      this.full = !this.full
      setTimeout(() => {
        this.map.invalidateSize(true)
      }, 10)
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
    BaseMap
  }
}
</script>

<style scoped lang="stylus">
$box-bg = rgba(0, 0, 0, 0.5)
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
  height 20px
  font-size 20px
  text-align center
  z-index 1000
  color $color
  background $box-bg
  cursor pointer
  border-bottom-left-radius 50%
  border-bottom-right-radius 50%
  &:hover
    background $back-color
.screen-box
  position absolute
  top 0
  right 0
  width 50px
  height 50px
  z-index 1000
  color $color
  background $box-bg
  border-bottom-left-radius 100%
  &:hover
    background $back-color
  .svg-icon
    position absolute
    top 8px
    right 8px
    width 20px
    height 20px
.search-box
  position absolute
  left 0
  top 0
  display flex
  width 240px
  color $color
  z-index 1001
  transition transform .5s
  &.collapse
    transform translateX(-200px)
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
    cursor pointer
    &:hover
      color $back-color
.result-box
  position absolute
  top 40px
  width 240px
  height calc(100vh - 96px)
  color $color
  z-index 1000
  cursor pointer
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
  padding-bottom 20px
  top 50%
  right 5%
  width 260px
  height 369px
  background white
  overflow hidden
  z-index 10000
  cursor default
  transform translateY(-50%)
  &.detail
    .photo
      height 70px
    .content
      padding-top 90px
      .remark
        height 215px
  .photo
    width 100%
    height 160px
    overflow hidden
    transition all .5s
    img
      width 100%
  .close
    display inline-block
    position absolute
    top 0px
    right 0px
    font-size 30px
    color white
    z-index 1
    cursor pointer
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
    cursor pointer
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
  transform translateX(-200px)

.fade-result-leave-to
  opacity 0
  transform translateX(-200px)
</style>