<template>
  <div class="container-xl px-4 mt-4">
    <nav class="nav nav-border">
      <router-link class="nav-link active ms-0" to="/EditProfile">Profile</router-link>
      <router-link class="nav-link" to="/EditPassword">Security</router-link>
    </nav>
    <hr class="mt-0 mb-4">
    <div class="row">
      <div class="col-lg-4">
        <div class="card mb-4 mb-xl-0">
          <div class="card-header">Profile Picture</div>
          <div class="card-body text-center">
            <div>
              <img id="image" class="img-fluid profile-picture mb-2" :src="image" alt="">
            </div>
            <div>
              <form @submit.prevent="onFormSubmit">
                <div class="field mb-3" style="display: flex; flex-direction: column; margin-top: 30px">
                  <b-form-file v-model="file" placeholder="Upload a picture" drop-placeholder="Drop picture here"
                    accept=".png, .jpg,   .jpeg"></b-form-file>
                </div>
                <button class="btn btn-primary" type="submit">Upload new image</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="card mb-4">
          <div class="card-header">Account Details</div>
          <div class="card-body ">
            <form @submit.prevent="handleSubmit">
              <div class="row gx-3 mb-3 text-start">
                <div class="col-md-6">
                  <label class="small mb-1" for="username">Username</label>
                  <input class="form-control" id="username" type="text" placeholder="Enter your username"
                    v-model="username">
                  <div v-if="usernameError" class="invalid-feedback d-block">{{ usernameError }}</div>
                </div>
                <div class="col-md-6">
                  <label class="small mb-1" for="name">Name</label>
                  <input class="form-control" id="name" type="text" placeholder="Enter your  name" v-model="name">
                </div>
              </div>
              <div class="mb-3 text-start">
                <label class="small mb-1" for="email">Email address</label>
                <input class="form-control" id="email" type="email" placeholder="Enter your email address"
                  v-model="email">
                <div v-if="emailError" class="invalid-feedback d-block">{{ emailError }}</div>
              </div>
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
      emailError: '',
      file: ''
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
  watch: {
  file: function(newFile, oldFile) {
    if (!newFile) {
      return
    }
    if (!newFile.type.startsWith('image/')) {
      this.$nextTick(() => {
        this.file = null
        alert('Please upload an image file.')
      })
    } else if (newFile.size > 12 * 1024 * 1024) {
      this.$nextTick(() => {
        this.file = null
        alert('Please upload an image file smaller than 12MB.')
      })
    } else {
      this.onFileChange(newFile)
    }
  }
},

  methods: {
    onFileChange(newFile) {
      this.file = newFile
      const reader = new FileReader()
      reader.onload = () => {
        console.log('read the file and setting img')
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
        localStorage.setItem('user-info', JSON.stringify(response.data))
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

.profile-picture {
  width: 100px;
  /* height: 30%; */
  aspect-ratio: 1/1;
  object-fit: cover;
  position: relative;
  /* important is used so that this style is always applied regardless of other rules */
  border-radius: 50% !important;
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

/* active means it will apply the styles to elements that have both of these classes. */
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
</style>
