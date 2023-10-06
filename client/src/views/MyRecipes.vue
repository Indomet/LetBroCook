<template>
    <div>
        <div class="d-flex flex-wrap">
            <div v-for="[key, recipe] in recipeMap" :key="recipe._id"
                class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 d-flex" style="margin-bottom: 4rem;">
                <div class="main-container w-100 test">
                    <Card :recipe="recipe" @flip-card="flipCard" :recipeMap="recipeMap" :id="key" :allowFavRecipe="false" :DB_ID="recipe._id"
                    :allowDropdown="true"
                    ></Card>
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
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        axios.get(`http://localhost:3000/v1/users/${userId}/recipes`)
            .then((response) => {
                this.recipeData = response.data.recipes
                console.log('recipe data is ' + JSON.stringify(this.recipeData))

                for (const recipe of this.recipeData) {
                    recipe.flipped = false
                }
                this.mapArray()
                // console.log('recipe map is: ' + JSON.stringify(this.recipeMap))
            })
            .catch((err) => {
                console.log(err)
                this.error = true
            })
            .finally(() => {
                this.loading = false
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
    console.log('new arr recipe is: ' + JSON.stringify(newArr))
    // console.log('newArr is: ' + JSON.stringify(newArr))
    for (const each of newArr) { // recipe,link {recipe: recipe, link: link}
        each.tags = this.trimTagList(each.tags)
        // console.log('each is: ' + JSON.stringify(each))
        map.set(each._id, each)
    }
    this.recipeMap = map
    // console.log('map is: ' + [map.values()])
}
    }

}
</script>
