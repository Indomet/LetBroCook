<template>
    <div>
        <div v-if="recipeData.length === 0">
            <p style="font-size: 2rem; font-weight: bold; text-align: center">
                No recipes found
            </p>
        </div>
        <div v-else>
            <div class="d-flex flex-wrap">
                <div
                    v-for="[key, recipe] in recipeMap"
                    :key="recipe._id"
                    class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 d-flex"
                    style="margin-bottom: 4rem"
                >
                        <Card
                            :recipe="recipe"
                            @flip-card="flipCard"
                            :recipeMap="recipeMap"
                            :id="key"
                            :allowFavRecipe="true"
                            :DB_ID="recipe._id"
                            :isFaved="this.favedRecipes.includes(recipe._id)"
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
        this.$emitter.on('recommendation', (data) => {
            this.getRecommendation()
        })

        this.$emitter.on('search', (data) => {
            if (data) {
                const searchQuery = data.searchQuery
                const tagNames = data.tags.map(tag => tag.name)
                const tagString = tagNames.map(tag => `tags=${tag}`).join('&') // &tags=${tagString}
                // console.log(tagString)
                const url = `http://localhost:3000/v1/recipes?${tagString}&title=${searchQuery}`
                this.fetchData(url) // Call fetchData method to refresh data
            }
        })
        // fetch all recipes
        this.fetchData('http://localhost:3000/v1/recipes') // Call fetchData method to fetch data on component mount
    },
    methods: {
        fetchData(url) {
            axios
                .get(url)
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
            axios
                .get(
                    `http://localhost:3000/v1/users/${userId}/favorite-recipes`
                )
                .then((response) => {
                    this.favedRecipes = response.data.favouriteRecipes.map(
                        (recipe) => recipe._id
                    )
                    console.log(this.favedRecipes)
                })
                .catch((err) => {
                    console.log(err)
                })
        },
        getRecommendation() {
            const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        axios.get(`http://localhost:3000/v1/users/${userId}/favorite-recipes`).then(async (response) => {
            const favedRecipesIds = response.data.favouriteRecipes.map((recipe) => recipe._id).filter((id) => id)
            const recipeParams = favedRecipesIds.map((id) => `recipe=${id}`).join('&')
            await axios.get('http://localhost:8000?' + recipeParams).then((response) => {
                this.recipeData = response.data
                for (const recipe of this.recipeData) {
                        recipe.flipped = false
                    }
                    this.mapArray()
                })
        }).catch((err) => {
            console.log(err)
        })
        },
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
