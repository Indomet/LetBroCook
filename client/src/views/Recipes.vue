<template>
    <div>
        <div class="d-flex flex-wrap">
            <div v-for="[key, recipe] in recipeMap" :key="recipe._id"
                class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 d-flex" style="margin-bottom: 4rem;">
                <div class="main-container w-100 test">
                    <Card :recipe="recipe" @flip-card="flipCard" :recipeMap="recipeMap" :id="key" :allowFavRecipe="true" :DB_ID="recipe._id"
                    :allowDropdown="false"
                    :isFaved="this.favedRecipes.includes(recipe._id)"></Card>
                </div>
            </div>
        </div>
    </div>
</template>

<script scoped>
import axios from 'axios'
import Card from '../components/Card.vue'

export default {
    el: '#sgf',
    components: {
        Card
    },
    data() {
        return {
            recipeData: [],
            recipeMap: {},
            favedRecipes: []
        }
    },
    mounted() {
        axios.get('http://localhost:3000/v1/recipes')
            .then((response) => {
                this.recipeData = response.data.recipes
                for (const recipe of this.recipeData) {
                    recipe.flipped = false
                }
                this.mapArray()
            })
            .catch((err) => {
                console.log(err)
                this.error = true
            })
            .finally(() => {
                this.loading = false
            })
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        axios.get(`http://localhost:3000/v1/users/${userId}/favorite-recipes`).then((response) => {
            this.favedRecipes = response.data.favouriteRecipes.map(recipe => recipe._id)
            console.log(this.favedRecipes)
        }).catch((err) => {
            console.log(err)
        })
    },
    methods: {
        trimTagList(arr) {
            const maxNumberOfTags = 3 // Max number of tags to be shown
            let newArr = []
            if (arr.length > maxNumberOfTags) {
                newArr = arr.slice(0, maxNumberOfTags)
                return newArr
            }
            return arr
        },
        mapArray() {
            let newArr = []
            const maxNumberOfRecipes = 7
            const map = new Map()
            if (this.recipeData.length > maxNumberOfRecipes) {
                newArr = this.recipeData.slice(0, maxNumberOfRecipes)
            } else {
                newArr = this.recipeData
            }
            for (const each of newArr) {
                each.tags = this.trimTagList(each.tags)
                map.set(each._id, each)
            }
            this.recipeMap = map
        }
    }

}
</script>
