<template>
    <div id="card">
        <div v-for="(recipe, i) in recipeData" v-bind:key="recipe.id">
            <div v-if="i < 20">
                <div class="main grid">
                    <img class="thumbnail" v-bind:src='recipe.image' alt="Thumbnail Image">
                    <p class="title">{{ recipe.title }}</p>
                    <div v-for="(tag, j) in recipe.tags" v-bind:key="tag">
                        <div v-if="j < 5">
                            <div class="tags">{{ tag.name }}</div>
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
    },
    data() {
        return {
            recipeData: '',
            loading: true,
            error: false,
            title: 'Kitsune Chan',
            thumbnail: 'https://mangadex.org/covers/a914a65b-27ed-4665-9767-87396a00ea6b/9298804f-54e7-495e-afcb-70fdd7d25bf0.jpg',
            description: 'df',
            tags: ['tag1', 'tag22', 'tag333', 'tag4444', 'tag55555']
        }
    }
}
</script>

<style>
</style>
