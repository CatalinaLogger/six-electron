<template>
  <div class="chart-wrapper"/>
</template>

<script>
import echarts from 'echarts'
import {debounce} from '@/common/utils'
require('echarts/theme/macarons') // echarts theme

export default {
  props: {
    option: {
      type: Object,
      default: null
    }
  },
  data () {
    return {
      chart: null
    }
  },
  computed: {
    opened () {
      return this.$store.state.app.sidebar.opened
    }
  },
  mounted () {
    this.__resizeHandler = debounce(() => {
      if (this.chart) {
        this.chart.resize()
      }
    }, 200)
    window.addEventListener('resize', this.__resizeHandler)
  },
  methods: {
    _drawChart () {
      if (!this.chart) {
        this.chart = echarts.init(this.$el, 'macarons')
      }
      // 使用配置项和数据显示图表。
      this.chart.setOption(this.option)
      // 处理点击事件
      let self = this
      this.chart.on('click', function (params) {
        self.$emit('click', params)
      })
    }
  },
  watch: {
    option (val) {
      if (val) {
        this._drawChart()
      }
    },
    opened () {
      setTimeout(() => {
        this.chart.resize()
      }, 290)
    }
  }
}
</script>

<style scoped lang="stylus">
.chart-wrapper
  width 100%
  height 100%
</style>