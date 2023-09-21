<template>
  <div class="auth-links">
    <!-- href kills the state of the current page where routerLink doesnt lose the state of the page -->
    <router-link to="/login" class="auth-link">Login</router-link>
    <router-link to="/signup" class="auth-link">Signup</router-link>
  </div>
</template>

<style scoped>
.auth-links {
  display: flex;
  background-color: #333;
  padding: 10px 20px;
  justify-content: flex-end;
}

.auth-link {
  margin: 0 10px;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: #555;
  color: #fff;
  text-decoration: none;
  transition: background-color 0.3s;
}

.auth-link:hover {
  background-color: #777;
}
</style>

<script>
export default {
  name: 'NavBar'
}
</script>
