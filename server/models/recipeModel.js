var mongoose = require("mongoose")
var Schema = mongoose.Schema

var tagSchema = new Schema({
   name: {
     type: String,
     unique : false,
   }
});

var recipeSchema= new Schema(
{
   /*ingredients : { //for now its just an array but ideally it would be a map/dict
      type: Array,
      required: true,
   },*/
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
  tags: [{
      type: Schema.Types.ObjectId,
      ref: "Tag",
      _id:false
   }],

   nutritionalInfo : {
      type: Array,
      required: true,
      default: "No nutritional info",
   },
   comments: [{type: {
      type: String
    },
      body: String,
      author: String,
      date: {type: Date, default : Date.now},
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserModel'
}
}
)

recipeSchema.index({title: 'text'});


const recipeModel = mongoose.model("recipes",recipeSchema)
var Tag = mongoose.model("Tag", tagSchema); // Define the Tag model

module.exports = {
   recipeModel: recipeModel,
   Tag:Tag
}
