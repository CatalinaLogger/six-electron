import Vue from 'vue'
import App from './App'
import store from './store'
import router from './router'

import 'normalize.css/normalize.css'// A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/common/style/index.styl'
import '@/common/icons' // icon
import '@/auth' // Auth control

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.use(ElementUI, { size: 'small', locale })

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
