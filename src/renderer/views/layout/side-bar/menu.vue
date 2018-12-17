<template>
  <div>
    <template v-for="item in routes" v-if="!item.hidden&&item.children">

      <el-menu-item v-if="oneChildren(item.children) && item.children[0].meta.type === 1" :index="path+item.path+'/'+item.children[0].path" :route="item.path+'/'+item.children[0].path">
        <svg-icon v-if="item.children[0].meta&&item.children[0].meta.icon" :icon-class="item.children[0].meta.icon"></svg-icon>
        <span slot="title" v-if="item.children[0].meta&&item.children[0].meta.title">{{item.children[0].meta.title}}</span>
      </el-menu-item>

      <el-submenu v-else-if="!item.meta.type" :index="item.name||item.path" :key="item.name">
        <template slot="title">
          <svg-icon v-if="item.meta&&item.meta.icon" :icon-class="item.meta.icon"></svg-icon>
          <span slot="title" v-if="item.meta&&item.meta.title">{{item.meta.title}}</span>
        </template>

        <template v-for="child in item.children" v-if="!child.hidden">
          <menu-item v-if="child.children&&child.children.length>0" :routes="[child]" :key="child.path" :path="path+item.path+'/'"></menu-item>
          <el-menu-item v-if="child.meta.type === 1" :index="path+item.path+'/'+child.path" :route="path+item.path+'/'+child.path">
            <svg-icon v-if="child.meta&&child.meta.icon" :icon-class="child.meta.icon"></svg-icon>
            <span slot="title" v-if="child.meta&&child.meta.title">{{child.meta.title}}</span>
          </el-menu-item>
        </template>
      </el-submenu>

    </template>
  </div>
</template>

<script>
export default {
  name: 'MenuItem',
  props: {
    routes: {
      type: Array
    },
    path: {
      type: String,
      default: ''
    }
  },
  methods: {
    oneChildren (children) {
      const showingChildren = children.filter(item => {
        return !item.hidden
      })
      if (showingChildren.length === 1) {
        return true
      }
      return false
    }
  }
}
</script>
