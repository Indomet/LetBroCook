<template>
  <div id="app">
    <div id="nav">
      <NavBar/>
    </div>
    <!-- Render the content of the current page view -->
    <!-- <router-view/> -->
      <router-view/>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
export default {
  name: 'app',
  components: {
    NavBar
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.links {
    padding: 10px;
    display: inline-block;
}
</style>
