<template>
  <div class="base-map" id="map">
    <slot></slot>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import marker from 'leaflet/dist/images/marker-icon.png'
import marker2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

export default {
  props: {
    center: {
      type: Array,
      default: () => {
        return [28.224096, 112.988719]
      }
    },
    zoom: {
      type: Number,
      default: 12
    }
  },
  computed: {
    opened () {
      return this.$store.state.app.sidebar.opened
    }
  },
  model: {
    prop: 'map',
    event: 'sync'
  },
  mounted () {
    this._fixImageUrl()
    this._loadMap()
  },
  methods: {
    _loadMap () {
      let layer = L.tileLayer('https://mt{s}.google.cn/maps/vt?lyrs=y&hl=zh-CN&gl=CN&&x={x}&y={y}&z={z}&scale=1', {
        subdomains: '012',
        minZoom: 3,
        maxZoom: 18
      })
      let maxBounds = L.latLngBounds(L.latLng(90, 180), L.latLng(-90, -180)) // 构建视图限制范围
      setTimeout(() => {
        this.map = L.map('map', {maxBounds: maxBounds}).setView(this.center, this.zoom)
        this.map.addLayer(layer)
        this.$emit('sync', this.map)
        this.$emit('ready')
      }, 10)
    },
    _reloadMap () {
      setTimeout(() => {
        this.map.invalidateSize(true)
        this.$emit('sync', this.map)
      }, 10)
    },
    /** 解决地图自带图标加载问题 */
    _fixImageUrl () {
      // https://github.com/PaulLeCam/react-leaflet/issues/255#issuecomment-261904061
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: marker2x,
        iconUrl: marker,
        shadowUrl: markerShadow
      })
    }
  },
  watch: {
    opened () {
      setTimeout(() => {
        this._reloadMap()
      }, 290)
    }
  }
}
</script>

<style scoped lang="stylus">
.base-map
  width 100%
  height 100%
  background #eee
  cursor default
  overflow hidden
</style>