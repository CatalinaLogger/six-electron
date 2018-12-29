<template>
  <div id="app">
    <keep-alive :include="cachedViews">
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<script>
  export default {
    name: 'six-electron',
    data () {
      return {
        cachedViews: ['cockpit']
      }
    }
  }
</script>

<style>
  /* CSS */
</style>
