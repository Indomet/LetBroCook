<template>
  <div id="app">
    <NavBar/>
    <!-- <SearchBar/> -->
    <!-- Render the content of the current page view -->
    <!-- <router-view/> -->
      <router-view/>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue'
// import SearchBar from './components/SearchBar.vue'
export default {
  name: 'app',
  components: {
    NavBar
    // SearchBar
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

</style>
