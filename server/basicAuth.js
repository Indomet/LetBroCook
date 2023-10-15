const { model } = require("mongoose")
const { restart } = require("nodemon")
var mongoose = require("mongoose");
const { recipeModel, Tag , Comment} = require("./models/recipeModel.js"); //. for windows
const userModel = require("./models/userModel.js");

//If no valid user was found by setUser, req.user will become null, else pass it on to the next middleware

//Use to verify user access right to operation
// Must be called before isOwnerOf... methods
function authUser(req, res, next){
    console.log('Authenticating...')
    if(!req.user){
        res.status(403)
        return res.send('You must be logged in')
    }
    //TODO: save session state
    console.log("User: " + req.user.name + " Authenticated.")
    next()


}

//Use to verify user access right to recipe
function isOwnerOfRecipe(req, res, next){
    console.log('Authenticating Recipe...')
    if(!req.recipe){
        res.status(404)
        return res.send('Recipe not found')
    }else{
        if(req.recipe.owner.toString() != req.user.id){
            res.status(403)
            return res.send('You do not have permission')
        }
    }
    console.log("Recipe: " + req.recipe.id + " Authenticated.")
    next()
}

function isOwnerOfComment(req, res, next){
    console.log('Authenticating Comment...')
    if(!req.comment){
        return res.send('Comment not found')
    }else{
        if(req.comment.ownerId.toString() != req.user.id){
            res.status(403)
            return res.send('You do not have permission')
        }
    }
    console.log("Comment: " + req.comment.id + " Authenticated")
    next()
}

function isOwnerOfTag(req, res, next){
    console.log('Authenticating Tag...')
    if(!req.tag){
        return res.send('Tag not found')
    }else{
        if(req.tag.ownerId.toString() != req.user.id){
            res.status(403)
            return res.send('You do not have permission')
        }
    }
    console.log("Tag: " + req.tag.id + " Authenticated")
    next()
}


//Checks validlity of request id parameters, then sets 3 parameters to the req object:
// req.user, req.recipe, req.comment, req.tag these contain the full data of the database objects for ease of access.
// No longer need to call model.find() to get the request objects anywhere else in the code.
async function setRequestData(req, res, next) {
    const userId = req.params.userId || req.body.userId
    const recipeId = req.params.recipeId || req.body.recipeId
    const commentId = req.params.commentId
    const tagId = req.params.tagId

    console.log("request has userId: " + userId)
    console.log("request has recipeId: " + recipeId)
    console.log("request has commentId: " + commentId)
    console.log("request has tagId: " + tagId)

    //If request includes userId
    if (userId) {
        //Check that the ObjectId is in valid format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        await userModel.findById(userId)
        .then(function(user){
            if (!user) {
                return
            }
            req.user = user
        })
        .catch(function(err){
            return next(err)
        })

    }
    //If request includes recipeId
    if(recipeId){

        if (!mongoose.Types.ObjectId.isValid(recipeId)) {
            return res.status(400).json({ message: "Invalid recipe ID format" });
        }

        await recipeModel.findById(recipeId)
        .then(function(recipe){
            if (!recipe) {
                return
            }
            req.recipe = recipe
        })
        .catch(function(err){
            return next(err)
        })
    }
    //If request includes commentId
    if(commentId){
        if (!mongoose.Types.ObjectId.isValid(commentId)) {
            return res.status(400).json({ message: "Invalid comment ID format" });
        }

        await Comment.findById(commentId)
        .then(function(comment){
            if (!comment) {
                return
            }
            req.comment = comment
        })
        .catch(function(err){
            return next(err)
        })
    }
    //If request includes tagId
    if(tagId){
        if (!mongoose.Types.ObjectId.isValid(tagId)) {
            return res.status(400).json({ message: "Invalid tag ID format" });
        }

        await Tag.findById(tagId)
        .then(function(tag){
            if (!tag) {
                return
            }
            req.tag = tag
        })
        .catch(function(err){
            return next(err)
        })
    }
    next()
}

module.exports = {
    authUser,
    isOwnerOfRecipe,
    isOwnerOfComment,
    isOwnerOfTag,
    setRequestData
}
