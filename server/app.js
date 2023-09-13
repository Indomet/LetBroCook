var express = require("express");
var mongoose = require("mongoose");
var morgan = require("morgan");
var path = require("path");
var cors = require("cors");
var history = require("connect-history-api-fallback");
const { recipeModel, Tag } = require("./models/recipeModel.js"); //. for windows
const userModel = require("./models/userModel.js");
const serverUtil = require("./serverUtil.js");
const fs = require("fs");
const userAuth = require("./basicAuth.js")

// Variables
var mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LetBroCook";
var port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
  })
  .catch((err) => {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
  });

mongoose.connection.on("error", function (error) {
  console.error(error);
});
mongoose.connection.once("open", async function () {
  console.log("Connected to database");

  const count = recipeModel.countDocuments().exec()
  if(count ==0){
  try {
    recipeData = require("../RecipeData.json");
    console.log("lenghtn is " + recipeData.length);

    for (let i = 0; i < recipeData.length; i++) {
      let formattedTags = [];
      for (const element of recipeData[i].tags) {
        let existingTag = await Tag.findOne({ name: element });
        // If the tag doesn't exist, create a new one and save it
        if (!existingTag) {
          existingTag = new Tag({ name: element });
          await existingTag.save();
        }

        formattedTags.push(existingTag._id); // Push the ObjectId of the tag
      }
      recipeData[i].tags = formattedTags; // Assign the array of ObjectIds to the recipeData
      await new recipeModel(recipeData[i]).save();
    }
    console.log("done");
  } catch (err) {
    console.log(err);
  }}
});

// Create Express app
var app = express();
// Parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// HTTP request logger
app.use(morgan("dev"));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options("*", cors());
app.use(cors());
app.use(setUserData)

// Import routes
app.get("/api", function (req, res) {
  res.json({ message: "Welcome to your DIT342 backend ExpressJS project!" });
});

app.get("/v1/users", function (req, res, next) {
  //label cache-ability
  res.set("Cache-control", `no-store`);
  userModel
    .find({})
    .then(function (users) {
      return res.status(200).json({users});
    })
    .catch(function (error) {
      res.status(500).json({ message: error.message });
      return next(error); // Handle the error using Express's error handling middleware
    });
});

// hateoas
app.get("/v1/recipes/:recipeId", async (req, res, next) => {
  const { recipeId } = req.params;

  try {
    const recipe = await recipeModel.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ message: "recipe not found" });
    }

    // HATEOAS links
    const links = [
      { rel: "itself", href: `/v1/recipes/${recipe._id}` },
      { rel: "edit", href: `/v1/users/${recipe.owner}/edit-recipe/${recipe._id}` },
      { rel: "delete", href: `/v1/users/${recipe.owner}/deleteOne/${recipe._id}` }
    ];

    res.status(200).json({recipe: recipe,links: links,
    });
  } catch (err) {
    return next(err);
  }
});

app.post("/v1/users/signup", (req, res, next) => {
  var user = new userModel(req.body);
  user
    .save()
    .then(function (user) {
      res.status(201).json(user);
    })
    .catch(function (error) {
      res.status(400).json({ message: error.message });
      return next(error);
    });
});

app.get("/v1/users/sign-in", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email) return res.status(404).json({ message: "Email required" });

  await userModel
    .findOne({ email: email })
    .exec()
    .then((user) => {
      if (!serverUtil.validateEmail(email)) {
        return res
          .status(404)
          .json({ message: "Please input a correct email" });
      } else if (!user)
        return res.status(404).json({ message: "Account not registered" });

      user.comparePassword(password, (err, isMatch) => {
        if (isMatch) {
          res.status(200).json(user);
        } else {
          res.status(401).json({ message: "Email or password is incorrect" });
        }
      });
    })
    .catch((err) => {
      return next(err);
    });
});

