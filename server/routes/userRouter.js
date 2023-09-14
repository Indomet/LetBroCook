const express = require('express');
var mongoose = require("mongoose");
const router = express.Router();


const { recipeModel, Tag } = require("../models/recipeModel.js"); //. for windows
const userModel = require("../models/userModel.js");
const serverUtil = require("../serverUtil.js");
const userAuth = require("../basicAuth.js")

module.exports = router

//GET----------------------------------

//Get all users
router.get("/", function (req, res, next) {
    //label cache-ability
    res.set("Cache-control", `no-store`);
    userModel
      .find({})
      .then(function (users) {
        return res.status(200).json({users});
      })
      .catch(function (error) {
        error.status=400//bad req
        return next(error); // Handle the error using Express's error handling middleware
      });
  });


//Get all recipes of user
router.get("/recipes/all", userAuth.authUser, function (req, res, next) {
    if(!req.user.id){
        return res.status(400).json({ message: "Invalid user" })
    }
    const userId = req.user.id
    recipeModel.find({owner: userId})
    .then(function(recipes){
        res.status(200).json({ recipes: recipes });
    })
    .catch(function (error) {
        error.status= 400
        return next(error); // Handle the error using Express's error handling middleware
      });


  })

  //Get user by id
//TODO: Admin permissions
router.get("/selectOne", (req, res, next) => {
    // Label cache-ability
    res.set("Cache-control", "no-store");

      if(!req.user.id){
          return res.status(400).json({ message: "Invalid user" })
      }
      const userId = req.user.id

    userModel
      .findById(userId)
      .then((user) => {
        // User found, send it as a response
        res.status(200).json({ User: user });
      })
      .catch((err) => {
        // Handle database errors or other unexpected errors
        err.staus=404
        next(err);
      });
  });

//User sign in
router.get("/sign-in", async (req, res, next) => {
    if(!req.body){
        return res.status(404).json({ message: "Missing body" })
    }
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
          res.status(200).json({message: "Sign-in successful", body: user});
        } else {
          res.status(401).json({ message: "Email or password is incorrect" });
        }
      });
    })
    .catch((err) => {
      err.status=404
      return next(err);
    });
});

//POST----------------------------------


router.post("/favorite-recipes/",userAuth.authUser, async (req, res, next) => {

    if(!req.user.id || !req.recipe.id){
        return res.status(400).json({ message: "Invalid user/recipe" })
    }
    const userId = req.user.id
    const recipeId = req.recipe.id

    try {
      //attempt to find user
      const user = await userModel.findById(userId);
      if (!user) {
        //return resource not found error
        return res.status(404).json({ message: "User does not exist" });
      }

      user.favouriteRecipes.push(recipeId);
      user.save()
      //request created
      res.status(201).json({ message: "Recipe added to favourite list" });
    } catch (error) {
      error.status=400
      return next(error);
    }
  }
);

//add a comment by a user to a certain recipe
router.post("/v1/users/recipes/comment", userAuth.authUser, (req, res, next) => {
    if(!req.user.id || !req.recipe.id){
        return res.status(400).json({ message: "Invalid user/recipe" })
    }

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
          err.status=400
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
});

//Create user account
router.post("/signup", (req, res, next) => {
    var user = new userModel(req.body);
    user
      .save()
      .then(function (user) {
        res.status(201).json(user);
      })
      .catch(function (error) {
        error.status=400
        return next(error);
      });
  });

//PUT----------------------------------

//replace a user
router.put("/v1/users/replace-user", userAuth.authUser, function (req, res, next) {
    if(!req.user.id){
        return res.status(400).json({ message: "Invalid user"})
    }
    const userId = req.user.id
    userModel.findById(userId)
    .then(function (user) {

      const { username, email, password, name, recipes, favouriteRecipes } = req.body;
      user.set({ username, email, password, name, recipes, favouriteRecipes,  });
      user.save()
        .then(updatedUser => {
          res.json(updatedUser);
        })
        .catch(err => {
          err.status= 400//bad req for updating a user
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
});

//replacce a recipe
router.put("/v1/users/replace-recipe/",userAuth.authUser, userAuth.isOwnerOfRecipe, async (req, res, next) => {
    const userId = req.user.id
    const recipeId = req.recipe.id
    const updatedRecipeData = req.body;
    const unformattedTags = req.body.tags;

    try {
      const formattedTags = await serverUtil.handleExistingTags(unformattedTags);
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
      err.status=400//bad update requets
      return next(err);
    }
  });


//PATCH----------------------------------

// edit a user
// edit a user
router.patch("/v1/users/edit-user", userAuth.authUser, (req, res, next) => {
  if(!req.user.id){
      return res.status(400).json({ message: "Invalid user"})
  }
  const userId = req.user.id
userModel.findById(userId)
  .then(function (user) {

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    Object.assign(user,req.body);
    user.save();
    res.json(user);
  })
  .catch(function (error) {
    error.status=400
    return next(error);
  });
});


// edit a recipe
router.patch("/v1/users/edit-recipe/", async (req, res, next) => {

    const updatedRecipeData = req.body;
    const unformattedTags = req.body.tags;

    if(!req.user.id || !req.recipe.id){
        return res.status(400).json({ message: "Invalid user/recipe" })
        }
    const userId = req.user.id
    const recipeId = req.recipe.id

  try {
    const formattedTags = await serverUtil.handleExistingTags(unformattedTags);
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
    err.status=400
    return next(err);
  }
});


router.post("/create-recipe", userAuth.authUser, async (req, res, next) => {
    const recipeData = req.body;
    const unformattedTags = req.body.tags;

    if(!req.user.id){
        return res.status(400).json({ message: "Invalid user" })
    }
    const userId = req.user.id
    try {
    var formattedTags = await serverUtil.handleExistingTags(unformattedTags,Tag)
      recipeData.tags = formattedTags;
      recipeData.owner = req.params.userId;
    }
    catch (err) {
      err.status=400//bad tags request
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


//TODO: Make comment into separate model and create authorization
//check for only being able to edit/delete one's own comment

// edit a comment
router.patch('/v1/users/:userId/recipes/:recipeId/edit-comment/:commentId', async (req, res, next) => {
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


//DELETE----------------------------------
