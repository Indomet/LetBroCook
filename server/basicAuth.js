const { model } = require("mongoose")
const { restart } = require("nodemon")

//If no valid user was found by setUser, req.user will become null, else pass it on to the next middleware
function authUser(req, res, next){
    console.log('Authenticating...')
    if(req.user == null){
        res.status(403)
        return res.send('You must be logged in')
    }
    console.log(req.user.name)
    next()


}

function isOwnerOfRecipe(req, res, next){
    console.log('Authenticating Recipe...')
    if(recipe == null){
        res.status(404)
        return res.send('Recipe not found')
    }else{
        if(recipe.owner.toString() != req.user.id){
            res.status(403)
            return res.send('You do not have permission')
        }
    }


    next()
}

module.exports = {
    authUser,
    isOwnerOfRecipe
}
