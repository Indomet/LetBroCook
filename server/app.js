var express = require("express");
var mongoose = require("mongoose");
var morgan = require("morgan");
var path = require("path");
var cors = require("cors");
var history = require("connect-history-api-fallback");
const {recipeModel,Tag} = require("./models/recipeModel.js"); //. for windows
const userModel = require("./models/userModel.js");


// Variables
var mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LetBroCook";
var port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoURI).catch(function (err) {
  if (err) {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
  }
  console.log(`Connected to MongoDB with URI: ${mongoURI}`);
});

mongoose.connection.on('error', function(error){
    console.error(error)
})
mongoose.connection.once('open', function(){
    console.log('Connected to database')
})

// Create Express app
var app = express();
// Parse requests of content-type 'application/json'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// HTTP request logger
app.use(morgan("dev"));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options("*", cors());
app.use(cors());

// Import routes
app.get("/api", function (req, res) {
  res.json({ message: "Welcome to your DIT342 backend ExpressJS project!" });
});

app.get('/v1/users', function (req, res, next) {
  //label cache-ability
    res.set('Cache-control', `no-store`)

    req.params.id
    userModel.find({})
    .then(function (users) {
        res.json({ 'users': users });
    })
    .catch(function (error) {
        res.status(500).json({ message : error.message})
        return next(error); // Handle the error using Express's error handling middleware
    });
})

app.get("/v1/recipes/:recipeid",(req,res,next) =>{
  //label cache-ability
  res.set('Cache-control', `no-store`)
  recipeModel.findById(req.params.recipeid).
  then(recipe => {
    res.status(200).json({"Recipe":recipe})}).
  catch(err =>{return next(err)})
});

app.get("/v1/users/:userid",(req,res,next) =>{
  //label cache-ability
  res.set('Cache-control', `no-store`)
  userModel.findById(req.params.userid).
  then(user => {res.status(200).json({"User":user})}).
  catch(err =>{return next(err)})
});


app.get('/v1/recipes', function (req, res, next) {
  //label cache-ability
  res.set('Cache-control', `no-store`)
  req.params.id
  recipeModel.find({})
  .then(function (users) {
      res.json({ 'recipes': users });
  })
  .catch(function (error) {
      res.status(500).json({ message : error.message})
      return next(error); // Handle the error using Express's error handling middleware
  });
})
app.get('/v1/tags', function (req, res, next) {
  //label cache-ability
  res.set('Cache-control', `no-store`)
  req.params.id
  Tag.find({})
  .then(function (tags) {
      res.json({ 'tags': tags });
  })
  .catch(function (error) {
      response.status(500).json({ message : error.message})
      return next(error); // Handle the error using Express's error handling middleware
  });
})
//user login

//function to signup user
app.post("/v1/users/signup", (req, res, next) => {
  var user = new userModel(req.body);
  user.save()
  .then(function (user){
    res.status(201).json(user)
  })
  .catch(function(error){
    return next(error)
  })
});
//add a comment by a user to a certain recipe
app.post('/v1/users/:userId/recipes/:recipeId/comment',  (req, res,next) => {
  const { userId, recipeId } = req.params;
   userModel.findById(userId).then(user => {
    recipeModel.findById(recipeId).then(async recipe=>{
      const {body} = req.body
      const newComment = {body: body,
                          author : user.username}
      recipe.comments.push(newComment)
       recipe.save()
      console.log("pushed")
      res.status(201).json(newComment)
    }).catch(err=> {return next(err)})
  }).catch(err=> {return next(err)})

})

//add a recipe to a users favourited list
app.post('/v1/users/:userId/favorite-recipes/:recipeId', async (req, res,next) => {
  const { userId, recipeId } = req.params;
  try{
    //attempt to find user
    const user = await userModel.findById(userId)
    if(!user){
      //return resource not found error
      return res.status(404).json({message: "User does not ecist"})
    }
    
    user.favouriteRecipes.push(recipeId)
    //request created
    res.status(201).json({message: "Recipe added to favourite list"})

  }

  catch(error){
    return next(error)
  }

});



app.post("/v1/users/:userId/create-recipe/",  async (req, res, next) => {
  const recipeData = req.body;
  const unformattedTags = req.body.tags

  try {
    var formattedTags = []
    for(const element of unformattedTags){
      //make a query to find if a tag already exists
      let existingTag = await Tag.findOne({name: element})
      //if the tag doesnt exist create a new one and save it
      if(!existingTag){
        existingTag = new Tag({name:element})
        await existingTag.save()
        }

        formattedTags.push(existingTag);
        recipeData.tags = formattedTags;
    }
  } catch (err) {
    return next(err);
  }

  var recipe = new recipeModel(recipeData);
  recipe
    .save()
    .then(function (recipe) {
      userModel.findById(req.params.userId).then(user => {
        user.recipes.push(recipe.id)
        user.save().then(function(){res.status(201).json({message:"Recipe created",
                                                          Recipe : recipe})}).
        catch(err =>{return next(err)})
      })
    })
    .catch((err) => {
      return next(err);
    });
});





// update
app.patch("/v1/recipe/:id", function (req, res) {
  var id = req.params.id;
  var recipe = new recipeModel(req.body);
  recipeModel
    .findById(id)
    .then(function (recipe) {
      if (recipe == null) {
        return res.status(404).json({ message: "recipe is null" });
      }
      recipe.ingredients = (req.body.ingredients || recipe.ingredients);
      recipe.steps = (req.body.steps || recipe.steps)
      recipe.serving = (req.body.serving || recipe.serving)
      recipe.description = (req.body.description || recipe.description)
      recipe.tags =(req.body.tags || recipe.tags)
      recipe.nutritionalInfo = (req.body.nutritionalInfo || recipe.nutritionalInfo)
      recipe.save();
      res.json(recipe);
    })
    .catch(function (err) {
      return res.status(500).json({ message: "recipe is not found" });
    });
});
// Catch all non-error handler for api (i.e., 404 Not Found)
app.use("/api/*", function (req, res) {
  res.status(404).json({ message: "Not Found" });
});

// Configuration for serving frontend in production mode
// Support Vuejs HTML 5 history mode
app.use(history());
// Serve static assets
var root = path.normalize(__dirname + "/..");
var client = path.join(root, "client", "dist");
app.use(express.static(client));

// Error handler (i.e., when exception is thrown) must be registered last
var env = app.get("env");
// eslint-disable-next-line no-unused-vars

app.use(function (err, req, res, next) {
  console.error(err.stack);
  var err_res = {
    message: err.message,
    error: {},
  };
  if (env === "development") {
    // Return sensitive stack trace only in dev mode
    err_res["error"] = err.stack;
  }
  res.status(err.status || 500);
  res.json(err_res);
});

app.listen(port, function (err) {
  if (err) throw err;
  console.log(`Express server listening on port ${port}, in ${env} mode`);
  console.log(`Backend: http://localhost:${port}/api/`);
  console.log(`Frontend (production): http://localhost:${port}/`);
});

module.exports = app;
