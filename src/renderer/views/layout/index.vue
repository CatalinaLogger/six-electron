<template>
  <div class="app-window" :class="{'side-closed': !sidebar.opened}">
    <side-bar></side-bar>
    <div class="app-body">
      <head-bar></head-bar>
      <el-scrollbar class="app-main" wrap-class="scrollbar-wrapper">
        <transition name="fade" mode="out-in">
          <router-view></router-view>
        </transition>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import SideBar from './side-bar'
import HeadBar from './head-bar'

export default {
  computed: {
    sidebar () {
      return this.$store.state.app.sidebar
    }
  },
  mounted () {
    this._initWindow()
  },
  methods: {
    _initWindow () {
      let main = this.$electron.remote.getCurrentWindow()
      main.setSize(1020, 690)
      main.setMinimumSize(1020, 690)
      main.center()
    }
  },
  components: {
    SideBar,
    HeadBar
  }
}
</script>