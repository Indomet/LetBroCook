<template>
  <div id="app">
    <div id="nav">
      <NavBar/>
      <a class="links" href="/">Home</a>
      <a class="links" href="/recipes">Recipe Page</a>
      <router-link to="/">Home</router-link>
    </div>
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

.links {
    padding: 10px;
    display: inline-block;
}
</style>
