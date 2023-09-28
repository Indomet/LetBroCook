<template>
    <div class="d-flex flex-wrap" style="margin-inline-start: 4rem;">{{ trimArrayList(recipeData) }}
        <div v-for="(recipe) in recipeArray" :key="recipe.id" class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 d-flex"
            style="margin-bottom: 6rem; margin-right: -2rem;">
            <!--The card-->
            <div class="main-container">
                <div :class="{ 'flipped': recipe.flipped, 'flip-card': 'flip-card', 'w-100': 'w-100' }">
                    <!--Front side-->
                    <div class="front card flex-fill h-100" style="max-width: 20rem; border-radius: 1rem;
              background-image: linear-gradient(45deg, #d8e8dc 12.50%, #ffffff 12.50%, #ffffff 25%, #f0f0f0 25%, #f0f0f0 50%, #d8e8dc 50%, #d8e8dc 62.50%, #ffffff 62.50%, #ffffff 75%, #f0f0f0 75%, #f0f0f0 100%);
background-size: 40.00px 40.00px;">
                        <div @click="flipCard(recipe)" class="flip-button">Click to flip</div>
                        <img class="card-image" b-card-img-top :src="recipe.image" alt="Thumbnail Image">
                        <p class="card-title">{{ recipe.title }}</p>
                        <div>{{ trimTagList(recipe.tags) }}
                            <span v-for="(tag) in tagArray" :key="tag" class="tags">
                                {{ tag.name }}
                            </span>
                        </div>
                        <h5>{{ flipped }}</h5>
                    </div>
                    <!--Back side-->
                    <div class="back card flex-fill h-100" style="max-width: 20rem; border-radius: 1rem;
              background-image: linear-gradient(135deg, #d8e8dc 12.50%, #ffffff 12.50%, #ffffff 25%, #f0f0f0 25%, #f0f0f0 50%, #d8e8dc 50%, #d8e8dc 62.50%, #ffffff 62.50%, #ffffff 75%, #f0f0f0 75%, #f0f0f0 100%);
background-size: 40.00px 40.00px;">
                        <div @click="flipCard(recipe)" class="flip-button">Click to flip back</div>
                        <h5 class="card-description">{{ recipe.steps }}</h5>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    el: '#sgf',
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
        for (const recipe of this.recipeData) {
            recipe.flipped = false
        }
    },
    data() {
        return {
            recipeData: '',
            loading: true,
            error: false,
            title: 'Kitsune Chan',
            thumbnail: 'https://mangadex.org/covers/a914a65b-27ed-4665-9767-87396a00ea6b/9298804f-54e7-495e-afcb-70fdd7d25bf0.jpg',
            description: 'df',
            tags: ['tag1', 'tag22', 'tag333', 'tag4444', 'tag55555'],
            hasFlipped: false,
            recipeArray: [],
            tagArray: []
        }
    },
    methods: {
        flipCard(recipe) {
            for (const each of this.recipeArray) {
                if (each !== recipe) {
                    each.flipped = false
                }
            }
            recipe.flipped = !recipe.flipped
        },
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
.main-container {
    perspective: 1000px;
    position: relative;
    width: 40vh;
    height: 30vw;
}

.flip-card {
    position: absolute;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: all 0.5s ease-in-out;
}

.flipped {
    transform: rotateY(-180deg);
    scale: 1.5;
}

.front {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
}

.back {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
    background-color: aqua;
    transform: rotateY(180deg);
    overflow-y: scroll;
    z-index: 2;
}

.card-description {
    font-size: small;
}

.flip-button {
    width: 100%;
    height: 100%;
    position: absolute;
    cursor: pointer;
    outline-width: 1px;
    outline-color: black;
    outline-style: solid;
    opacity: 0;
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

.card-image:hover {
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
    margin: 5px;
    display: inline-block;
}

.tags:hover {
    background-color: rgb(96, 110, 219);
}
</style>
