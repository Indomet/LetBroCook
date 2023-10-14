<template>
  <CreateRecipe ref="createRecipeComponent"
  />
</template>

<script scoped>
import CreateRecipe from './CreateRecipe.vue'
import axios from 'axios'

function splitToArray(str) {
  if (typeof str === 'string') {
    // If input is already a string, split it by newline characters
    return str.split(/\r?\n/)
  } else if (str !== undefined && str !== null) {
    // If input is a Proxy(Array) object, extract its values and join them into a string
    const values = Object.values(str)
    const string = values.join(',')
    // Split the string by comma and newline characters
    return string.split(/,\s*\n|\n/)
  }
}
export default {
  name: 'EditRecipe',
  async mounted() {
    const id = this.$route.params.id
    const response = await axios(`http://localhost:3000/v1/recipes/${id}`)
    const recipeData = response.data.recipe
    const createRecipeComponent = this.$refs.createRecipeComponent
    createRecipeComponent.steps = recipeData.steps
    createRecipeComponent.title = recipeData.title
    createRecipeComponent.description = recipeData.description
    createRecipeComponent.servings = recipeData.servings
    createRecipeComponent.nutritionalInfo = recipeData.nutritionalInfo
    createRecipeComponent.ingredients = recipeData.sectionsAndIngredients.Ingredients
    createRecipeComponent.url = recipeData.image
    createRecipeComponent.selectedTags = recipeData.tags
    console.log('THE SELCTED TAGS ARE ON MOUNTED' + JSON.stringify(createRecipeComponent.selectedTags))
    const submitRecipeBtn = createRecipeComponent.$refs.submitRecipeBtn
    submitRecipeBtn.textContent = 'Update Recipe'
    const header = createRecipeComponent.$refs.header
    header.textContent = 'Update Your Recipe'
    const headerDesc = createRecipeComponent.$refs.headerDesc
    headerDesc.textContent = 'Want to update your recipe? Fill in the form below and click the button to update your recipe!'
    createRecipeComponent.submitRecipe = async () => {
      if (
        createRecipeComponent.title === '' ||
        createRecipeComponent.description === '' ||
        createRecipeComponent.ingredients === '' ||
        createRecipeComponent.steps === '' ||
        createRecipeComponent.servings === '' ||
        createRecipeComponent.url === ''
      ) {
        alert('Please fill in all fields and upload an image')
      } else {
        const selectedTagNames = createRecipeComponent.selectedTags.map(tag => tag.name)
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        console.log('THE BEFORE SUBMIT SELCTED names TAGS ARE ON SUBMIT' + JSON.stringify(selectedTagNames))
        const recipeData = {
          title: createRecipeComponent.title,
          image: createRecipeComponent.url,
          sectionsAndIngredients: {
            Ingredients: splitToArray(createRecipeComponent.ingredients)
          },
          servings: createRecipeComponent.servings,
          description: createRecipeComponent.description,
          steps: splitToArray(createRecipeComponent.steps),
          tags: selectedTagNames,
          nutritionalInfo: splitToArray(createRecipeComponent.nutritionalInfo)
        }

        console.log(recipeData)
        await axios.patch(`http://localhost:3000/v1/users/${userId}/recipes/${id}`, recipeData)
          .then((response) => {
            this.$router.push({ name: 'home' })
          })
          .catch((error) => {
            if (error.response) {
              alert('Could not update recipe')
            } else {
              console.log(error)
            }
          })
      }
    }
  },
  components: {
    CreateRecipe
  }
}

</script>
