<template>
    <div>
        <div v-if="recipeData.length<=0 || isSearching" class="loading-icon">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>
    <div v-else-if="recipeData.length === 0">
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
              :recipeId="key"
              :allowFavRecipe="true"
              :DB_ID="recipe._id"
              :isFaved="favedRecipes.includes(recipe._id)"
            ></Card>
          </div>
    </div>
      </div>
</div>
  </template>

<script scoped>
import { ref } from 'vue'
import axios from 'axios'
import Card from '../components/Card.vue'
export default {
    el: '#sgf',
    components: {
        Card
    },
    setup() {
        const user = ref(localStorage.getItem('user-info'))
        return {
            user
        }
    },
    watch: {
        '$route'() {
            this.user = localStorage.getItem('user-info')
        }
    },
    data() {
        return {
            recipeData: [],
            recipeMap: {},
            favedRecipes: [],
            numberOfRecipesToShow: 8,
            loading: true,
            isAtBottom: false,
            isSearching: false
        }
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll)

        this.$emitter.on('search', (data) => {
            this.isSearching = true
            console.log('is sarching is ' + this.isSearching)
            if (data) {
                this.isSearching = true
                const searchQuery = data.searchQuery
                const tagNames = data.tags.map(tag => tag.name)
                const tagString = tagNames.map(tag => `tags=${tag}`).join('&') // &tags=${tagString}
                // console.log(tagString)
                const url = `http://localhost:3000/v1/recipes?${tagString}&title=${searchQuery}`
                this.fetchData(url) // Call fetchData method to refresh data
            }
        })
        // fetch all recipes
        this.getRecommendation() // Call fetchData method to fetch data on component mounted
        const user = JSON.parse(localStorage.getItem('user-info'))
            if (user) {
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
            }
        this.loading = false
    },
    unmounted () {
    window.removeEventListener('scroll', this.handleScroll)
  },
    methods: {
        handleScroll (event) {
            if ((window.innerHeight + Math.round(window.scrollY)) >= document.body.offsetHeight - 2) {
        console.log('bottom')
        this.loadMore()
    }
        },
        getRecommendation() {
            const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        axios.get(`http://localhost:3000/v1/users/${userId}/favorite-recipes`).then(async (response) => {
            const favedRecipesIds = response.data.favouriteRecipes.map((recipe) => recipe._id).filter((id) => id)
            const recipeParams = favedRecipesIds.map((id) => `recipe=${id}`).join('&')
            await axios.get('http://localhost:8000?' + recipeParams).then((response) => {
                this.recipeData = response.data
                console.log(this.recipeData)
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
            const maxNumberOfTags = 4 // Max number of tags to be shown
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
            this.numberOfRecipesToShow += 8
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
                each.tags = this.trimTagList(each.tags)
                each.comments = this.trimCommentList(each.comments)
                map.set(each._id, each)
            }
            this.recipeMap = map
        }
    }
}
</script>

<style>
.loading-icon {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3rem;
}
</style>
