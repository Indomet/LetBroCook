const express = require('express');
var mongoose = require("mongoose");
const router = express.Router();


const { recipeModel, Tag ,Comment} = require("../models/recipeModel.js"); //. for windows
const userModel = require("../models/userModel.js");
const serverUtil = require("../serverUtil.js")
const userAuth = require("../basicAuth.js")
var bcrypt = require("bcrypt")
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

  //get a single recipe from a given user
  router.get("/:userId/recipes/:recipeId", userAuth.setRequestData, userAuth.authUser, userAuth.isOwnerOfRecipe, async (req, res, next) => {
    const recipeId = req.recipe.id
    const userId = req.user.id
    await recipeModel.findOne({_id : recipeId, owner: userId}).then(recipe=>{
      if(!recipe){
        return res.status(404).json({message: "Recipe not found"})
      }
      res.status(200).json({recipe: recipe})
    }).catch(err=>{
      err.status=404
      return next(err)
    })
  })

router.delete("/:userId/recipes/:recipeId", userAuth.setRequestData, userAuth.authUser, userAuth.isOwnerOfRecipe, async (req, res, next) => {
    const recipeId = req.recipe.id
    const userId = req.user.id
    await recipeModel.findOneAndDelete({_id : recipeId, owner: userId}).then(recipe=>{
      if(!recipe){
        return res.status(404).json({message: "Recipe not found"})
      }
      res.status(200).json({message: "Recipe deleted"})
    }).catch(err=>{
      err.status=404
      return next(err)
    })
  })

  


//Get all recipes of user
router.get("/:userId/recipes/", userAuth.setRequestData, async function (req, res, next) {

    try {
        const recipes = await recipeModel.find({owner: req.user.id})
        .populate({
            path: 'comments',
            populate: {
              path: 'ownerId',
              select: 'username ownerId image',
              model: userModel // Assuming 'User' is the name of your User model
            }
          });

        const recipeList = recipes.map(recipe => {
            const links = [//http://localhost:8080/editrecipe/652081fff0206a5b8b12d25a
                // HATEOAS links
                { rel: "edit", href: `/editrecipe/${recipe._id}` },
                //http://localhost:3000/v1/recipes/{{recipe_id}}/users/{{user_id}}/delete
                { rel: "delete", href: `http://localhost:3000/v1/recipes/${recipe._id}/users/${recipe.owner}/delete` }
            ];
            return { recipe: recipe, links: links };
        });

        res.status(200).json({ recipes: recipeList });
    } catch (error) {
        error.status = 400;
        return next(error); // Handle the error using Express's error handling middleware
    }

    console.log("Recipe search completed."); // Log a message after the search is completed

});

