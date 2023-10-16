<template>
    <div>
        <div v-if=serverIsDown class="loading-icon">
            <p style="font-size: 2rem; font-weight: bold; text-align: center">
                Server is down
            </p>
        </div>
        <div v-else-if="loading || isSearching" class="loading-icon">
      <i class="fas fa-spinner fa-spin"></i> Loading...
    </div>
    <div v-else-if="recipeData.length===0 && !loading">
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
            isSearching: false,
            noRecipes: false,
            serverIsDown: false
        }
    },
    async mounted() {
        window.addEventListener('scroll', this.handleScroll)

        this.$emitter.on('search', (data) => {
            this.isSearching = true
            if (data) {
                this.isSearching = true
                const searchQuery = data.searchQuery
                const tagNames = data.tags.map(tag => tag.name)
                const tagString = tagNames.map(tag => `tags=${tag}`).join('&') // &tags=${tagString}
                const url = `http://localhost:3000/v1/recipes?${tagString}&title=${searchQuery}`
                this.fetchData(url) // Call fetchData method to r3efresh data
            }
        })
        // fetch all recipes
        this.fetchData('http://localhost:3000/v1/recipes') // Call fetchData method to fetch data on component mount
        console.log(this.recipeMap)
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
        fetchData(url) {
            axios
                .get(url)
                .then((response) => {
                    this.recipeData = response.data.recipes
                    console.log(this.recipeData)
                    if (this.recipeData.length === 0) {
                        this.noRecipes = true
                    }
                    for (const recipe of this.recipeData) {
                        recipe.flipped = false
                    }
                    this.mapArray()
                })
                .catch((err) => {
                    console.log(err)
                    console.log('error loading server down')
                    this.serverIsDown = true
                })
                .finally(() => {
                    this.loading = false
                    if (this.isSearching) {
                        this.isSearching = false
                    }
                })
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
                    })
                    .catch((err) => {
                        this.serverIsDown = true
                        console.log(err)
                    })
            }
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

@media (max-width: 576px) {
  .d-flex.flex-wrap {
    display: flex !important;
    flex:none !important;
    flex-wrap: wrap !important;
    justify-content: center !important; /* Center the cards horizontally */

    align-items: center; /* Center the cards vertically */

  }
}

</style>
