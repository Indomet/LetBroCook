<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div>
          <h1 class="header">
            Submit <span class="underline">Your</span> Recipe
          </h1>
          <p class="headerDesc">
            Share your culinary expertise with us, and we will spread it to the
            world. Show them why they let you cook &#x1F525;
          </p>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-6 offset-md-1" id="recipe-form">
        <h2 class="subHeader">Recipe details</h2>
        <div>
          <div class="form-floating mb-3">
            <textarea
              v-model="title"
              class="form-control resizable"
              ref="textarea"
              rows="1"
              @focus="resize"
              @keyup="resize"
              id="title"
            ></textarea>
            <label for="title">Title</label>
          </div>
          <div class="form-floating mb-3">
            <textarea
              v-model="description"
              class="form-control resizable"
              ref="textarea"
              rows="1"
              @focus="resize"
              @keyup="resize"
              id="description"
            ></textarea>
            <label for="description">Description</label>
          </div>
          <div class="form-floating mb-3">
            <textarea
              v-model="ingredients"
              class="form-control resizable"
              id="ingredients"
              ref="textarea"
              rows="1"
              @focus="resize"
              @keyup="resize"
            ></textarea>
            <label for="ingredients">Ingredients</label>
          </div>
          <div class="form-floating mb-3">
            <textarea
              v-model="steps"
              class="form-control resizable"
              id="steps"
              ref="textarea"
              rows="1"
              @focus="resize"
              @keyup="resize"
            ></textarea>
            <label for="steps">Steps</label>
          </div>
          <div class="form-floating mb-3">
            <textarea
              v-model="servings"
              class="form-control"
              id="servings"
            ></textarea>
            <label for="servings">Servings</label>
          </div>
          <div class="form-floating mb-3">
            <textarea
              v-model="nutritionalInfo"
              class="form-control resizable"
              ref="textarea"
              rows="1"
              @focus="resize"
              @keyup="resize"
              id="nutritionalInfo"
            ></textarea>
            <label for="nutritionalInfo">Nutritional info (optional)</label>
          </div>
        </div>
        <div
          class="field"
          style="display: flex; flex-direction: column; margin-top: 30px"
        >
          <b-form-file
            v-model="file"
            placeholder="Upload a picture"
            drop-placeholder="Drop picture here"
            @change="onFileChange"
          ></b-form-file>
          <div class="dropdown selectTagsDropdown" style="margin-top: 40px">
            <button
              class="btn btn-secondary dropdown-toggle selectTagsDropdown"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Select tags
            </button>

            <div
              class="dropdown-menu pre-scrollable heightOfDropdown"
              aria-labelledby="dropdownMenuButton"
            >
              <form>
                <div class="form-group">
                  <div
                    v-for="(tag, index) in this.tags"
                    :key="tag._id"
                    class="form-check"
                  >
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :value="tag"
                      :id="'tag' + index"
                      v-model="selectedTags"
                    />
                    <label class="form-check-label" :for="'tag' + index">
                      {{ tag.name }}
                    </label>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <h5 class="text-center" style="margin-top: 30px;">Or create a new tag (optional)</h5>
          <div class="d-flex justify-content-center">
            <b-col lg="3"><b-button size="sm" @click="createTag">Create tag</b-button></b-col>
  <input type="text" class="form-control ml-2 mx-auto" placeholder="Enter tag name" v-model="tagName">
  <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>

</div>
      </div>

        <a
          @click="submitRecipe"
          href="#"
          class="btn btn-primary createRecipeBTN"
          role="button"
          data-bs-toggle="button"
          >Submit Recipe</a
        >
      </div>
      <div class="col-auto p-0 sidePic ml-auto d-none d-md-block">
        <img
          class="chefimg"
          src="../assets/chef.jpg"
          alt="Description of the image"
        />
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

// eslint-disable-next-line no-unused-vars
function splitToArray(str) {
  return str.split(/\r?\n/)
}

