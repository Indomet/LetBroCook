<template>
<div>
<nav class="navbar navbar-expand-lg bg-body-tertiary ml-auto">
  <div class="container-fluid">
    <img src = "../assets/Screenshot.png" class="navbar-brand" />
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0 ">
        <li class="nav-item ">
          <a class="auth-button nav-link active cur" aria-current="page"  href="#">Home</a>
        </li>
        <li class="nav-item">
          <router-link to= "/login"  v-if="!user" class="auth-button nav-link active">Login</router-link>
        </li>
        <li  class="nav-item">
          <router-link  to= "/signup"  v-if="!user" class="auth-button nav-link active" >Signup</router-link>
        </li>
      </ul>
          <div class="input-group mb-3 ms-auto mb-2 mb-lg-0" >
            <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">All categories</button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
            <input type="text" class="form-control" aria-label="Text input with dropdown button">
          </div>
      <img  v-if="user" src = "https://images.theconversation.com/files/521751/original/file-20230419-18-hg9dc3.jpg?ixlib=rb-1.1.0&rect=53%2C17%2C1898%2C949&q=45&auto=format&w=1356&h=668&fit=crop" class = "userPic d-none d-md-none d-lg-block" @click="showSubMenu">
      <div class="sub-menu-wrap" id="subMenu">
        <div class="sub-menu">
          <div class="user-info">
            <img src = "https://images.theconversation.com/files/521751/original/file-20230419-18-hg9dc3.jpg?ixlib=rb-1.1.0&rect=53%2C17%2C1898%2C949&q=45&auto=format&w=1356&h=668&fit=crop" class="rounded-circle hidden-xs" id ="lol">
            <h2>John Doe</h2>
          </div>
          <hr>
          <a href="#" class = "sub-menu-link">
            <img src="../assets/profile.png">
              <p>Edit Profile</p>
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

<script>
import { ref } from 'vue'
// import Login from '../views/Login.vue'

// import { Api } from '@/Api'
export default {
  name: 'NavBar',
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
    }
  }
}
</script>

<style>
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
  width:80px;
  height: 80px;
  margin-right: 75px;
  border-radius: 50%;
  cursor: pointer;
  margin-left: 30px;
  object-fit: cover;
}

.sub-menu-wrap {
  position: absolute;
  top:100%;
  right: 1.5%;
  width: auto;
  max-height: 400px;
  overflow: hidden;
  opacity: 0;
  transition: opacity 0.3s;
}

.sub-menu-wrap.open-menu {
  opacity: 1;
  max-height: 400px;
  overflow: visible;
}

.sub-menu{
  background: rgb(255, 255, 255);
  padding:20px;
  z-index: 9999;
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
