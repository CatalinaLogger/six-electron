import Vue from 'vue'
import Router from 'vue-router'
import Layout from '@/views/layout/index'

Vue.use(Router)

export const constantRouters = [
  {
    path: '/login',
    component: require('@/views/login').default,
    hidden: true
  },
  {
    path: '',
    component: Layout,
    redirect: 'dashboard',
    children: [{
      path: 'dashboard',
      component: require('@/views/dashboard').default,
      meta: {type: 1, title: '监控面板', icon: 'dashboard'}
    }]
  },
  {
    path: '*',
    redirect: '/',
    hidden: true
  }
]

export default new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouters
})

/**
 * 递归处理权限树动态生成路由
 */
export function dynamicRouters (authTree, parent, meta, src, level) {
  let routers = []
  authTree.forEach(function (record) {
    if (record.type !== 3) { /** 如果不是按钮 */
      let tmp = {}
      let _level = 1
      if (level || record.type === 1) {
        try {
          tmp.component = require(`@/views/${src}${record.path}`).default
          _level = level + 1
          tmp.path = record.path
          if (!level && record.type === 1) {
            src = ''
            let pan = {children: []}
            pan.path = ''
            pan.redirect = `${record.path}`
            pan.component = Layout
            pan.children.push(tmp)
            routers.push(pan)
          } else {
            parent.push(tmp)
          }
        } catch (e) {
          /** 找不到模板文件不做处理 */
          console.log(e)
          return
        }
      } else {
        src = ''
        routers.push(tmp)
        tmp.path = `/${record.path}`
        tmp.component = Layout
      }
      tmp.redirect = record.redirect
      tmp.hidden = record.hidden === 1
      tmp.name = tmp.path
      tmp.meta = {type: record.type, title: record.name, icon: record.icon, noCache: !record.cache}
      tmp.level = _level
      if (record.children && record.children.length > 0) {
        tmp.children = []
        dynamicRouters(record.children, tmp.children, tmp.meta, `${src}${record.path}/`, _level)
      }
    } else {
      if (!meta.buttons) {
        meta.buttons = []
      }
      meta.buttons.push({type: record.type, hidden: record.hidden === 1, path: record.path, name: record.name, icon: record.icon})
    }
  })
  return routers
}
