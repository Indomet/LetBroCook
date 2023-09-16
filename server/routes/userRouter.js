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
//ADD BACK USER AUTH ONLY HAD ONE
router.get("/:userId/recipes/", async function (req, res, next) {

    await recipeModel.find({owner: req.params.userId})
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
router.get("/:id", (req, res, next) => {
    // Label cache-ability
    res.set("Cache-control", "no-store");
        const user = req.params.id
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

//TODO ADD USER AUTH BACK
router.post("/:userId/recipes/:recipeId/favorite-recipes", async (req, res, next) => {

    userModel.findById(req.params.userId).then(user=>{
      if(!recipeModel.findById(req.params.recipeId))
      {return res.status(404).json({message: "Invalid recipe id"})}

      user.favouriteRecipes.push(req.body.recipeId);
      return res.status(201).json({message: "recipe craeted"})
    }) 
    .catch(err=>{
      err.status=404
      err.message="User not found"
      return next(err)
    })


    try {
      const user = req.user
      user.favouriteRecipes.push(req.body.recipeId);
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
//TODO ADD BACK USER AUTH
//this only had userAuth.authUser
router.post("/:userId/recipes/:recipeId/comments", (req, res, next) => {

    if(!req.params.userId || !req.params.recipeId){
        return res.status(400).json({ message: "Invalid user/recipe" })
    }

    const userId = req.params.userId
    const recipeId = req.params.recipeId
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
//TODO ADD BACK USER AUTH
  router.put("/:userId",  async function (req, res, next) {

    const id = req.params.userId
    const { username, email, password, name, recipes, favouriteRecipes } = req.body;

    await userModel.updateOne({_id:id},
      {$set: {
        username,
        email,
        password,
        name,
        recipes,
        favouriteRecipes
      }
    }).then(()=>{
      return res.status(200).json({message:"User replaced"})})
      .catch(err=>{
        err.status=404
        return next(err)
      })


});

//replace a recipe
//TODO ADD BACK USER AUUTH
//THIS HAD BOTH
router.put("/recipes/:recipeId", async (req, res, next) => {
  const id = req.params.recipeId

  const updatedRecipeData = req.body;
  const unformattedTags = req.body.tags;

  const formattedTags = await serverUtil.handleExistingTags(unformattedTags, Tag);
  updatedRecipeData.tags = formattedTags;


  await recipeModel.findByIdAndUpdate(id,
    {$set:updatedRecipeData, 
      tags:formattedTags})
    
    .then(()=>{
    return res.status(200).json({message:"Recipe replaced"})})
    .catch(err=>{
      err.status=404
      return next(err)
    })

});

//PATCH----------------------------------

// edit a user
//ADD BACK USER AUTHENTICAION
router.patch("/:userId",  async (req, res, next) => {

    await userModel.findById(req.params.userId).then(user=>{Object.assign(user, req.body);
      user.save();
      return res.status(200).json({message:"User updated"})
    }).catch(err=>{
      err.status=404
      return next(err)
    })
})

// edit a recipe
//ADD USER AUTH HAD BOTH
router.patch("/recipes/:id", async (req, res, next) => {

    const updatedRecipeData = req.body;
    const formattedTags = await serverUtil.handleExistingTags(req.body.tags, Tag);
    updatedRecipeData.tags = formattedTags;

    await recipeModel.findByIdAndUpdate(req.params.id,
      {$set:updatedRecipeData}
      ).then((result)=>{return res.status(200).json({result})})
      .catch(err=>{
        err.status=404
        return(next(err))
      })
});


router.post("/recipes/create", userAuth.authUser, async (req, res, next) => {
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
//TODO ADD BACK AUTH

router.patch('/recipes/:recipeId/comments/:commentId/',  async (req, res, next) => {
    //const { commentId, recipeId, comment } = req.body;
    const recipeId = req.params.recipeId
    const commentId = req.params.commentId
    const comment = req.body.comment
    recipeModel.findById(recipeId).then((recipe)=>{

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

//DELETE----------------------------------comment
//TODO ADD BACK USER AUTH THIS HAD ONE
router.delete('/recipes/:recipeId/comments/:commentid', async (req, res, next) => {
  const commentId = req.params.commentid
  const recipeId = req.params.recipeId

  try {
    
    await recipeModel.findByIdAndUpdate(recipeId,{ $pull: { comments: { _id: commentId } } });
     res.status(200).json({ message: "comment deleted " });

  } catch (err) {
      err.status = 500;
      return next(err);
  }
});


//DELETE----------------------------------favourite recipe
//TODO ADD BACK USER AUTH THIS HAD ONE
router.delete("/:userId/recipes/:recipeId/favoriteDeletion", async (req, res, next) => {
  const userId = req.params.userId
  const recipeId= req.params.recipeId
  userModel.findById(userId).then((user)=>{
    index = user.favouriteRecipes.indexOf(recipeId)
    user.favouriteRecipes.splice(recipeId,1)
    user.save()
    res.status(200).json({message: "Fav recipe removed"})
  }
  ).catch((err)=>{
    err.message = "recipe doesnt exist"
    err.status=404
    return next(err)
  })
}) 