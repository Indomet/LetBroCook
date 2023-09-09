var mongoose = require("mongoose")
var Schema = mongoose.Schema

var tagSchema = new Schema({
   name: {
     type: String,
     unique: true
   },
});

var recipeSchema= new Schema(
{
   ingredients : { //for now its just an array but ideally it would be a map/dict
      type: Array,
      required: true,
   }, 
   steps: {
      type: Array,
      required: true,
      default: "No available steps"
   },
   serving: {
      type: String,
      required: true,
      default: "Empty serving info"
   },
   description: {
      type: String,
      required: true,
      default: "Empty description"
   },
   /*tags: {
      type: Array,
      required: true,
      default: {
         enum:['tag1', 'tag2', 'tag3', 'tag4']
      }  
   },*/
   tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
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
  }]
}
)

const recipeModel = mongoose.model("recipes",recipeSchema)
var Tag = mongoose.model("Tag", tagSchema); // Define the Tag model

module.exports = {
   recipeModel: recipeModel,
   Tag:Tag
}