export default {
  name: 'Login',
  mounted() {
    const user = localStorage.getItem('user-info')
    if (!user) {
      this.$router.push({ name: 'home' })
    }
    this.resize()
    const form = document.getElementById('recipe-form')
    form.addEventListener('input', (event) => {
      const inputField = event.target
      if (inputField.tagName === 'TEXTAREA' && inputField.value === '') {
        inputField.classList.remove('is-valid')
        inputField.classList.add('is-invalid')
      } else {
        inputField.classList.remove('is-invalid')
        inputField.classList.add('is-valid')
      }
    })
    axios
      .get('http://localhost:3000/v1/recipes/tags')
      .then((response) => {
        this.tags = response.data.tags
      })
      .catch((err) => {
        console.log(err)
      })
  },
  data() {
    return {
      tags: [],
      title: '',
      description: '',
      ingredients: '',
      steps: '',
      servings: '',
      file: '',
      url: '',
      nutritionalInfo: '',
      tagName: '',
      successMessage: '',
      selectedTags: []
    }
  },
  methods: {
    async submitRecipe() {
      if (
        this.title === '' ||
        this.description === '' ||
        this.ingredients === '' ||
        this.steps === '' ||
        this.servings === '' ||
        this.url === ''
      ) {
        alert('Please fill in all fields and upload an image')
      } else {
        const user = JSON.parse(localStorage.getItem('user-info'))
        const userId = user.body._id
        // eslint-disable-next-line spaced-comment
        const recipeData = {
          title: this.title,
          image: this.url,
          sectionsAndIngredients: {
            Ingredients: splitToArray(this.ingredients)
          },
          servings: this.servings,
          description: this.description,
          steps: splitToArray(this.steps),
          tags: this.selectedTags,
          nutritionalInfo: splitToArray(this.nutritionalInfo)
          // THEN ADD THE OWNER THEN POST TO DB
        }
        await axios
          .post(`http://localhost:3000/v1/users/${userId}/recipes`, recipeData)
          .then((response) => {
            console.log(response)
            this.$router.push({ name: 'home' })
          })
          .catch((error) => {
            if (error.response && error.response.status === 413) {
              // error handling when the image is too large
              alert('Please upload an image with a smaller size')
            } else {
              console.log(error)
            }
          })
      }
    },
    updateSelectedTags() {
      this.selectedTags = this.tags.filter((tag) => tag.checked)
    },
    onFileChange(e) {
      this.file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = () => {
        this.url = reader.result
      }
      reader.readAsDataURL(this.file)
    },
    resize() {
      const textareas = document.querySelectorAll('.resizable')
      textareas.forEach((textarea) => {
        textarea.style.height = textarea.scrollHeight - 4 + 'px'
      })
    },
    createTag() {
      const user = JSON.parse(localStorage.getItem('user-info'))
      const userId = user.body._id
      axios.post(`http://localhost:3000/v1/recipes/${userId}/tags`, { tag: this.tagName })
        .then((response) => {
          console.log(response)
          this.tags.push(response.data.tag)
          this.selectedTags.push(response.data.tag)
          this.successMessage = 'Tag created successfully!'
        }).catch((err) => {
          if (err.response.status === 409) {
            alert('Tag already exists')
          }
        })
    }
  }
}
</script>

<style scoped>
.header {
  font-family: 'Lucida Handwriting';
  color: green;
  margin-top: 50px;
}

.sidePic {
  margin: auto;
  display: block;
}

.chefimg {
  width: 290px;
  height: auto;
}
.custom-dropdown-menu {
  padding: 0;
  margin: 0;
  border: none;
  box-shadow: none;
  background-color: white;
  border: 1px solid rgb(171, 171, 171);
  overflow-y: auto;
  height: 10px;
}

.heightOfDropdown {
  height: 150px;
}

.createRecipeBTN {
  margin-top: 35px;
  border: none;
  background-image: linear-gradient(to bottom, #5aca44, #36d236);
  width: 300px;
}

.selectTagsDropdown {
  align-self: center;
  border-radius: 10px;
  background: grey;
}
.underline {
  text-decoration: underline;
  text-underline-offset: 20px;
  text-decoration-color: grey;
}

.headerDesc {
  margin-top: 50px;
  font-size: 20px;
  font-family: bold;
}

.subHeader {
  font-size: 30px;
  font-family: bold;
  text-align: left;
}

.fileUpload {
  float: left;
  margin-top: 10px;
}

.field {
  margin-top: 0;
  text-align: left;
  font-size: 20px;
}

@media only screen and (max-width: 768px) {
  .col-6 {
    width: 100%;
  }
  #recipe-form {
    margin-top: 50px;
  }
  .sidePic {
    display: none;
  }
  .underline {
    text-underline-offset: 0px;
  }
  .side {
    width: 50%;
    height: auto;
  }
}
@media only screen and (min-width: 992px) {
  .chefimg {
    width: 400px;
  }
}
</style>
