<template>
    <div :class="{ 'flipped': recipe.flipped, 'card': 'card', 'h-100': 'h-100', 'flex-fill': 'flex-fill' }"
        style="max-width: 20rem; border-radius: 1rem;
              background-image: linear-gradient(45deg, #d8e8dc 12.50%, #ffffff 12.50%, #ffffff 25%, #f0f0f0 25%, #f0f0f0 50%, #d8e8dc 50%, #d8e8dc 62.50%, #ffffff 62.50%, #ffffff 75%, #f0f0f0 75%, #f0f0f0 100%); background-size: 40.00px 40.00px;">
        <b-card-body class="front">
            <img class="card-image" b-card-img-top :src="recipe.image" alt="Thumbnail Image">
            <p class="card-title">{{ recipe.title }}</p>
            <div class="tag-block">
                <span v-for="tags in recipe.tags" :key="tags" class="tags" style="margin-bottom: 20px;">
                    {{ tags.name }}
                </span>
            </div>
            <div class="button-container">
        <div @click="flipCard(id)" class="flip-button">More info</div>
        <div v-if="allowFavRecipe" id='heart' class='button'
     :class="{ 'active': isFaved }" @click="addToFavs"></div>
    </div>

        </b-card-body>

        <b-card-body class="back">
            <h2 class="info-header">Ingredients:</h2>
            <ul v-for="(ingredient, index) in recipe.sectionsAndIngredients.Ingredients" :key="index">
                <li class="bullet-point">
                    <h5>{{ ingredient }}</h5>
                </li>
            </ul>
            <h2 class="info-header">Steps:</h2>
            <div v-for="(step, index) in recipe.steps" :key="index">
                <h5>{{ index + 1 }}. {{ step }}</h5>
            </div>
            <h2 class="info-header">Nutritional Info:</h2>
            <div v-if="recipe.nutritionalInfo.length">
                <ul v-for="(nutrition, index) in recipe.nutritionalInfo" :key="index">
                    <li class="bullet-point">
                        <h5>{{ nutrition }}</h5>
                    </li>
                </ul>
            </div>
            <div class="no-nut-info" v-else>No nutritional data.</div>
            <h4 class="serving-text">Serving size: {{ recipe.servings }}</h4>
            <div @click="flipCard(id)" class="flip-button">Back</div>
            <h2>Comments TBD</h2>
        </b-card-body>
    </div>
</template>

<script>
import mojs from '@mojs/core'
import $ from 'jquery'
import axios from 'axios'

export default {
    name: 'Card',
    async mounted() {
        $(document).ready(function () {
            const timeline = new mojs.Timeline()

            $('.button').click(function () {
                if ($(this).hasClass('active')) {
                    $(this).removeClass('active')
                } else {
                    timeline.play()
                    $(this).addClass('active')
                }
            })
        })
    },
    props: {
        id: Number,
        recipe: Object,
        recipeMap: Map,
        allowFavRecipe: Boolean,
        DB_ID: String,
        isFaved: Boolean
    },
    methods: {
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
        },
        addToFavs(e) {
            console.log(window.location.href)
            const user = JSON.parse(localStorage.getItem('user-info'))
            const userId = user.body._id
                if (!$(e.currentTarget).hasClass('active')) {
                    // console.log('removed to fav')
                    axios.post(`http://localhost:3000/v1/users/${userId}/recipes/${this.DB_ID}/favorite-recipes`).then((response) => {
                        console.log(response)
                    }).catch((err) => {
                        console.log(err)
                    })
                } else {
                    axios.delete(`http://localhost:3000/v1/users/${userId}/recipes/${this.DB_ID}/favoriteDeletion`).then((response) => {
                        console.log(response)
                        if (window.location.href === 'http://localhost:8080/favoriterecipes') {
                            window.location.reload()
                        }
                    }).catch((err) => {
                        console.log(err)
                    })
            }
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
    scale: 1.1;
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
    bottom: 0;
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

.info-header {
    font-weight: bold;
}

.serving-text {
    text-align: left;
    font-size: medium;
    font-weight: bold;
}

.no-nut-info {
    font-size: medium;
    font-weight: bold;
}

.bullet-point {
    text-align: left;
}

ul {
    margin-top: 0px;
    margin-bottom: 0px;
}

h5 {
    font-size: 18px;
}

.button {
    position: absolute;
    bottom: 0;
    right: 0;
    border-radius: 5px;
    background: none;
    cursor: pointer;
}

.active#heart:before,
.active#heart:after {
    background: red !important;
}

#heart {
    width: 50px; /* reduce the width */
    height: 45px; /* reduce the height */
}

#heart:before,
#heart:after {
    transition: background 0.5s ease;
    position: absolute;
    content: "";
    left: 25px; /* adjust the position */
    top: 0;
    width: 25px; /* adjust the width */
    height: 40px; /* adjust the height */
    background: dimgrey;
    border-radius: 25px 25px 0 0; /* adjust the border-radius */
    transform: rotate(-45deg);
    transform-origin: 0 100%;
}

#heart:after {
    left: 0;
    transform: rotate(45deg);
    transform-origin: 100% 100%;
}
.button-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    padding: 10px; /* Add padding if necessary */
}
</style>
