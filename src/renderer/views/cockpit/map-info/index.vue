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
    <div class="dialog-box" :class="{'detail': detail}" v-if="resultVisible">
      <div class="photo"><img src="static/images/demo.jpg"></div>
      <div class="close" @click="resultVisible = false"><i class="el-icon-close"></i></div>
      <div class="fly-to"><svg-icon icon-class="airplane"></svg-icon></div>
      <div class="content">
        <p class="name">{{result.name}}</p>
        <p class="address">{{result.address}}</p>
        <p class="remark" @mouseenter="detail = true" @mouseleave="detail = false">{{result.summary}}</p>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet'
import BaseMap from '@/components/base-map'
import {debounce} from '@/common/utils'
import { getPointPage } from '@/api/datum'
import {geocode, weather, place, around} from '@/api/amap'

export default {
  props: {
    point: {
      type: Object
    }
  },
  data () {
    return {
      map: {},
      center: [this.point.lat, this.point.lng],
      zoom: 12,
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
      result: this.point,
      marker: null, // 标记点
      resultVisible: false,
      detail: false // 是否展开详情
    }
  },
  mounted () {
    this.getAddress()
  },
  methods: {
    clickResult (data) {
      if (data.level > -1) {
        this.result = data
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
      this.marker = L.marker([result.lat, result.lng], {icon: icon, riseOnHover: true, title: result.name}).addTo(this.map)
      this.marker.on('click', () => {
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
  cursor resulter
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
    cursor resulter
    &:hover
      color $back-color
.result-box
  position absolute
  top 40px
  width 240px
  height calc(100vh - 58px)
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
  transform translateX(-200px)

.fade-result-leave-to
  opacity 0
  transform translateX(-200px)
</style>