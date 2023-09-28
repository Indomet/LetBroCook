import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import RecipeCard from './views/Recipe.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import Test from './views/Test.vue'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/recipes',
        name: 'recipes',
        component: RecipeCard
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },
    {
        path: '/test',
        name: 'test',
        component: Test
    }
    ]
})
