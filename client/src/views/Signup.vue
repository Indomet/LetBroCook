<template>
    <div class="signup-container">
          <form @submit.prevent="handleSubmit" class="signup-form">
            <h3>Create an account</h3>
            <div class="form-group">
              <label for="username">Username</label>
              <input type="username" id="username" v-model="username" class="form-control" />
              <label for="name">Name</label>
              <input type="name" id="name" v-model="name" class="form-control" />
            </div>
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" v-model="email" class="form-control" />
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" v-model="password" class="form-control" />
              <label for="password_confirmation">Password confirmation</label>
              <input type="password_confirmation" id="password_confirmation" v-model="password_confirmation" class="form-control" />
            </div>
            <button type="submit" class="btn btn-block">Signup</button>
          </form>
          <div class="divider">
            <span class="divider-text">Do you have an account?</span>
          </div>
          <div class="account-button-container">
            <a href="/login" class="btn btn-block">Login</a>
          </div>
        </div>
</template>

<script>
import { Api } from '../Api'
export default {
  name: 'Signup',
  data() {
    return {
      username: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    }
  },
  methods: {
    async handleSubmit() {
      const data = {
        username: this.username,
        name: this.name,
        email: this.email,
        password: this.password
      }
      const response = await Api.post('http://localhost:3000/v1/users/signup', data)
      console.log(response)
      this.$router.push('/login')
    }
  },
  mounted() {
    const user = localStorage.getItem('user-info')
    if (user) {
      this.$router.push({ name: 'home' })
    }
  }
}
</script>

<style scoped>

.vegetables {
  max-width: 60%;
  margin: -200px -200px 0px;
}

.signup-form {
  /* box size */
  max-width: 400px;
  /* 0  auto means no space and left - right sides are auto calculated if u wanna put somethign on right side it is margin-left: auto; */
  margin: 60px auto;
  /* padding is the distance between box and eements inside */
  padding: 20px;
  background-color: #ffffff;
  border: 1px solid #f1f1f1;
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  /* Space between form groups */
  margin-bottom: 15px;
}

label {
  font-weight: bold;
  text-align: left;
  display: block;
  margin-bottom: 0px;
}

.form-control {
  width: 100%;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 15px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 40px;
  border: 1px solid #111;
}

.divider {
  max-width: 400px;
  margin: 20px auto;
  width: 100%;
  height: 1px;
  /* Adjust the thickness of the divider */
  background-color: #ccc;
  /* Adjust the color of the divider */
}

.divider-text {
  display: inline-block;
  background-color: #fff;
  padding: 0 10px;
  position: relative;
  top: -10px;
}

.account-button-container {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}
</style>
