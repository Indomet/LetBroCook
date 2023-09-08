var mongoose = require("mongoose")
var Schema = mongoose.Schema

var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

var validateEmail = function(email) {
    return regex.test(email)
};

var userSchema= new Schema(
    {
        username:  {
            type: String,
            required: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: true,
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [regex, 'Please fill a valid email address']
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        recipes: {
            type: [Schema.Types.ObjectId],
            ref: 'recipes'
        },

        favouriteRecipes: {
            type: [Schema.Types.ObjectId],
            ref: 'favouriteRecipes'
        }
    }
)

const userModel = mongoose.model('users', userSchema);
module.exports = userModel