//User sign in
router.post("/", async (req, res, next) => {
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
            //TODO: save state
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

  //Get user data by id, must be logged in since it will return personal information
router.get("/:userId", userAuth.setRequestData, userAuth.authUser, (req, res, next) => {
    // Label cache-ability
    res.set("Cache-control", "no-store");
        const user = req.user
        res.status(200).json({ User: user });
});

//POST----------------------------------

router.post("/:userId/recipes", userAuth.setRequestData, userAuth.authUser, async (req, res, next) => {
    const recipeData = req.body;
    const unformattedTags = req.body.tags;
    try {
        var formattedTags = await serverUtil.handleExistingTags(unformattedTags, Tag, req.user.id)
            recipeData.tags = formattedTags;
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
    }
    catch (err) {
      err.status=400//bad tags request
    return next(err);
    }
    
})

router.get("/:userId/favorite-recipes", userAuth.setRequestData, userAuth.authUser, async (req, res, next) => {
    const favedArray = req.user.favouriteRecipes
    recipeModel.find({ _id: { $in: favedArray } })
    .populate({
        path: 'comments',
        populate: {
          path: 'ownerId',
          select: 'username ownerId image',
          model: userModel // Assuming 'User' is the name of your User model
        }
      })
    .then(recipes => {
      res.status(200).json({favouriteRecipes: recipes});
    }).catch(err => {
      console.error(err);
      res.status(500).send("Error retrieving recipes");
    });
});

router.post("/:userId/recipes/:recipeId/favorite-recipes", userAuth.setRequestData, userAuth.authUser, async (req, res, next) => {
    const user = req.user
    const recipe = req.recipe
    try {
        // Prevent duplicate ids from being added to favoriteRecipes
        for(var each of user.favouriteRecipes){
            console.log(each)
            if(recipe.id == each){
                res.status = 400
                return res.json({
                    message: "Recipe is already favorited.",
                    body: each
                })
            }
        }
        user.favouriteRecipes.push(recipe.id);
        user.save()
        //request created
        res.status(201).json({ message: "Recipe added to favourite list", body: recipe.id });


    } catch (error) {
      error.status=400
      return next(error);
    }
  }
);

//add a comment by a user to a certain recipe
router.post("/:userId/recipes/:recipeId/comments", userAuth.setRequestData, userAuth.authUser, (req, res, next) => {

    const userId = req.user.id
    const recipeId = req.recipe.id
  userModel
    .findById(userId)
    .then((user) => {
      recipeModel
        .findById(recipeId)
        .then(async (recipe) => {

          const newComment = new Comment({
            ownerId: userId,
            recipeId: recipeId,
            comment: req.body.comment,
            author: user.username,
            // The 'date' field will automatically use the current date and time due to the default value.
          });

          recipe.comments.push(newComment);
          recipe.save();
          newComment.save()
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
router.put("/:userId", userAuth.setRequestData, userAuth.authUser, async function (req, res, next) {
  const userId = req.user.id
  const { image, username, email, password, name, recipes, favouriteRecipes } = req.body;

  try {
    const updatedUser = await userModel.findById(userId)
    Object.assign(updatedUser, {image, username, email, password, name, recipes, favouriteRecipes});
    await updatedUser.save();
    res.status(200).json({ message: "User replaced", user: updatedUser });
  } catch (err) {
    err.status = 404;
    return next(err);
  }
});



//PATCH----------------------------------

// edit a user
router.patch("/:userId", userAuth.setRequestData, userAuth.authUser, async (req, res, next) => {

  // check if username already exists in database
  const usernameExists = await userModel.findOne({ username: req.body.username });
  if (usernameExists && usernameExists._id.toString() !== req.params.userId) {
      return res.status(400).json({ message: "Username already exists" });
  }

  // heck if email already exists in database
  const emailExists = await userModel.findOne({ email: req.body.email });
  if (emailExists && emailExists._id.toString() !== req.params.userId) {
      return res.status(400).json({ message: "Email already exists" });
  }

  bcrypt.compare(req.body.current_password, req.user.password, function (err, isMatch) {
    console.log("isMatch: " + isMatch)
    if (err){
      console.log(err)
    }
    if (isMatch || !req.body.password) {
      // if username and email are unique, update
      userModel.findById(req.user.id).then(user => {
        Object.assign(user, req.body);
        user.save();
        return res.status(200).json({ message: user })
      }).catch(err => {
        err.status = 404
        return next(err)
      })
    }
    else {
      return res.status(403).json({ message: "Incorrect password" })
    }
  })
})

// edit a recipe
router.patch("/:userId/recipes/:recipeId", userAuth.setRequestData, userAuth.authUser, userAuth.isOwnerOfRecipe, async (req, res, next) => {

  const updatedRecipeData = req.body;
  if (updatedRecipeData.tags) {
    const formattedTags = await serverUtil.handleExistingTags(req.body.tags, Tag, req.user.id);
    updatedRecipeData.tags = formattedTags;
  }

  await recipeModel.findByIdAndUpdate(req.recipe.id,
    {$set:updatedRecipeData}
    ).then((result)=>{return res.status(200).json({result})})
    .catch(err=>{
      err.status=404
      return(next(err))
    })
});


//Update comment by id
router.put('/:userId/comments/:commentId', userAuth.setRequestData, userAuth.authUser, userAuth.isOwnerOfComment, async (req, res, next) => {
    const newComment = req.body.comment
    const id = req.comment.id
    Comment.findByIdAndUpdate(id,{comment:newComment}).then((result)=>{
      return res.status(200).json({
        message: "Comment updated",
        body: result
    })
    }).catch(err=>{
      err.status=400
      return next(err)
    })
  })

//DELETE----------------------------------
//Delete comment by id
router.delete('/:userId/recipes/:recipeId/comments/:commentId', userAuth.setRequestData, userAuth.authUser, userAuth.isOwnerOfComment, async (req, res, next) => {
  const commentId = req.comment.id
  const recipeId = req.recipe.id

  try {

    await recipeModel.findByIdAndUpdate(recipeId,{ $pull: { comments: { _id: commentId } } });
    await Comment.findOneAndRemove({_id: commentId})
    res.status(200).json({ message: "comment deleted " });

  } catch (err) {
      err.status = 500;
      return next(err);
  }
});


//Delete user by Id
router.delete("/:userId", userAuth.setRequestData, userAuth.authUser, async (req,res,next)=>{
  const userId = req.user.id
  await userModel.findByIdAndDelete(userId).then(async ()=>{
    //now i need to delete all the recipes associated with the user
    await recipeModel.deleteMany({owner : userId})

    return res.status(200).json({message:"User deleted"})
  }).catch(err=>{
    err.status=404
    err.message="User not found"
    return next(err)
  })
})


// DANGER ZONE -------------------------------------------------------
// Method to delete everything
router.delete('/', async (req, res,next) => {
  try {
    // First, delete all recipes associated with users
    await recipeModel.deleteMany({});

    // Then, delete all users
    await userModel.deleteMany({});

    await Comment.deleteMany({})

    res.status(200).json({ message: 'All users and their associated recipes have been deleted.' });
  } catch (err) {

    return next(err)
  }
});




//DELETE----------------------------------
//Delete favourite recipe
router.delete("/:userId/recipes/:recipeId/favoriteDeletion", userAuth.setRequestData, userAuth.authUser, async (req, res, next) => {
    const userId = req.params.userId;
    const recipeId = req.params.recipeId;
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const index = user.favouriteRecipes.indexOf(recipeId);
      if (index === -1) {
        throw new Error('Recipe not found in favourites');
      }

      user.favouriteRecipes.splice(index, 1);
      await user.save();
      return res.status(200).json({ message: 'Recipe removed from favourites' });
    } catch (error) {
      return next(error)
    }

})
