<template>
    <div>
        <div class="d-flex flex-wrap">
            {{ mapArray(recipeData) }}
            <div v-for="[key, recipe] in recipeMap" :key="recipe._id" class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 d-flex"
                style="margin-bottom: 4rem;">
                <div class="main-container">
                <div :class="{ 'flipped': recipe.flipped, 'card': 'card', 'w-100': 'w-100'}" style="max-width: 20rem; border-radius: 1rem;
              background-image: linear-gradient(45deg, #d8e8dc 12.50%, #ffffff 12.50%, #ffffff 25%, #f0f0f0 25%, #f0f0f0 50%, #d8e8dc 50%, #d8e8dc 62.50%, #ffffff 62.50%, #ffffff 75%, #f0f0f0 75%, #f0f0f0 100%); background-size: 40.00px 40.00px;">
<h3>{{ recipe.flipped }}</h3>
                    <b-card-body class="front">
                        <img class="card-image" b-card-img-top :src="recipe.image" alt="Thumbnail Image">
                        <p class="card-title">{{ recipe.title }}</p>
                        <div class="tag-block">
                            <span v-for="tags in recipe.tags" :key="tags" class="tags">
                                {{ tags.name }}
                            </span>
                        </div>
                        <div @click="flipCard(key)" class="flip-button">More info</div>
                    </b-card-body>

                    <b-card-body class="back">
                        <h5 class="card-description">{{ recipe.steps }}</h5>
                        <div @click="flipCard(key)" class="flip-button">Back</div>
                    </b-card-body>
                </div>
            </div>
                </div>
            </div>
    </div>
</template>

<script scoped>
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
            tagArray: [],
            recipeMap: {}
        }
    },
    methods: {
        trimTagList(arr) {
            const end = 7 // Max number of tags to be shown
            let newArr = []
            if (arr.length > end) {
                newArr = arr.slice(0, end)
            }
            return newArr
        },
        mapArray(arr) {
            let newArr = []
            const end = 7
            const map = new Map()
            if (arr.length > end) {
                newArr = arr.slice(0, end)
            } else {
                newArr = arr
            }
            for (const each of newArr) {
                map.set(each._id, each)
            }
            this.recipeMap = map
        },
        flipCard(key) {
            const newValue = this.recipeMap.get(key)
            for (const [id, recipe] of this.recipeMap) {
                if (key !== id) {
                    recipe.flipped = false
                    this.recipeMap.set(id, recipe)
                }
            }
            newValue.flipped = !newValue.flipped
            this.recipeMap.set(key, newValue)
        }
    }

}
</script>

<style scoped>

.main-container {
    perspective: 1000px;
    position: relative;

}

.card {
    transform-style: preserve-3d;
    transition: all 0.5s ease-in-out;
}

.card:hover {
    outline-width: 3px;
    outline-color: rgb(255, 255, 255);
    outline-style: solid;
}

.flipped {
    transform: rotateY(-180deg);
}

.front {
    width: 100%;
    height: 100%;
    position: relative;
    backface-visibility: hidden;
}

.back {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
    transform: rotateY(180deg);
    z-index: 2;
    overflow-y: scroll;
}

.card-description {
    font-size: medium;
}

.flip-button {
    font-weight: bold;
    color: white;
    width: 50%;
    outline-width: 1px;
    outline-color: black;
    outline-style: solid;
    cursor: pointer;
    opacity: 50;
    border-radius: 1rem;
    background-color: inherit;
    background-color: rgb(0, 92, 163);
    position: static;
    margin-left: auto;
    margin-right: auto;
    margin-top: auto;
    margin-bottom: 0;
}

.flip-button:hover {
    outline-color: white;
    background-color: rgb(29, 130, 207);
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
    outline-color: rgb(245, 245, 245);
    outline-style: inset;
}

.tag-block {
    margin-bottom: 20px;
}
.tags {
    background-color: rgb(160, 182, 244);
    border-radius: 1rem;
    cursor: pointer;
    outline-width: 10%;
    outline-color: rgb(27, 18, 21);
    outline-style: solid;
    font-size: 14px;
    padding: 4px;
    margin: 5px;
    display: inline-block;
}

.tags:hover {
    background-color: rgb(96, 110, 219);
}

/* Scrollbar styling */

/* width */
::-webkit-scrollbar {
  width: 11px;
  margin-right: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #a2a2a2;
  border-radius: 1rem;
  margin-bottom: 1rem;
  margin-top: 1rem;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #8dcc91;
  border-radius: 1rem;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: #3a8e66;
}
</style>