//Get user by id
//TODO: Admin permissions
app.get("/v1/users/:userid", (req, res, next) => {
  // Label cache-ability
  res.set("Cache-control", "no-store");

  userModel
    .findById(req.params.userid)
    .then((user) => {
      // User found, send it as a response
      res.status(200).json({ User: user });
    })
    .catch((err) => {
      // Handle database errors or other unexpected errors
      res.status(400).json({ message: "user not found" });
      next(err);
    });
});

//Get all recipes
app.get("/v1/recipes", function (req, res, next) {
  //label cache-ability
  res.set("Cache-control", `no-store`);

  tags = req.query.tags;
  searchTerm = req.query.title;

  var recipes;
  //users can only filter or search not both
  if (tags) {
    recipes = recipeModel.find({ tags: { $in: tags } });
  } else if (searchTerm) {
    recipes = recipeModel.find({ $text: { $search: searchTerm } });
  } else {
    recipes = recipeModel.find({});
  }

  recipes
    .then(function (recipes) {
      res.status(200).json({ recipes: recipes });
    })
    .catch(function (error) {
      res.status(400).json({ message: "invalid filter parameters" });
      return next(err); // Handle the error using Express's error handling middleware
    });
});

//Get all recipes of user
app.get("/v1/users/recipes/all", userAuth.authUser, function (req, res, next) {
    //label cache-ability
    res.set("Cache-control", `no-store`);

    tags = req.query.tags;
    searchTerm = req.query.title;

    var recipes;
    //users can only filter or search not both
    if (tags) {
      recipes = recipeModel.find({ tags: { $in: tags } });
    } else if (searchTerm) {
      recipes = recipeModel.find({ $text: { $search: searchTerm } });
    } else {
      recipes = recipeModel.find({});
    }

    recipes
      .then(function (recipes) {
        res.status(200).json({ recipes: recipes });
      })
      .catch(function (error) {
        res.status(400).json({ message: "invalid filter parameters" });
        return next(err); // Handle the error using Express's error handling middleware
      });
  });


app.get("/v1/tags", function (req, res, next) {
  //label cache-ability
  res.set("Cache-control", `no-store`);
  Tag.find({})
    .then(function (tags) {
      res.status(200).json({ tags: tags });
    })
    .catch(function (error) {
      response.status(500).json({ message: error.message });
      return next(error); // Handle the error using Express's error handling middleware
    });
});

//function to signup user

