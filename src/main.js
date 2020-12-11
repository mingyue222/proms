import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/styles/global.css'

import './utils/request.js'
import './utils/time.js'

import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import './assets/fonts/iconfont.css'
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table', ZkTable)
Vue.config.productionTip = false
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
