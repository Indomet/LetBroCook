<template>
  <div>
    <b-jumbotron header="DIT342 Frontend" lead="Welcome to your DIT342 Frontend Vue.js App">
      <b-button class="btn_message" variant="primary" v-on:click="getMessage()" >Get Message from Server</b-button>
      <p v-if="user">Message from the server:<br/>
      {{ message }}</p>
    </b-jumbotron>
  </div>
</template>

<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'home',
  // data() {
  //   return {
  //     user: null
  //   }
  // },
  // async created() {
  //   const response = await Api.post('http://localhost:3000/v1/users/sign-in')
  //   console.log(response)
  //   this.user = response.data
  // },
  methods: {
    getMessage() {
      Api.get('/')
        .then(response => {
          this.message = response.data.message
        })
        .catch(error => {
          this.message = error
        })
    }
  }
}
</script>

<style>
.btn_message {
  margin-bottom: 1em;
}
</style>
