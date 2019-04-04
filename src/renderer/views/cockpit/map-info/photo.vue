<template>
  <div class="photo" ref="photo">
    <vue-waterfall-easy :maxCols="3" :imgsArr="imgArr" :gap="2" :imgWidth="imgWidth" @scrollReachBottom="getData" @click="showHigh"></vue-waterfall-easy>
    <ul class="viewer" id="images">
      <li v-for="(img, index) in imgArr" :key="index"><img :id="img.id" :src="img.src" ></li>
    </ul>
  </div>
</template>

<script>
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.min.css'
import vueWaterfallEasy from 'vue-waterfall-easy'
import { getPointPhotoList } from '@/api/datum'

export default {
  props: {
    point: {
      type: Object
    }
  },
  data () {
    return {
      imgArr: [],
      imgWidth: 0,
      viewer: null
    }
  },
  mounted () {
    this.getData()
    this.imgWidth = (this.$refs.photo.clientWidth - 4) / 3
  },
  methods: {
    showHigh (event, { index, value }) {
      setTimeout(() => {
        this.viewer && this.viewer.destroy()
        this.viewer = new Viewer(document.getElementById('images'))
        document.getElementById(value.id).click()
      }, 10)
    },
    getData () {
      getPointPhotoList(this.point.id).then(res => {
        let photos = res.data.map(item => {
          return {id: item.id, src: item.url}
        })
        this.imgArr = this.imgArr.concat(photos)
      })
    }
  },
  components: {
    vueWaterfallEasy
  }
}
</script>

<style scoped lang="stylus">
.viewer
  visibility hidden
</style>