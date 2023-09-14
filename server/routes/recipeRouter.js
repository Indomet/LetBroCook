const express = require('express');
var mongoose = require("mongoose");
const router = express.Router();


const { recipeModel, Tag } = require("../models/recipeModel.js"); //. for windows
const userModel = require("../models/userModel.js");
const userAuth = require("../basicAuth.js")

module.exports = router

//GET----------------------------------

//Get all recipes
router.get("/", function (req, res, next) {
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
        error.status=400
        return next(error); // Handle the error using Express's error handling middleware
      });
  });

//Get all tags
router.get("/tags", function (req, res, next) {
    //label cache-ability
    res.set("Cache-control", `no-store`);
    Tag.find({})
      .then(function (tags) {
        res.status(200).json({ tags: tags });
      })
      .catch(function (error) {
        error.status=400
        return next(error); // Handle the error using Express's error handling middleware
    });
});


// hateoas
router.get("/selectOne/", async (req, res, next) => {

try {
    const recipeId = req.recipe.id
    await recipeModel.findById(recipeId)
    .then(function(recipe){
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
    })

} catch (err) {
    err.status=400
    return next(err)
}
});




//POST----------------------------------

//PATCH--------------------------------

//PUT----------------------------------

//DELETE--------------------------------


//Delete recipe by id
router.delete('/deleteOne', userAuth.authUser, userAuth.isOwnerOfRecipe, function (req, res, next) {
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


//Delete all recipes from specific userId
router.delete('/deleteAllFromUser', userAuth.authUser, function(req, res, next){
    const userId = req.user.id
    try{
    deleteManyUserRecipe(req, userId)}
    catch(err){
      err.status = 404 // user doesnt exist
      return next(err)
    }

    recipeModel.find({owner : userId}).then(function(recipes){
        if(recipes.length === 0){
            return res.status(404).json({ message: "No recipes to delete" })
        }

        recipeModel.deleteMany({id: recipes.id})
        .then(function(recipes){
            return res.status(200).json({ message: "Recipe deleted", body: recipes })

        })
        .catch(function(error){
          err.status = 404//no recipes to delete
            return next(error)
        })
    })
    .catch(function(error){
      err.status = 404//no recipes owner was found 

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
