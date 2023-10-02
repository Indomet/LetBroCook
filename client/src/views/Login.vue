<template>
  <section class="h-100" style="background-color: #eee;">
    <div class="container h-100">
      <div class="row d-flex justify-content-center align-items-center h-100">
        <div class="col-lg-12 col-xl-10">
          <div class="card text-black">
            <div class="card-body p-md-4">
              <div class="row justify-content-center">
                <div class="col-md-10 col-lg-6 col-xl- order-2 order-lg-1">
                  <p class="text-center h1 fw-bold mb-5 mx-1 mx-md-4 mt-4">Login</p>
                  <form @submit.prevent="handleSubmit" class="mx-1 mx-md-4">
                    <div class="hs-firstname d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-envelope fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0">
                        <label class="form-label" for="email">Email</label>
                        <input type="email" id="email" v-model="email" class="form-control"
                          :class="{ 'is-invalid': getError('email') }" />
                        <div v-if="getError('email')" class="invalid-feedback">{{ getError('email') }} </div>
                      </div>
                    </div>
                    <div class="d-flex flex-row align-items-center mb-4">
                      <i class="fas fa-lock fa-lg me-3 fa-fw"></i>
                      <div class="form-outline flex-fill mb-0 form-group">
                        <label for="password">Password</label>
                        <input v-if="!showPassword" type="password" id="password" v-model="password" class="form-control"
                          :class="{ 'is-invalid': getError('password') }" />
                        <input v-else type="text" id="password" v-model="password" class="form-control"
                          :class="{ 'is-invalid': getError('password') }" />
                        <div v-if="getError('password')" class="invalid-feedback">{{ getError('password') }}</div>
                        <i class="fas" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
                            @click="showPassword = !showPassword"></i>
                    </div>
                    </div>
                    <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                      <button type="submit" class="btn btn-primary btn-block">Login</button>
                    </div>
                    <div v-if="errorMessage" class="alert alert-danger">
                      {{ errorMessage }}
                    </div>
                  </form>
                  <div class="divider">
                    <span class="divider-text">New to our community</span>
                  </div>
                  <div class="d-flex justify-content-center mx-4 mb-3 mb-lg-4">
                    <a href="/signup" class="btn btn-primary btn-lg">Signup</a>
                  </div>
                </div>
                <div class="mouse col-md-10 col-lg-6 col-xl-7 d-flex align-items-center order-1 order-lg-2">
                  <img src="../assets/mouse.png" class="img-fluid" alt="mouse">
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

import { Api } from '@/Api'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, helpers } from '@vuelidate/validators'
import '@fortawesome/fontawesome-free/css/all.min.css'
export default {
  name: 'Login',
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      email: '',
      password: '',
      errorMessage: null,
      showPassword: false
    }
  },
  validations() {
    return {
      email: { required: helpers.withMessage('Email is required', required) },
      password: { required: helpers.withMessage('Password is required', required), minLength: minLength(3) }
    }
  },

  methods: {
    async handleSubmit() {
      const result = await this.v$.$validate()
      if (!result) {
        // notify user form is invalid
        return
      }
      try {
        const response = await Api.post('http://localhost:3000/v1/users/sign-in', {
          email: this.email,
          password: this.password

        })
        console.log(response)
        if (response.status === 200) {
          localStorage.setItem('user-info', JSON.stringify(response.data))
          this.$router.push({ name: 'home' })
        }
      } catch (errorMessage) {
        this.errorMessage = 'Either email or password is incorrect'
      }
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

.mouse {
  max-width: 35%;
}
.form-outline {
  position: relative;
  padding-left: 40px;
}

.form-group .fas {
  position: absolute;
  z-index: 2;
  display: block;
  width: 2.375rem;
  height: 2.375rem;
  line-height: 2.375rem;
  text-align: center;
  right: 10px;
  top:40%;
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
  position: relative;
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
