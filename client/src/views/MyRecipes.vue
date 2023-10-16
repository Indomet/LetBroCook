<template>
    <div>
        <div v-if=serverIsDown class="loading-icon">
            <p style="font-size: 2rem; font-weight: bold; text-align: center">
                Server is down
            </p>
        </div>
        <div v-else-if="recipeData.length <= 0 && loading" class="loading-icon">
            <i class="fas fa-spinner fa-spin"></i> Loading...
        </div>
        <div v-else-if="recipeData.length === 0 && !loading">
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
                        :recipe="recipe.recipe"
                        @flip-card="flipCard"
                        :recipeMap="recipeMap"
                        :recipeId="key"
                        :allowFavRecipe="false"
                        :DB_ID="recipe._id"
                        :allowDropdown="true"
                        :links="recipe.links"
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
            favedRecipes: [],
            numberOfRecipesToShow: 8,
            loading: true,
            serverIsDown: false
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll)
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        axios
            .get(`http://localhost:3000/v1/users/${userId}/recipes`)
            .then((response) => {
                this.recipeData = response.data.recipes
                console.log(this.recipeData)
                // console.log('recipe data is ' + JSON.stringify(this.recipeData))

                for (const recipe of this.recipeData) {
                    recipe.flipped = false
                }
                this.mapArray()
            })
            .catch((err) => {
                console.log(err)
                this.serverIsDown = true
            })
            .finally(() => {
                this.loading = false
            })
    },
    unmounted() {
        window.removeEventListener('scroll', this.handleScroll)
    },
    methods: {
        handleScroll(event) {
            if (
                window.innerHeight + Math.round(window.scrollY) >=
                document.body.offsetHeight - 2
            ) {
                console.log('bottom')
                this.loadMore()
            }
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
        trimCommentList(arr) {
            const maxNumberOfComments = 10 // Max number of tags to be shown
            let newArr = []
            if (arr.length > maxNumberOfComments) {
                newArr = arr.slice(0, maxNumberOfComments)
                return newArr
            }
            return arr
        },
        mapArray() {
            this.adjustMap(this.numberOfRecipesToShow)
        },
        loadMore() {
            this.numberOfRecipesToShow += 4
            this.adjustMap(this.numberOfRecipesToShow)
        },
        adjustMap(maxNumberOfRecipes) {
            let newArr = []
            const map = new Map()
            if (this.recipeData.length > maxNumberOfRecipes) {
                newArr = this.recipeData.slice(0, maxNumberOfRecipes)
            } else {
                newArr = this.recipeData
            }
            for (const each of newArr) {
                each.recipe.tags = this.trimTagList(each.recipe.tags)
                each.recipe.comments = this.trimCommentList(each.recipe.comments)
                newArr.forEach(each => {
        map.set(each.recipe._id, each)
    })
            }

            this.recipeMap = map
        }
    }
}
</script>
