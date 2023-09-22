<template>
  <div class="long-bar">
    <!-- href kills the state of the current page where routerLink doesnt lose the state of the page
    <router-link to="/login" class="auth-button">Login</router-link>
    <router-link to="/signup" class="auth-button">Signup</router-link> -->
    <a href="/signup" class="auth-button">Signup</a>
    <a href="/login" class="auth-button">Login</a>
  </div>
</template>

<script>
export default {
  name: 'NavBar'
}
</script>

<style scoped>
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
