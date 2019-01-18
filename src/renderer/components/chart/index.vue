<template>
  <div class="chart"/>
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
        // 处理点击事件
        let self = this
        this.chart.on('click', function (params) {
          self.$emit('click', params)
        })
      }
      try {
        // 使用配置项和数据显示图表。
        this.option.color = ['#F56C6C', '#E6A23C', '#f4e925', '#409EFF', '#67C23A']
        this.chart.setOption(this.option)
      } catch (e) {
        try {
          this.chart.clear()
        } catch (e) {
        }
      }
    }
  },
  watch: {
    option: {
      handler: function (val) {
        if (val) {
          this._drawChart()
        }
      },
      deep: true
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
.chart
  width 100%
  height 100%
</style>