//add a comment by a user to a certain recipe
app.post("/v1/users/recipes/comment", userAuth.authUser, (req, res, next) => {
  //const { userId, recipeId } = req.params;
    const userId = req.user.id
    const recipeId = req.recipe.id

  userModel
    .findById(userId)
    .then((user) => {
      recipeModel
        .findById(recipeId)
        .then(async (recipe) => {
          const { comment } = req.body;
          const newComment = { comment: comment, author: user.username };
          recipe.comments.push(newComment);
          recipe.save();
          res.status(201).json(newComment);
        })
        .catch((err) => {
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
});

//add a recipe to a users favourited list
app.post(
  "/v1/users/:userId/favorite-recipes/:recipeId",
  async (req, res, next) => {
    const { userId, recipeId } = req.params;
    try {
      //attempt to find user
      const user = await userModel.findById(userId);
      if (!user) {
        //return resource not found error
        return res.status(404).json({ message: "User does not exist" });
      }

      user.favouriteRecipes.push(recipeId);
      //request created
      res.status(201).json({ message: "Recipe added to favourite list" });
    } catch (error) {
      return next(error);
    }
  }
);

app.post("/v1/users/create-recipe/", userAuth.authUser, async (req, res, next) => {
    const recipeData = req.body;
    const unformattedTags = req.body.tags;
    const userId = req.user.id

    try {
    var formattedTags = [];
    for (const element of unformattedTags) {
        //make a query to find if a tag already exists
        let existingTag = await Tag.findOne({ name: element });
        //if the tag doesnt exist create a new one and save it
        if (!existingTag) {
        existingTag = new Tag({ name: element });
        await existingTag.save();
        }

      formattedTags.push(existingTag);
      recipeData.tags = formattedTags;
      recipeData.owner = req.params.userId;
    }
    } catch (err) {
    return next(err);
    }

    var recipe = new recipeModel(recipeData);

    var user = await userModel.findById(userId)
    if(!user ){
        return res.status(404).send("no user found")
    }
    recipe.owner = userId

    recipe.save()
    .then(function (recipe) {
        try{
            user.recipes.push(recipe.id);
        }catch(error){
            console.log("Invalid user")
            return next(error)
        }
        user.save()
            .then(function () {
                res.status(201).json({ message: "Recipe created", Recipe: recipe });
            })
            .catch((err) => {
                res.status(404).json({ message: "user not found" });
                return next(err);
            });
        })
})






//  handle existing tags
const handleExistingTags = async (tags) => {
  const formattedTags = [];

  for (const element of tags) {
    let existingTag = await Tag.findOne({ name: element });

    if (!existingTag) {
      existingTag = new Tag({ name: element });
      await existingTag.save();
    }

    formattedTags.push(existingTag);
  }

  return formattedTags;
};


// edit a recipe
app.patch("/v1/users/:userId/edit-recipe/:recipeId", async (req, res, next) => {
  const { userId, recipeId } = req.params;
  const updatedRecipeData = req.body;
  const unformattedTags = req.body.tags;

  try {
    const formattedTags = await handleExistingTags(unformattedTags);
    updatedRecipeData.tags = formattedTags;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await userModel.findById(userId);
    const recipeIndex = user.recipes.indexOf(recipeId);
    // it is -1 because If it's not found, it returns -1.
    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found for this user" });
    }

    const updatedRecipe = await recipeModel.findByIdAndUpdate(recipeId, updatedRecipeData);

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    // if (req.body.sectionsAndIngredients) {
    //   updatedRecipeData.sectionsAndIngredients.ingredients = req.body.sectionsAndIngredients.ingredients;
    // }
    const tagDetails = await Tag.find({ _id: { $in: updatedRecipe.tags } });
    res.status(200).json({
      message: "Recipe updated", Recipe: {updatedRecipe}
    });
  } catch (err) {
    return next(err);
  }
});


// edit a user
app.patch("/v1/users/:userId/edit-user", (req, res, next) => {
  var userId = req.params.userId;
  userModel.findByIdAndUpdate(userId, req.body)
    .then(function (user) {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    })
    .catch(function (error) {
      return next(error);
    });
});

// edit a comment
app.patch('/v1/users/:userId/recipes/:recipeId/edit-comment/:commentId', async (req, res, next) => {
  try {
    const { userId, recipeId, commentId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const commentToUpdate = recipe.comments.id(commentId);
    if (!commentToUpdate) return res.status(404).json({ message: 'Comment not found' });

    const { body } = req.body;
    commentToUpdate.body = body;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe.comments);
  } catch (err) {
    next(err);
  }
});


//replace a user
app.put("/v1/users/replace-user", userAuth.authUser, function (req, res, next) {
  var userId = req.user.id
  userModel
    .findById(userId)
    .then(function (user) {

      const { username, email, password, name, recipes, favouriteRecipes } = req.body;
      user.set({ username, email, password, name, recipes, favouriteRecipes });
      user.save()
        .then(updatedUser => {
          res.json(updatedUser);
        })
        .catch(err => {
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
});


//replacce a recipe
app.put("/v1/users/replace-recipe/",userAuth.authUser, userAuth.isOwnerOfRecipe, async (req, res, next) => {
  const userId = req.user.id
  const recipeId = req.recipe.id
  const updatedRecipeData = req.body;
  const unformattedTags = req.body.tags;

  try {
    const formattedTags = await handleExistingTags(unformattedTags);
    updatedRecipeData.tags = formattedTags;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await userModel.findById(userId);

    const recipeIndex = user.recipes.indexOf(recipeId);
    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found for this user" });
    }
    const updatedRecipe = await recipeModel.findById(recipeId);
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    const { ingredients, steps, serving, description, tags, nutritionalInfo, comments } = req.body;
    updatedRecipe.set({ ingredients, steps, serving, description, tags, nutritionalInfo, comments });

    await updatedRecipe.save();
    const tagDetails = await Tag.find({ _id: { $in: updatedRecipe.tags } });
    res.status(200).json({
      message: "Recipe updated", Recipe: { ...updatedRecipe.toObject(), tags: tagDetails, }
    });

  } catch (err) {
    return next(err);
  }
});

//Delete recipe by id
app.delete('/v1/recipes/deleteOne', userAuth.authUser, userAuth.isOwnerOfRecipe, function (req, res, next) {
  var recipeId = req.recipe.id
  var userId = req.user.id


  updateOneUserRecipe(userId, recipeId)//Deletes the reference to the recipe
  recipeModel.findByIdAndRemove(recipeId)//Deletes the actual recipe
    .then(function (recipe) {
      if (!recipe) {
        return res.status(404).json({ message: "Recipe does not exist" })
      }
      return res.status(200).json({ message: "Recipe deleted", body: recipe })
    }).catch(function (error) {
      return next(error)
    })

})

function updateOneUserRecipe(userId, recipeId){
    userModel.findOneAndUpdate(
        { _id: userId },
        { $pull: { recipes: recipeId } },
        { new: true }).then(function(updatedUser){
                console.log("User recipes updated successfully:", updatedUser);
        }).catch(function(err){
                console.error("Error updating user:", err);
        })
}

async function deleteManyUserRecipe(req, userId){
    var recipesToRemove = []
    recipesToRemove = req.user.recipes

    await userModel.findOneAndUpdate({_id:userId}, { $set: { recipes: [] }}).then(function(updatedUser){
                console.log("User recipes updated successfully:", updatedUser);
        }).catch(function(err){
                console.error("Error updating user:", err);
        })
}

//Delete all recipes from specific userId
app.delete('/v1/recipes/deleteAllFromUser', userAuth.authUser, function(req, res, next){
    const userId = req.user.id
    deleteManyUserRecipe(req, userId)

    recipeModel.find({owner : userId}).then(function(recipes){
        if(recipes.length === 0){
            return res.status(404).json({ message: "No recipes to delete" })
        }

        recipeModel.deleteMany({id: recipes.id})
        .then(function(recipes){
            return res.status(200).json({ message: "Recipe deleted", body: recipes })

        })
        .catch(function(error){
            return next(error)
        })
    })
    .catch(function(error){
        return next(error)
    })

})

//Set the req.user to a valid user in the database with matching id.
async function setUserData(req, res, next) {
    const userid = req.body.userId
    const recipeId = req.body.recipeId
    console.log("request has id " + userid)
    //Check that the id is not null
    if (userid) {
        //Check that the ObjectId is in valid format
        await userModel.findById(userid).then(function(user){
            req.user = user
        })
        .catch(function(err){
            next(err)
        })

        await recipeModel.findById(recipeId).then(function(recipe){
            req.recipe = recipe
        })
        .catch(function(err){
            next(err)
        })
    }
    next()
}



// Catch all non-error handler for api (i.e., 404 Not Found)
app.use("/api/*", function (req, res) {
  res.status(404).json({ message: "Not Found" });
});

// Configuration for serving frontend in production mode
// Support Vuejs HTML 5 history mode
app.use(history());
// Serve static assets
var root = path.normalize(__dirname + "/..");
var client = path.join(root, "client", "dist");
app.use(express.static(client));

// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get("env");
// eslint-disable-next-line no-unused-vars

app.use(function (err, req, res, next) {
  console.error(err.stack);
  var err_res = {
    message: err.message,
    error: {},
  };
  if (env === "development") {
    // Return sensitive stack trace only in dev mode
    err_res["error"] = err.stack;
  }
  res.status(err.status || 500);
  res.json(err_res);
});

app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Express server listening on port ${port}, in ${env} mode`);
  console.log(`Backend: http://localhost:${port}/api/`);
  console.log(`Frontend (production): http://localhost:${port}/`);
});


module.exports = app;
