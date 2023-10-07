import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import mitt from 'mitt'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)

Vue.config.productionTip = false
const emitter = mitt()
Vue.prototype.$emitter = emitter

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
