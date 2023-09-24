<template>
  <div class="long-bar">
    <!-- href kills the state of the current page where routerLink doesnt lose the state of the page
    <router-link to="/login" class="auth-button">Login</router-link>
    <router-link to="/signup" class="auth-button">Signup</router-link> -->
    <div id="home-button">
      <router-link class="auth-button" to="/">Home(logohere)</router-link>
    </div>
    <router-link to="/login"  v-if="!user"  class="auth-button">Login</router-link>
    <router-link to="/signup" v-if="!user" class="auth-button">Signup</router-link>
    <a href="/" @click="logout()" v-if="user" class="auth-button">logout</a>
    <!-- <a href="/signup" class="auth-button">Signup</a>
    <a href="/login" class="auth-button">Login</a> -->
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
  }
}
</script>

<style scoped>
#home-button, auth-button{
  margin-right: auto;
  padding: 5px 15px;
}
.long-bar {
  display: flex;
  background-color: #333;
  padding: 10px 20px;
  justify-content: flex-end;
}

.auth-button {
  margin: 0 10px;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: #555;
  color: #fff;
  text-decoration: none;
  transition: background-color 0.3s;
}

.auth-button:hover {
  background-color: #777;
}
</style>
