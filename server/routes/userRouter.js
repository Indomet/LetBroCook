const express = require('express');
var mongoose = require("mongoose");
const router = express.Router();


const { recipeModel, Tag } = require("../models/recipeModel.js"); //. for windows
const userModel = require("../models/userModel.js");
const serverUtil = require("../serverUtil.js")
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

    recipeModel.find({owner: req.user.id})
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

        const user = req.user
        res.status(200).json({ User: user });
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

    try {

      const user = req.user
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
router.post("/comments", userAuth.authUser, (req, res, next) => {
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



          const newComment = {
            _id: new mongoose.Types.ObjectId(),
          ownerId: userId,
          recipeId: recipeId,
          comment: req.body.comment,
          author: user.username,
          };


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
router.put("/replace-user", userAuth.authUser, function (req, res, next) {

    const user = req.user
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

});

//replacce a recipe
router.put("/replace-recipe",userAuth.authUser, userAuth.isOwnerOfRecipe, async (req, res, next) => {
    const updatedRecipeData = req.body;
    const unformattedTags = req.body.tags;

    try {
      const formattedTags = await serverUtil.handleExistingTags(unformattedTags, Tag);
      updatedRecipeData.tags = formattedTags;

      const recipeToUpdate = req.recipe

      const { ingredients, steps, serving, description, tags, nutritionalInfo, comments } = req.body;
      recipeToUpdate.set({ ingredients, steps, serving, description, tags, nutritionalInfo, comments });

      await recipeToUpdate.save();
      const tagDetails = await Tag.find({ _id: { $in: recipeToUpdate.tags } });
      res.status(200).json({
        message: "Recipe updated", Recipe: { ...recipeToUpdate.toObject(), tags: tagDetails, }
      });

    } catch (err) {
      err.status=400//bad update requets
      return next(err);
    }
});

//PATCH----------------------------------

// edit a user
router.patch("/edit-user", userAuth.authUser, (req, res, next) => {
    const user = req.user
    Object.assign(user, req.body);
    user.save();
    res.json(user);
})

// edit a recipe
router.patch("/edit-recipe", async (req, res, next) => {

    const updatedRecipeData = req.body;
    const unformattedTags = req.body.tags;

  try {
    const formattedTags = await serverUtil.handleExistingTags(unformattedTags, Tag);
    updatedRecipeData.tags = formattedTags;

    const updatedRecipe = await recipeModel.findByIdAndUpdate(req.recipe.id, updatedRecipeData);

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const tagDetails = await Tag.find({ _id: { $in: updatedRecipe.tags } });
    res.status(200).json({
      message: "Recipe updated",
      Recipe: {updatedRecipe},
      tags: tagDetails
    });
  } catch (err) {
    err.status=400
    return next(err);
  }
});


router.post("/create-recipe", userAuth.authUser, async (req, res, next) => {
    const recipeData = req.body;
    const unformattedTags = req.body.tags;

    try {
    var formattedTags = await serverUtil.handleExistingTags(unformattedTags, Tag)
      recipeData.tags = formattedTags;
      recipeData.owner = req.params.userId;
    }
    catch (err) {
      err.status=400//bad tags request
    return next(err);
    }

    var recipe = new recipeModel(recipeData);
    const user = req.user
    recipe.owner = user.id

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
//body has a comment recipe and the comment id
router.patch('/editComment', userAuth.authUser, async (req, res, next) => {
    const { commentId, recipeId, comment } = req.body;
    recipeModel.findById(recipeId).then((recipe)=>{
      if(!recipe){return res.json("no recipe")}

      let obj = recipe.comments.find(comment => comment._id ==commentId);
      obj.comment=comment
      recipe.save()
      //recipe.comments[commentIndex].comment=comment
      res.status(200).json({comment:obj})
    }).catch((err)=>{
    err.status= 404
    err.message="comment doesnt exist"
    return next(err)})
  })

//DELETE----------------------------------
