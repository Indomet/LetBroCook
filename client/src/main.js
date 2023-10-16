import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from 'bootstrap-vue'
import mitt from 'mitt'
import infiniteScroll from 'vue-infinite-scroll'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.use(BootstrapVue)
Vue.use(infiniteScroll)
Vue.mixin({
  methods: {
    onFileChange(e, theFile, theImage) {
      theFile = e.target.files[0]
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          console.log('read the file and setting img')
          console.log(reader.result)
          resolve(reader.result)
        }
        reader.onerror = reject
        if (theFile) {
          reader.readAsDataURL(theFile)
        }
      })
    }
  }
})
Vue.config.productionTip = false
const emitter = mitt()
Vue.prototype.$emitter = emitter

new Vue({
  router,
  render: function (h) { return h(App) }
}).$mount('#app')
