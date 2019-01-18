<template>
  <div class='block'>
    <div class='master'>
      <slot></slot>
    </div>
    <div class='corner left-top'></div>
    <div class='corner right-top'></div>
    <div class='corner right-bottom'></div>
    <div class='corner left-bottom'></div>
  </div>
</template>

<script>
export default {}
</script>

<style scoped lang='stylus'>
$borderSize=1px
@keyframes shadow
  0%
    box-shadow inset 0 0 20px #077ccb
  50%
    box-shadow inset 0 0 5px #077ccb
  100%
    box-shadow inset 0 0 20px #077ccb
.block
  position relative
  width 100%
  &:hover
    background rgba(7, 124, 203, 0.1)
    .left-top
      border-left 2px solid #49c7d9 !important
      border-top 2px solid #49c7d9 !important
    .right-top
      border-top 2px solid #49c7d9 !important
      border-right 2px solid #49c7d9 !important
    .right-bottom
      border-right 2px solid #49c7d9 !important
      border-bottom 2px solid #49c7d9 !important
    .left-bottom
      border-left 2px solid #49c7d9 !important
      border-bottom 2px solid #49c7d9 !important
  .master
    width 100%
    height 100%
    animation shadow 5s infinite linear
  .corner
    position absolute
    width 20px
    height 20px
    &.left-top
      top 0
      border-left $borderSize solid #49c7d9
      border-top $borderSize solid #49c7d9
    &.right-top
      top 0
      right 0
      border-top $borderSize solid #49c7d9
      border-right $borderSize solid #49c7d9
    &.right-bottom
      right 0
      bottom 0
      border-right $borderSize solid #49c7d9
      border-bottom $borderSize solid #49c7d9
    &.left-bottom
      bottom 0
      border-left $borderSize solid #49c7d9
      border-bottom $borderSize solid #49c7d9
</style>
