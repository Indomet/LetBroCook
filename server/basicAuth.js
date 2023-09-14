const { model } = require("mongoose")
const { restart } = require("nodemon")

//If no valid user was found by setUser, req.user will become null, else pass it on to the next middleware

//Use to verify user access right to operation
function authUser(req, res, next){
    console.log('Authenticating...')
    if(!req.user){
        res.status(403)
        return res.send('You must be logged in')
    }
    console.log(req.user.name)
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
    console.log(req.recipe.id)
    next()
}

module.exports = {
    authUser,
    isOwnerOfRecipe
}
