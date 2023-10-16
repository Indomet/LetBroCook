<template>
  <div class="container-xl px-4 mt-4">
    <nav class="nav nav-border">
      <router-link class="nav-link  ms-0" to="/EditProfile">Profile</router-link>
      <router-link class="nav-link active" to="/EditPassword">Security</router-link>
    </nav>
    <hr class="mt-0 mb-4">
    <div class="row">
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header">Change Password</div>
          <div class="card-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3 text-start">
                <label class="small mb-1" for="current_password">Current Password</label>
                <input class="form-control" id="current_password" type="password" v-model="current_password"
                  placeholder="Enter current password">
                <div v-if="getError('current_password')" class="invalid-feedback d-block">{{ getError('current_password')
                }} </div>
              </div>
              <div class="mb-3 text-start">
                <label class="small mb-1" for="new_password">New Password</label>
                <input class="form-control" id="new_password" type="password" v-model="new_password"
                  placeholder="Enter new password">
                <div v-if="getError('new_password')" class="invalid-feedback d-block">{{ getError('new_password') }}
                </div>
              </div>
              <div class="mb-3 text-start">
                <label class="small mb-1" for="confirm_password">Confirm Password</label>
                <input class="form-control" :class="{ 'is-invalid': getError('password_confirmation') }"
                  id="confirm_password" type="password" v-model="confirm_password" placeholder="Confirm new password" />
                <div v-if="getError('confirm_password')" class="invalid-feedback d-block">{{ getError('confirm_password')
                }} </div>
              </div>
              <button class="btn btn-primary" type="submit">Save</button>
            </form>
          </div>
        </div>
      </div>
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-header">Delete Account</div>
          <div class="card-body">
            <p>Deleting your account is a permanent action and cannot be undone. If you are certain that you want to delete your account, please click on the button below.</p>
            <button class="btn btn-delete text-danger" @click.prevent="deleteAccount" type="submit">I understand, delete
              my account</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Api } from '../Api'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, sameAs, helpers } from '@vuelidate/validators'
export default {
  name: 'EditPassword',
  setup() {
    return { v$: useVuelidate() }
  },
  data() {
    return {
      current_password: '',
      new_password: '',
      confirm_password: '',
      original_password: ''
    }
  },
  validations() {
    return {
      current_password: { required: helpers.withMessage('Current password is required', required) },
      new_password: { required: helpers.withMessage('Password is required', required), minLength: minLength(3) },
      confirm_password: {
        required: helpers.withMessage('Password confirmation is required', required),
        sameAs: helpers.withMessage('Passwords should match', sameAs(this.new_password))
      }
    }
  },
  async mounted() {
    const user = JSON.parse(localStorage.getItem('user-info'))
    if (!user) {
      this.$router.push({ name: 'home' })
    }
    try {
      const userId = user.body._id
      const response = await Api.get(`http://localhost:3000/v1/users/${userId}`)
      this.original_password = response.data.User.password
    } catch (error) {
      console.log(error)
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
        current_password: this.current_password,
        password: this.new_password
      }
      try {
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        const response = await Api.patch(`http://localhost:3000/v1/users/${userId}`, data)
        alert('Password updated successfully')
        console.log(response)
        this.$router.push({ name: 'EditProfile' })
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert('Current password is incorrect. Please try again')
        } else {
          console.log(error)
        }
      }
    },
    async deleteAccount() {
      const text = 'Are you sure you want to delete your account?'
      if (confirm(text) === false) return
      const user = JSON.parse(localStorage.getItem('user-info'))
      const userId = user.body._id
      const response = await Api.delete(`http://localhost:3000/v1/users/${userId}`)
      console.log(response)
      localStorage.removeItem('user-info')
      this.$router.push('/')
    },
    getError(path) {
      const error = this.v$.$errors.find(error => error.$property === path)
      if (error) return error.$message
      return null
    }
  }
}
</script>

<style scoped>
.card-body {
  margin-top: 20px;
}

.card {
  box-shadow: 0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%);
}

.card-header {
  padding: 1rem 1.35rem;
  margin-bottom: 0;
  background-color: rgba(25, 71, 136, 0.075);
  border-bottom: 1px solid rgba(33, 40, 50, 0.125);
}

.form-control {
  font-size: 0.875rem;
  color: #69707a;
}

.nav-border .nav-link.active {
  color: #0061f2;
  border-bottom-color: #0061f2;
}

.nav-border .nav-link {
  color: #69707a;
  border-bottom-width: 0.125rem;
  border-bottom-style: solid;
  border-bottom-color: transparent;
  padding-left: 0;
  padding-right: 0;
  margin-left: 1rem;
  margin-right: 1rem;
}

.btn-delete {
  background-color: #f1e0e3;
}
</style>
