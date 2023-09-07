var mongoose = require("mongoose")
var Schema = mongoose.Schema

var userSchema= new Schema(
    {
        userName:  {
            type: String, 
            required: true
        },
        email: {
            type: String, 
            required: true
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
        }
    }
)

const userModel = mongoose.model('users', userSchema);
module.exports = userModel