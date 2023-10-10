<template>
<div class="container-xl px-4 mt-4">
        <!-- Account page navigation-->
        <nav class="nav nav-borders">
        <router-link class="nav-link  ms-0" to="/EditProfile">Profile</router-link>
        <router-link class="nav-link active" to="/EditPassword" >Security</router-link>
        </nav>
        <hr class="mt-0 mb-4">
        <div class="row">
            <div class="col-lg-8">
                <!-- Change password card-->
                <div class="card mb-4">
                    <div class="card-header">Change Password</div>
                    <div class="card-body">
                        <form  @submit.prevent="handleSubmit">
                            <!-- Form Group (current password)-->
                            <div class="mb-3 text-start">
                                <label class="small mb-1" for="current_password">Current Password</label>
                                <input class="form-control"  id="current_password" type="password" v-model="current_password" placeholder="Enter current password">
                                <div v-if="getError('current_password')" class="invalid-feedback d-block">{{ getError('current_password') }} </div>
                              </div>
                            <!-- Form Group (new password)-->
                            <div class="mb-3 text-start">
                                <label class="small mb-1" for="new_password">New Password</label>
                                <input class="form-control" id="new_password" type="password" v-model="new_password" placeholder="Enter new password">
                                <div v-if="getError('new_password')" class="invalid-feedback d-block">{{ getError('new_password') }} </div>
                              </div>
                            <!-- Form Group (confirm password)-->
                            <div class="mb-3 text-start">
                                <label class="small mb-1" for="confirm_password">Confirm Password</label>
                                <input class="form-control" :class="{ 'is-invalid': getError('password_confirmation') }" id="confirm_password" type="password" v-model="confirm_password"  placeholder="Confirm new password"/>
                                <div v-if="getError('confirm_password')"  class="invalid-feedback d-block">{{ getError('confirm_password') }} </div>
                              </div>
                            <button class="btn btn-primary" type="submit">Save</button>
                        </form>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <!-- Delete account card-->
                <div class="card mb-4">
                    <div class="card-header">Delete Account</div>
                    <div class="card-body">
                        <p>Deleting your account is a permanent action and cannot be undone. If you are sure you want to delete your account, select the button below.</p>
                        <button class="btn btn-danger-soft text-danger" @click.prevent="deleteAccount" type="submit">I understand, delete my account</button>
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
        console.log(response)
        this.$router.push('/')
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
.paint-red {
  color: red;
}

.card-body{margin-top:20px;

}
.img-account-profile {
    height: 10rem;
}
.rounded-circle {
    border-radius: 50% !important;
}
.card {
    box-shadow: 0 0.15rem 1.75rem 0 rgb(33 40 50 / 15%);
}
.card .card-header {
    font-weight: 500;
}
.card-header:first-child {
    border-radius: 0.35rem 0.35rem 0 0;
}
.card-header {
    padding: 1rem 1.35rem;
    margin-bottom: 0;
    background-color: rgba(33, 40, 50, 0.03);
    border-bottom: 1px solid rgba(33, 40, 50, 0.125);
}
.form-control{
    width: 100%;
    padding: 0.875rem 1.125rem;
    font-size: 0.875rem;
    font-weight: 400;
    line-height: 1;
    color: #69707a;
    background-color: #fff;
    background-clip: padding-box;
    border: 1px solid #c5ccd6;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    border-radius: 0.35rem;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.nav-borders .nav-link.active {
    color: #0061f2;
    border-bottom-color: #0061f2;
}
.nav-borders .nav-link {
    color: #69707a;
    border-bottom-width: 0.125rem;
    border-bottom-style: solid;
    border-bottom-color: transparent;
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    padding-left: 0;
    padding-right: 0;
    margin-left: 1rem;
    margin-right: 1rem;
}

.btn-danger-soft {
    color: #000;
    background-color: #f1e0e3;
    border-color: #f1e0e3;
}
</style>
