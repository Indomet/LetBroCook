<template>
  <div class="container-xl px-4 mt-4">
    <!-- Account page navigation-->
    <nav class="nav nav-borders">
      <router-link class="nav-link active ms-0" to="/EditProfile">Profile</router-link>
      <router-link class="nav-link" to="/EditPassword">Security</router-link>
    </nav>
    <hr class="mt-0 mb-4">
    <div class="row">
      <div class="col-lg-4">
        <!-- Profile picture card-->
        <div class="card mb-4 mb-xl-0">
          <div class="card-header">Profile Picture</div>
          <div class="card-body text-center">
            <!-- Profile picture image-->
            <div>
              <img id="image" class="img-fluid img-account-profile rounded-circle mb-2" :src="image" alt="" >
            </div>
            <!-- Profile picture upload button-->
            <div>
              <form @submit.prevent="onFormSubmit">
                <div class="field mb-3" style="display: flex; flex-direction: column; margin-top: 30px">
                  <b-form-file v-model="file" placeholder="Upload a picture" drop-placeholder="Drop picture here"
                    @change="onFileChange"></b-form-file>
                </div>
                <button class="btn btn-primary" type="submit">Upload new image</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <!-- Account details card-->
        <div class="card mb-4">
          <div class="card-header">Account Details</div>
          <div class="card-body ">
            <form @submit.prevent="handleSubmit">
              <!-- Form Row-->
              <div class="row gx-3 mb-3 text-start">
                <!-- Form Group (username)-->
                <div class="col-md-6">
                  <label class="small mb-1" for="username">Username</label>
                  <input class="form-control" id="username" type="text" placeholder="Enter your username"
                    v-model="username">
                  <div v-if="usernameError" class="invalid-feedback d-block">{{ usernameError }}</div>
                </div>
                <!-- Form Group (name)-->
                <div class="col-md-6">
                  <label class="small mb-1" for="name">Name</label>
                  <input class="form-control" id="name" type="text" placeholder="Enter your  name" v-model="name">
                </div>
              </div>
              <!-- Form Row        -->
              <!-- Form Group (email address)-->
              <div class="mb-3 text-start">
                <label class="small mb-1" for="email">Email address</label>
                <input class="form-control" id="email" type="email" placeholder="Enter your email address"
                  v-model="email">
                <div v-if="emailError" class="invalid-feedback d-block">{{ emailError }}</div>
              </div>
              <!-- Form Row-->
              <!-- Save changes button-->
              <button class="btn btn-primary" type="submit">Save changes</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Api } from '../Api'
export default {
  name: 'EditProfile',
  data() {
    return {
      image: '',
      username: '',
      name: '',
      email: '',
      usernameError: '',
      emailError: ''
    }
  },
  async mounted() {
  try {
    const user = JSON.parse(localStorage.getItem('user-info'))
    if (!user) {
      this.$router.push({ name: 'home' })
      return // stop executing if user is not logged in
    }
    const userId = user.body._id
    const response = await Api.get(`http://localhost:3000/v1/users/${userId}`)
    const { image, username, name, email } = response.data.User
    this.image = image
    this.username = username
    this.name = name
    this.email = email
  } catch (error) {
    console.error(error)
  }
},

  methods: {
    onFileChange(e) {
      this.file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.image = reader.result
      }
      if (this.file) {
        reader.readAsDataURL(this.file)
      }
    },
    async onFormSubmit() {
      if (!this.file) {
        alert('Please upload an image')
        return
      }
      try {
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        const response = await Api.patch(`http://localhost:3000/v1/users/${userId}`, { image: this.image })
        console.log(response)
      } catch (error) {
        console.log(error)
      }
      window.location.reload()
    },
    async handleSubmit() {
      if (this.username.length > 20) {
        this.usernameError = 'Username must be 20 characters or less'
        return
      }
      // this sends the request just for data that is filled in, ... helps to separate the data
      const data = {
        ...(this.username ? { username: this.username } : {}),
        ...(this.name ? { name: this.name } : {}),
        ...(this.email ? { email: this.email } : {})
      }
      try {
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        const response = await Api.patch(`http://localhost:3000/v1/users/${userId}`, data)
        console.log(response)
        window.location.reload()
      } catch (error) {
        console.log(error)
        if (error.response) {
          const errorMessage = error.response.data.message
          if (errorMessage.includes('Username')) {
            this.usernameError = errorMessage
          }
          if (errorMessage.includes('Email')) {
            this.emailError = errorMessage
          }
        } else {
          // handle other errors
          console.error(error)
        }
      }
    }
  }
}
</script>

<style scoped>
@media screen and (min-width: 992px) {
  #image {
    width: 40%;
  }
}

.card-body {
    margin-top: 20px;
}

.img-account-profile {
    width: 100px;
    /* height: 30%; */
    aspect-ratio: 1/1;
    object-fit: cover;
    position: relative;
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

.form-control,
.dataTable-input {
    display: block;
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
</style>
