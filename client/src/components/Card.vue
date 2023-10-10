<template>
    <div class="main-container  w-100">
        <div :class="{
            flipped: recipe.flipped,
            card: 'card',
            'h-100': 'h-100',
            'flex-fill': 'flex-fill'
        }" style="
            max-width: 20rem;
            border-radius: 1rem;
            background-image: linear-gradient(
                45deg,
                #d8e8dc 12.5%,
                #ffffff 12.5%,
                #ffffff 25%,
                #f0f0f0 25%,
                #f0f0f0 50%,
                #d8e8dc 50%,
                #d8e8dc 62.5%,
                #ffffff 62.5%,
                #ffffff 75%,
                #f0f0f0 75%,
                #f0f0f0 100%
            );
            background-size: 40px 40px;
        ">
            <b-card-body class="front">
                <img class="card-image" b-card-img-top :src="recipe.image" alt="Thumbnail Image" />
                <p class="card-title">{{ recipe.title }}</p>
                <div class="tag-block">
                    <span v-for="tags in recipe.tags" :key="tags" class="tags" style="margin-bottom: 20px" @click="filterByTag(tags)">
                        {{ tags.name }}
                    </span>
                </div>
                <div class="button-container">
                    <div @click="flipCard(id)" class="flip-button">More info</div>
                    <div v-if="allowFavRecipe" id="heart" class="button" :class="{ active: faved }" @click="addToFavs">
    <i class="fa fa-heart"></i>
</div>
                    <div class="wrapper" v-if="allowDropdown">
                        <div class="btn-group dropup">
                            <button type="button" class="btn btn-secondary dropdown-toggle optionsBTN"
                                data-bs-toggle="dropdown" aria-expanded="false">
                                Options
                            </button>
                            <ul class="dropdown-menu">
                                <button type="button" @click="editOrDelete('edit')" class="btn btn-outline-secondary"
                                    style="width: 95px; border-radius: 0px; text-align: left;">Edit</button>
                                <button class="noselect" id="deleteBTN" @click="editOrDelete('delete')"><span
                                        class="text">Delete</span><span class="icon"><svg xmlns="http://www.w3.org/2000/svg"
                                            width="24" height="24" viewBox="0 0 24 24">
                                            <path
                                                d="M24 20.188l-8.315-8.209 8.2-8.282-3.697-3.697-8.212 8.318-8.31-8.203-3.666 3.666 8.321 8.24-8.206 8.313 3.666 3.666 8.237-8.318 8.285 8.203z">
                                            </path>
                                        </svg></span></button>
                            </ul>
                        </div>
                    </div>
                </div>
            </b-card-body>

            <b-card-body class="back">
                <h2 class="info-header">Ingredients:</h2>
                <ul v-for="(ingredient, index) in recipe.sectionsAndIngredients
                    .Ingredients" :key="index">
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
    </div>
</template>

<script>
import mojs from '@mojs/core'
import $ from 'jquery'
import axios from 'axios'

