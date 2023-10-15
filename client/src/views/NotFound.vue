<template>
  <div style="margin-top: 70px; text-align: center;">
    <h1>404 - Page Not Found</h1>
    <p>This page does not exist. Please check the URL and try again.</p>
    <img src="../assets/LetBroCook.jpg" alt="LetBroCook" />
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>

<style scoped>
img {
  max-width: 430px;
  display: block;
  margin: 0 auto;
  margin-top: 20px;
}

@media screen and (max-width: 375px) {
  img{
    max-width: 75%;
  }
}
</style>
