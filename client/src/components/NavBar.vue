<template>
<div>
<nav class="navbar navbar-expand-lg bg-body-tertiary ml-auto">
  <div class="container-fluid">
    <img src = "../assets/Screenshot.png" class="navbar-brand" />
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="auth-button nav-link active" aria-current="page"  href="/">Home</a>
        </li>
        <li class="nav-item">
          <a class="auth-button nav-link active recommendBTN" aria-current="page"  @click="getRecommendation">Recommendations</a>
        </li>
        <li class="nav-item">
          <router-link to= "/login"  v-if="!user" class="auth-button nav-link active">Login</router-link>
        </li>
        <li  class="nav-item">
          <router-link  to= "/signup" v-if="!user" class="auth-button nav-link active" >Signup</router-link>
        </li>
      </ul>
          <div class="input-group mb-3 ms-auto mb-2 mb-lg-0" >
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Tags</button>
            <ul class="dropdown-menu" style="max-height: 200px; overflow-y: auto;">
              <form>
                <div class="form-group">
                  <div
                    v-for="(tag, index) in this.tags"
                    :key="tag._id"
                    class="form-check"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="tag"
                      :id="'tag' + index"
                      v-model="selectedTags"
                    />
                    <label class="form-check-label" :for="'tag' + index">
                      {{ tag.name }}
                    </label>
                  </div>
                </div>
              </form>
            </ul>
            <input type="text" class="form-control" aria-label="Text input with dropdown button" @keydown.enter="search" v-model="searchQuery">
          </div>
      <img  v-if="user" :src = "image" class = "userPic" @click="showSubMenu">
      <div class="sub-menu-wrap" id="subMenu">
        <div class="sub-menu">
          <div class="user-info">
            <div>
            <img :src = "image" class="position rounded-circle hidden-xs" id ="lol">
          </div>
            <h2>{{username}}</h2>
          </div>
          <hr>
          <a href="/EditProfile" class = "sub-menu-link">
            <img src="../assets/profile.png">
              <p>Edit Profile</p>
              <span>></span>
          </a>
          <a href="/CreateRecipe" v-if="user" class = "sub-menu-link">
            <img src="../assets/NewRecipe.png">
              <p>Create a Recipe</p>
              &nbsp;&nbsp;&nbsp;&nbsp;<span>></span>
          </a>
          <a href="/MyRecipes" class = "sub-menu-link">
            <img src="../assets/recipe-book.png" style="zoom: 100%;">
              <p>My Recipes</p>
              <span>></span>
          </a>
          <a href="/FavoriteRecipes" class = "sub-menu-link">
            <img src="../assets/1480758-200.png">
              <p>My Favorite Recipes</p>
              <span>></span>
          </a>
          <a href="/" @click="logout()" v-if="user" class = "sub-menu-link">
            <img src="../assets/logout.png">
              <p>Logout</p>
              <span>></span>
          </a>
        </div>
      <form class="d-flex" role="search">
      </form>
    </div>
  </div>
</div>
</nav>
</div>
</template>

<script scoped>
import { ref } from 'vue'
import axios from 'axios'
export default {
  name: 'NavBar',
  data() {
    return {
      searchQuery: '',
      tags: [],
      selectedTags: []
    }
  },
  mounted() {
    axios
      .get('http://localhost:3000/v1/recipes/tags')
      .then((response) => {
        this.tags = response.data.tags
      })
      .catch((err) => {
        console.log(err)
      })
    const user = JSON.parse(localStorage.getItem('user-info'))
    const userId = user.body._id
    axios.get(`http://localhost:3000/v1/users/${userId}`)
      .then(response => {
        const { image, username } = response.data.User
        this.image = image
        this.username = username
      })
      .catch(error => {
        console.error(error)
      })
  },
  setup() {
    const user = ref(localStorage.getItem('user-info'))
    const logout = () => {
      localStorage.removeItem('user-info')
      user.value = null
    }
    return {
      user,
      logout
    }
  },
  watch: {
    '$route'() {
      this.user = localStorage.getItem('user-info')
    }
  },
  methods: {
    showSubMenu() {
      // Get a reference to the submenu-wrap element
      const subMenuWrap = document.getElementById('subMenu')
      // Toggle the sub-menu-wrap element's opacity class
      subMenuWrap.classList.toggle('open-menu')
      // subMenuWrap.style.display = subMenuWrap.style.display === 'none' ? 'block' : 'none'
    },
    search() {
      if (this.$router.currentRoute.name !== 'recipes') {
    this.$router.push({ name: 'recipes' })
  }
  setTimeout(() => {
    this.$emitter.emit('search', { tags: this.selectedTags, searchQuery: this.searchQuery })
  }, 500)
},
getRecommendation() {
  this.$emitter.emit('recommendation')
}

  }
}
</script>

<style>
.position {
  /* position: absolute;
  top: 8px;
  left: 8px; */
}
.form-check-input:checked{
  background-color: rgb(41, 199, 41) !important;
  border-color: rgb(41, 199, 41) !important;
  box-shadow: none !important;

}
.recommendBTN{
  cursor: pointer;
}

.recommendBTN:hover{  color: black !important; /* Change the text color to red when hovering */

}

.auth-button {
  margin: 0px 10px;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: #555;
  color: #fff;
  text-decoration: none;
  transition: background-color 0.3s;
}

.auth-button:hover {
  text-decoration: none;
  background-color: #777;
}

.navbar-nav{
  align-content: center;
}

.cur {
  font-family: 'Lucida Handwriting', cursive;
}

.navbar-brand{
  width: 220px;
  height: auto;
}

#lol{
  object-fit: cover;
  width: 80px;
  height: 80px;
}

.navbar-nav {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo{
  width:220px;
  max-height: auto;
}

.userPic{
  position: relative;
  width:80px;
  height: 80px;
  margin-right: 75px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 30px;
  object-fit: cover;
}

.sub-menu-wrap {
  z-index: 9999;
  position: absolute;
  right:1.5%;
  top:100%;
  width: auto;
  max-height: 400px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}
.sub-menu-wrap.open-menu {
  pointer-events: all;
  opacity: 1;
  max-height: 400px;
  overflow: visible;
}

@media (max-width: 768px) {
  .sub-menu-wrap {
    left: 50%;
    transform: translateX(-50%);
  }
  .userPic{
    margin-right: 35px;
  }
}

.sub-menu{
  background: rgb(255, 255, 255);
  padding:20px;
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc; /* Add a 1px solid border with a gray color */
}

.user-info{
  display: flex;
  padding: 5%;
  justify-content: center;
  align-items: center;
}

.user-info h2{
  font-size: 20px;
}

.sub-menu hr{
  border: 0;
  height: 1px;
  width: 100%;
  background: #000000;
  margin: 15px 0px 10px;
}

.sub-menu-link{
  display: flex;
  align-items: center;
  text-decoration: none !important; /* Remove link underline */
  color: #000000;
  margin-bottom: 10px;
  outline: none;
}

.sub-menu-link p{
  width: 100%;
  margin: auto;
}

.sub-menu-link img{
  width: 40px;
  background: #e4e3e3;
  border-radius: 50%;
  padding: 8px;
  margin-right: 15px;
}

.sub-menu-link span{
  font-size: 15px;
  transition: transform 0.5s;
}

.sub-menu-link:hover span{
  transform: translateX(10px);
}

.sub-menu-link:hover{
  color: black; /* Set the color to black when the link is hovered on or focused */
  font-weight: 600;
}

</style>
