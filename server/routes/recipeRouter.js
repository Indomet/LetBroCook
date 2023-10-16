const express = require('express');
var mongoose = require("mongoose");
const router = express.Router();
//just specify in the query options for example such as _method=PATCH to use a patch method
//but the actual form method is post/get
//will be used when deleting all tags for example
const axios = require('axios');


const { recipeModel, Tag } = require("../models/recipeModel.js"); //. for windows
const userModel = require("../models/userModel.js");
const userAuth = require("../basicAuth.js")
const serverUtil = require("../serverUtil.js")


module.exports = router

function thenAndCatch(query, modelMethod, thenFunction, catchFunction) {
  modelMethod(query).then(thenFunction).catch(catchFunction);
}

//GET----------------------------------

//Get all recipes
router.get("/", function (req, res, next) {
    //label cache-ability
    res.set("Cache-control", `no-store`);

    const tags = req.query.tags;
    const searchTerm = req.query.title;

    var recipes;
    //users can only filter or search not both
    if (tags && searchTerm) {
      recipes = recipeModel.find({ "tags.name": { $in: tags }, $text: { $search: searchTerm } })
      .populate({
        path: 'comments',
        populate: {
          path: 'ownerId',
          select: 'username ownerId image',
          model: userModel // Assuming 'User' is the name of your User model
        }
      })
    }
    else if (tags) {
      recipes = recipeModel.find({ "tags.name": { $in: tags } })
      .populate({
        path: 'comments',
        populate: {
          path: 'ownerId',
          select: 'username ownerId image',
          model: userModel // Assuming 'User' is the name of your User model
        }
      })
        } else if (searchTerm) {
      recipes = recipeModel.find({ $text: { $search: searchTerm } })
      .populate({
        path: 'comments',
        populate: {
          path: 'ownerId',
          select: 'username ownerId image',
          model: userModel // Assuming 'User' is the name of your User model
        }
      })
    } else {
      recipes = recipeModel.find({}).sort({ _id: -1 })
      .populate({
        path: 'comments',
        populate: {
          path: 'ownerId',
          select: 'username ownerId image',
          model: userModel // Assuming 'User' is the name of your User model
        }
      })
    }

    recipes
      .then(function (recipes) {
        res.status(200).json({ recipes: recipes });
      })
      .catch(function (error) {
        error.status=400
        return next(error); // Handle the error using Express's error handling middleware
      });
  });

//Delete all recipes from specific userId !!!!!!!!
router.delete('/:userId/', userAuth.setRequestData, userAuth.authUser, function(req, res, next) {
  const userId = req.user.id;
  updateManyUserRecipe(req, userId)
  
  recipeModel.find({ owner: userId }).then(function(recipes) {
      if (recipes.length === 0) {
          return res.status(404).json({ message: "No recipes to delete" });
      }
      const recipeIds = recipes.map(recipe => recipe.id);
      recipeModel.deleteMany({ _id: { $in: recipeIds } })
          .then(function(result) {
              return res.status(200).json({ message: "Recipes deleted", body: result });
          })
          .catch(function(error) {
              return next(error);
          });
  }).catch(function(error) {
      return next(error);
  });
});


router.get("/:recipeId", userAuth.setRequestData, async (req, res, next) => {
  const recipeId = req.recipe.id
  console.log(recipeId)
  recipeModel.findById(recipeId).then(recipe => {
    res.status(200).json({ recipe: recipe});
  })
  .catch(function(error){
    console.log(error)
    error.status= 404
    return next(error)
  });

});

//Replaces a recipe by id
router.put("/:recipeId", userAuth.setRequestData, userAuth.authUser, userAuth.isOwnerOfRecipe, async (req, res, next) => {
  const recipeId = req.recipe.id
  const { title, image, sectionsAndIngredients, steps, servings, description,  nutritionalInfo } = req.body;

  try {
    const formattedTags = await serverUtil.handleExistingTags(req.body.tags, Tag, req.user.id);

    const updatedRecipe = await recipeModel.findById(recipeId);

    Object.assign(updatedRecipe, {
      title, image, sectionsAndIngredients, steps, servings, description, tags: formattedTags, nutritionalInfo });

    await updatedRecipe.save();

    res.status(200).json({
      message: "Recipe replaced",
      Recipe: updatedRecipe
    });
  } catch (err) {
    return next(err);
  }
});


//Delete recipe by id
router.delete('/:recipeId/users/:userId', userAuth.setRequestData, userAuth.authUser, userAuth.isOwnerOfRecipe, function (req, res, next) {
    var recipeId = req.recipe.id
    var userId = req.user.id

    try{
        updateOneUserRecipe(userId, recipeId)
    }catch(err){
      err.status=400 //bad request to update the user
        return next(err)
    }

    recipeModel.findByIdAndRemove(recipeId)//Deletes the actual recipe
      .then(function (recipe) {
        if (!recipe) {
          return res.status(404).json({ message: "Recipe does not exist" })
        }
        return res.status(200).json({ message: "Recipe deleted", body: recipe })
      }).catch(function (err) {
        err.status=400 //bad request to delete recipe
        return next(err)
      })

  })



//Deletes the reference of one recipeId
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


//Deletes the reference of many recipeId
async function updateManyUserRecipe(req, userId){
    var recipesToRemove = []
    recipesToRemove = req.user.recipes
    await userModel.findOneAndUpdate({_id:userId}, { $set: { recipes: [] }}).then(function(updatedUser){
                console.log("User recipes updated successfully:", updatedUser);
        }).catch(function(err){
                console.error("Error updating user:", err);
        })
    }