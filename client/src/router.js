import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Recipes from './views/Recipes.vue'
import Login from './views/Login.vue'
import Signup from './views/Signup.vue'
import CreateRecipe from './views/CreateRecipe.vue'
import EditRecipe from './views/EditRecipe.vue'
import FavoriteRecipes from './views/FavoriteRecipes.vue'
import MyRecipes from './views/MyRecipes.vue'
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
      path: '/CreateRecipe',
      name: 'CreateRecipe',
      component: CreateRecipe
    },
    {
      path: '/EditRecipe/',
      name: 'EditRecipe',
      component: EditRecipe
    },
    {
      path: '/recipes',
      name: 'recipes',
      component: Recipes
    },
    {
      path: '/FavoriteRecipes',
      name: 'FavoriteRecipes',
      component: FavoriteRecipes
    },
    {
      path: '/MyRecipes',
      name: 'MyRecipes',
      component: MyRecipes
    }
  ]
})
