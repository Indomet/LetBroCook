var mongoose = require("mongoose");
const userModel = require("./userModel");
var Schema = mongoose.Schema
const serverUtil = require("../serverUtil.js")

var tagSchema = new Schema({
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    name: {
     type: String,
     unique : false,
    }
});

var commentSchema = new Schema({
   ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    recipeId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming your recipe has an ID
      required: true,
    },
      comment: String,
      author: String,
      date: {type: Date, default : Date.now},
});

var recipeSchema= new Schema(
{
   /*ingredients : { //for now its just an array but ideally it would be a map/dict
      type: Array,
      required: true,
   },*/
   title: {
      type: String
   },
   image: {
      type: String
   },
   owner: {
      type: Schema.Types.ObjectId,
      ref: "Owner"
   },
   sectionsAndIngredients: {
      type: Map,
      of: Array
    }
   ,
   steps: {
      type: Array,
      required: true,
      default: "No available steps"
   },
   servings: {
      type: String, 
      required: true,
      default: "Empty serving info"
   },
   description: {
      type: String,
      required: true,
      default: "Empty description"
   },
  tags: [tagSchema],

   nutritionalInfo : {
      type: Array,
      required: true,
      default: "No nutritional info",
   },
   comments: [{
      type: Schema.Types.ObjectId,
      ref: "Comment",
      _id:false
  }],

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel'
}
}
)

recipeSchema.index({title: 'text'});


/*recipeSchema.post('save', function(doc) {
   serverUtil.writeToFile('./RecipeDataModel.json',recipeModel)
   })

recipeSchema.post("deleteOne", function(doc) {
       serverUtil.writeToFile('./RecipeDataModel.json',recipeModel)
       })
*/
const recipeModel = mongoose.model("recipes",recipeSchema)
var Tag = mongoose.model("Tag", tagSchema); // Define the Tag model
var Comment = mongoose.model("Comment", commentSchema); // Define the Tag model


recipeSchema.pre("findOneAndRemove", async function(next) {
    await Comment.deleteMany({ recipeId: this._conditions._id })
    .catch(function(err){
        return next(err)
    });
 })





module.exports = {
   recipeModel: recipeModel,
   Tag: Tag,
   Comment: Comment
}
