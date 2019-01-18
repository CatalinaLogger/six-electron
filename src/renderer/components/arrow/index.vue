<template>
  <div class='arrow'>
    <i class='icon-uniE900' v-for="index in size" :style="{'margin-right': `${space}px`,'animation': `scroll 3s infinite ${size / 10 - index / 10}s linear`}"></i>
  </div>
</template>

<script>
export default {
  props: {
    size: {
      type: Number,
      default: 20
    },
    space: {
      type: Number,
      default: -8
    }
  }
}
</script>

<style scoped lang='stylus'>
.arrow
  font-size 18px
  color rgba(0, 0, 0, 0)
  overflow hidden
</style>