export default {
  name: 'Card',
    props: {
        id: Number,
        recipe: Object,
        recipeMap: Map,
        allowFavRecipe: Boolean,
        allowDropdown: Boolean,
        DB_ID: String,
        isFaved: Boolean,
        links: Array
    },
    data() {
        return {
            faved: this.isFaved
        }
    },
    methods: {
flipCard(key) {
    let newValue
    const isInMyRecipes = window.location.href.toLowerCase().includes('myrecipes')
    let recipeLinks
    if (isInMyRecipes) {
        newValue = this.recipeMap.get(key).recipe
        recipeLinks = this.recipeMap.get(key).links
    } else {
        newValue = this.recipeMap.get(key)
    }
    for (const [id, recipe] of this.recipeMap) {
        if (key !== id) {
            if (isInMyRecipes) {
                recipe.recipe.flipped = false
            } else {
                recipe.flipped = false
            }
            this.recipeMap.set(id, recipe)
        }
    }
    newValue.flipped = !newValue.flipped
    if (isInMyRecipes) {
        this.recipeMap.set(key, { recipe: newValue, links: recipeLinks })
    } else {
        this.recipeMap.set(key, newValue)
    }
},
        editOrDelete(operation) {
            const link = this.links.find(link => link.rel === operation)
            if (operation === 'edit') {
                this.$router.push(link.href)
            } else if (operation === 'delete') {
                axios.delete(link.href)
                    .then((response) => {
                        window.location.reload()
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            } else {
                console.log('No edit link found')
            }
        },
        addToFavs(e) {
            const user = JSON.parse(localStorage.getItem('user-info'))
            const userId = user.body._id
            if (this.faved === false) {
                const timeline = new mojs.Timeline()
                timeline.play()
                // eslint-disable-next-line vue/no-mutating-props
                this.faved = true
                $(this).addClass('active')
                axios
                    .post(
                        `http://localhost:3000/v1/users/${userId}/recipes/${this.DB_ID}/favorite-recipes`
                    )
                    .then((response) => {
                        this.faved = true
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            } else {
                axios
                    .delete(
                        `http://localhost:3000/v1/users/${userId}/recipes/${this.DB_ID}/favoriteDeletion`
                    )
                    .then((response) => {
                        this.faved = false
                        $(this).removeClass('active')
                        if (
                            window.location.href.toLowerCase() ===
                            'http://localhost:8080/favoriterecipes'
                        ) {
                            window.location.reload()
                        }
                    })
                    .catch((err) => {
                        console.log(err)
                    })
            }
        },
        filterByTag(selectedTag) {
        console.log(selectedTag)
     if (this.$router.currentRoute.name !== 'recipes') {
    this.$router.push({ name: 'recipes' })
  }
  setTimeout(() => {
    const tag = [selectedTag]
    this.$emitter.emit('search', { tags: tag, searchQuery: '' })
  }, 500)
}

}
}
</script>

<style scoped>
.dropdown-menu {
    min-width: 95px !important;
}

.btn.dropdown-toggle {
    padding: 5px 10px;
    /* Adjust the padding to make the button smaller */
    font-size: 14px;
    /* Adjust the font size to make the text smaller */
}

.dropdown-item {
    padding: 5px 10px;
    /* Adjust the padding for each dropdown item */
    font-size: 14px;
    /* Adjust the font size for each dropdown item */
    font-family: Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

.main-container {
    perspective: 1000px;
    position: relative;
}

.card {
    transform-style: preserve-3d;
    transition: all 0.5s ease-in-out;
    -webkit-font-smoothing: subpixel-antialiased;
}

.card:hover {
    outline-width: 3px;
    outline-color: rgb(255, 255, 255);
    outline-style: solid;
    scale: 1.098;
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
    background-image: linear-gradient(to right, #3bf053, #12b012);
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

.dropdown-menu {
    margin: 0;
    padding: 0;
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
    background-image: linear-gradient(to right, #ccc8c8, #929792);
    border-radius: 1rem;
    cursor: pointer;
    outline-width: 2px;
    outline-color: rgb(27, 18, 21);
    outline-style: solid;
    font-size: 14px;
    padding: 4px;
    margin: 5px;
    display: inline-block;
}

.tags:hover {
    background-image: linear-gradient(to right, #4dd025, #1eb93f);
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
    width: 50px;
    /* reduce the width */
    height: 45px;
    /* reduce the height */
}

#heart:before,
#heart:after {
    transition: background 0.5s ease;
    position: absolute;
    content: '';
    left: 25px;
    /* adjust the position */
    top: 0;
    width: 25px;
    /* adjust the width */
    height: 40px;
    /* adjust the height */
    background: dimgrey;
    border-radius: 25px 25px 0 0;
    /* adjust the border-radius */
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
    padding: 10px;
    /* Add padding if necessary */
}

#deleteBTN {
    width: 95px;
    height: 40px;
    cursor: pointer;
    display: flex;
    align-items: center;
    background: red;
    border: none;
    box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.15);
    background: #e62222;
}

button,
button span {
    transition: 200ms;
}

button .text {
    text-align: left !important;
    transform: none;
    color: white;
    font-weight: bold;
}

button .icon {
    opacity: 0;
    position: relative;
    border-left: 1px solid #c41b1b;
    transform: translateX(80px);
    height: 40px;
    width: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
}

button svg {
    width: 15px;
    fill: #eee;
}

#deleteBTN:hover {
    background: #ff3636;
}

#deleteBTN:hover .icon {
    opacity: 1;
    /* Show the icon on hover */
    transform: translateX(-55%);
    /* Move the icon to the center horizontally */
}

button:hover .text {
    color: transparent;
}

button:hover .icon {
    width: 150px;
    border-left: none;
    transform: translateX(0);
}

button:focus {
    outline: none;
}

button:active .icon svg {
    transform: scale(0.8);
}

.optionsBTN {
    width: 95px;
    background-color: rgb(167, 165, 165);
}

.wrapper {
    margin-bottom: -1.5px !important;
}
</style>
