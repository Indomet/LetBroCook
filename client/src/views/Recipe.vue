<template>
    <div class="d-flex flex-wrap">{{ trimArrayList(recipeData) }}
    <div v-for="(recipe) in recipeArray" :key="recipe.id"
    class="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 d-flex"
    style="margin-bottom: 4rem;">
        <!--The card-->
        <div class="main-container">
            <div :class="{ 'flipped': recipe.flipped, 'flip-card':'flip-card'}">
                <!--Front side-->
                <div class="front">
                    <button @click="flipCard(recipe)" class="btn flip-button">Click to flip</button>
                    <div class="card-body">
                        <h5 class="card-title">Front Side</h5>
                        <h5>{{ flipped }}</h5>
                    </div>
                </div>
                <!--Back side-->
                <div class="back">
                    <button @click="flipCard(recipe)" class="btn flip-button">Click to flip back</button>
                    <div class="card-body">
                        <h5 class="card-title">Back Side</h5>
                    </div>
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
            flipped: false,
            recipeArray: [],
            tagArray: []
        }
    },
    methods: {
        flipCard(recipe) {
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
    width: 200px;
    height: 300px;
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
}

.front {
    width: 100%;
    height: 100%;
    position: absolute;
    backface-visibility: hidden;
    background-color: bisque;
}
.back {
  width: 100%;
  height: 100%;
  position: absolute;
  backface-visibility: hidden;
  background-color: aqua;
  transform: rotateY(180deg);
}

.flip-button {
    width: 100%;
    height: 100%;
    position: inherit;
    cursor: pointer;
}
</style>
