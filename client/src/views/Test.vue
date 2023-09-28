<template>
    <div>
        <div class="d-flex flex-wrap">
            {{ trimArrayList(recipeData) }}
          <div
            v-for="(recipe, i) in recipeArray"
            :key="recipe.id"
            class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 d-flex"
            style="margin-bottom: 4rem;"
          >
            <div v-if="i < 20" class="w-100">
              <div class="card flex-fill h-100" style="max-width: 20rem; border-radius: 1rem;
              background-image: linear-gradient(45deg, #d8e8dc 12.50%, #ffffff 12.50%, #ffffff 25%, #f0f0f0 25%, #f0f0f0 50%, #d8e8dc 50%, #d8e8dc 62.50%, #ffffff 62.50%, #ffffff 75%, #f0f0f0 75%, #f0f0f0 100%);
background-size: 40.00px 40.00px;"
              >
                <b-card-body>
                    <img class="card-image" b-card-img-top :src="recipe.image" alt="Thumbnail Image">
                    <p class="card-title">{{ recipe.title }}</p>
                    <div>{{ trimTagList(recipe.tags) }}
                        <span v-for="(tag) in tagArray" :key="tag" class="tags">
                            {{ tag.name }}
                        </span>
                    </div>
                </b-card-body>
              </div>
            </div>
          </div>
        </div>
    </div>
  </template>

<script>
import axios from 'axios'
export default {
    el: 'sgrgdfsf',
    mounted() {
        axios.get('http://localhost:3000/v1/recipes')
        .then((response) => {
            this.recipeData = response.data.recipes
        })
        .catch((err) => {
            console.log(err)
            this.error = true
        })
        .finally(() => {
            this.loading = false
        })
    },
    data() {
        return {
            recipeData: '',
            loading: true,
            error: false,
            tagArray: [],
            recipeArray: []
        }
    },
    methods: {
        trimTagList(arr) {
            const end = 7 // Max number of tags to be shown
            if (arr.length > end) {
                const newArr = arr.slice(0, end)
                this.tagArray = newArr
            }
        },
        trimArrayList(arr) {
            const end = 7 // Max number of tags to be shown
            if (arr.length > end) {
                const newArr = arr.slice(0, end)
                this.recipeArray = newArr
            }
        }
    }
}
</script>

<style scoped>
.main{
    min-height: 30vw;
    width: 20vw;
    margin-left: 10%;
    margin-top: 5%;
    background-color: antiquewhite;
    outline-width: 0.13vw;
    outline-color: rgb(159, 159, 159);
    outline-style:solid;
    border-radius: 1rem;
    float: left;
    clear: none;
    text-align: center;
    position: center;
    grid-row: 3;
}

.card {
    background-color: antiquewhite;
    transition: 0.3s;
    border-radius: 1rem;
    margin-inline-start: 20px;
}

.card:hover {
    transform: scale(1.1);
    outline-width: 0.13vw;
    outline-style:solid;
    outline-color: rgb(22, 22, 22);
}

.card-title {
    text-align: left;
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
    font-weight: bold;
    font-size: x-large;
    margin-left: 3%;
    margin-right: 5%;
}

.card-title:hover {
    text-decoration: underline black;
}

.card-image {
    margin-top: auto;
    width: 100%;
    aspect-ratio: 1/1;
    object-fit: cover;
    object-position: center;
    border-radius: 1rem;
    position: relative;
}

.card-image:hover{
    outline-width: 0.13vw;
    outline-color: rgb(27, 18, 21);
    outline-style: inset;
}

.tags {
    background-color: rgb(160, 182, 244);
    border-radius: 1rem;
    cursor: pointer;
    outline-width: 10%;
    outline-color: rgb(27, 18, 21);
    outline-style: solid;
    font-size: 16px;
    padding: 4px;
    margin:5px;
    display: inline-block;
}
.tags:hover {
    background-color: rgb(96, 110, 219);
}

</style>
