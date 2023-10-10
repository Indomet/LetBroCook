<template>
  <section class="h-100" style="background-color: #eee;">
    <div class="container h-100" >
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-lg-12 col-xl-11">
          <div class="card text-black" style="border-radius: 25px;">
            <div class="card-body p-md-5">
              <div class="row justify-content-center">
                <div class="col-md-10 col-lg-6 col-xl-5 order-2 order-lg-1">
                  <p class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Sign up</p>
                  <form @submit.prevent="handleSubmit" class="mx-1 mx-md-4">
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <label class="form-label" for="username">Username</label>
                        <input type="username" id="username" v-model="username" class="form-control"
                          :class="{ 'is-invalid': getError('username') }" />
                        <div v-if="getError('username')" class="invalid-feedback">{{ getError('username') }} </div>
                        <div v-if="usernameError" class="invalid-feedback d-block">{{ usernameError }}</div>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-user fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <label for="name">Name</label>
                        <input type="name" id="name" v-model="name" class="form-control"
                          :class="{ 'is-invalid': getError('name') }" />
                        <div v-if="getError('name')" class="invalid-feedback">{{ getError('name') }} </div>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <label class="form-label" for="email">Email</label>
                        <input type="email" id="email" v-model="email" class="form-control"
                          :class="{ 'is-invalid': getError('email') }" />
                        <div v-if="getError('email')" class="invalid-feedback">{{ getError('email') }} </div>
                        <div v-if="emailError"  class="invalid-feedback d-block">{{ emailError }}</div>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <label for="password">Password</label>
                        <input type="password" id="password" v-model="password" class="form-control"
                          :class="{ 'is-invalid': getError('password') }" />
                        <div v-if="getError('password')" class="invalid-feedback">{{ getError('password') }} </div>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-key fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <label for="password_confirmation">Password confirmation</label>
                        <input type="password" id="password_confirmation" v-model="password_confirmation"
                          class="form-control" :class="{ 'is-invalid': getError('password_confirmation') }" />
                        <div v-if="getError('password_confirmation')" class="invalid-feedback">{{
                          getError('password_confirmation') }} </div>
                      </div>
                    </div>
                    <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                      <button type="submit" class="btn btn-primary btn-block">Signup</button>
                    </div>
                  </form>
                  <div class="divider">
                    <span class="divider-text">Do you have an account?</span>
                  </div>
                  <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <a href="/login" class="btn btn-primary btn-lg">Login</a>
                  </div>
                </div>
                <div class="vegetables col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                  <img src="../assets/vegetables.png" class="img-fluid" alt="Vegatables">
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </div>
</section>
</template>

<script>
import { Api } from '../Api'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, sameAs, helpers } from '@vuelidate/validators'
import '@fortawesome/fontawesome-free/css/all.min.css'

export default {
  name: 'Signup',
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      image: 'https://images.theconversation.com/files/521751/original/file-20230419-18-hg9dc3.jpg?ixlib=rb-1.1.0&rect=53%2C17%2C1898%2C949&q=45&auto=format&w=1356&h=668&fit=crop',
      username: '',
      name: '',
      email: '',
      password: '',
      password_confirmation: ''
    }
  },
  validations() {
    return {
      username: { required: helpers.withMessage('Username is required', required) },
      name: { required: helpers.withMessage('Name is required', required) },
      email: { required: helpers.withMessage('Email is required', required) },
      password: { required: helpers.withMessage('Password is required', required), minLength: minLength(3) },
      password_confirmation: {
        required: helpers.withMessage('Password confirmation is required', required),
        sameAs: helpers.withMessage('Passwords should match', sameAs(this.password))
      }
    }
  },
  methods: {
    async handleSubmit() {
      const result = await this.v$.$validate()
      if (!result) {
        // notify user form is invalid
        return
      }

      const data = {
        image: this.image,
        username: this.username,
        name: this.name,
        email: this.email,
        password: this.password
      }
      const response = await Api.post('http://localhost:3000/v1/users/signup', data)
      console.log(response)
      this.$router.push('/login')
    },
    getError(path) {
      const error = this.v$.$errors.find(error => error.$property === path)
      if (error) return error.$message
      return null
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
  max-width: 47%;
}

label {
  font-weight: bold;
  text-align: left;
  display: block;
  margin-bottom: 0px;
}

.form-control {
  border: 1px solid #ccc;
  border-radius: 15px;
}

.divider {
  max-width: 400px;
  margin: 40px auto 30px;
  width: 100%;
    /* thickness of the divider */
  height: 1px;
  background-color: #ccc;
}

.divider-text {
  display: inline-block;
  background-color: #fff;
  padding: 0 10px;
  position: relative;
  top: -10px;
}

.btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 40px;

}

</style>
