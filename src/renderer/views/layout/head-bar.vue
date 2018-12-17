<template>
  <div class="head-bar" style="-webkit-app-region: drag">
    <div @click="toggleSideBar" class="collapse" style="-webkit-app-region: no-drag">
      <svg-icon icon-class="collapse" :class="{'icon-opened': sidebar.opened}"></svg-icon>
    </div>
    <div class="tool-bar"></div>
    <div @click="hidden" style="-webkit-app-region: no-drag"><i class="el-icon-minus"></i></div>
    <div @click="change" style="-webkit-app-region: no-drag" class="change"><svg-icon :icon-class="max ? 'min' : 'max'"/></div>
    <div @click="closed" style="-webkit-app-region: no-drag" class="closed"><i class="el-icon-close"></i></div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      max: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar'
    ])
  },
  methods: {
    toggleSideBar () {
      this.$store.dispatch('toggleSideBar')
    },
    hidden () {
      let main = this.$electron.remote.getCurrentWindow()
      main.minimize()
    },
    change () {
      let main = this.$electron.remote.getCurrentWindow()
      if (this.max) {
        main.restore()
        this.max = false
      } else {
        main.maximize()
        this.max = true
      }
    },
    closed () {
      let main = this.$electron.remote.getCurrentWindow()
      main.destroy()
    }
  }
}
</script>

<style scoped lang="stylus">

</style>