var express = require("express");
var mongoose = require("mongoose");
var morgan = require("morgan");
var path = require("path");
var cors = require("cors");
var history = require("connect-history-api-fallback");
const recipeModel = require("./models/recipeModel.js"); //. for windows
const userModel = require("./models/userModel.js");

// Variables
var mongoURI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/LetBroCook";
var port = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => {
    console.log(`Connected to MongoDB with URI: ${mongoURI}`);
  })
  .catch((err) => {
    console.error(`Failed to connect to MongoDB with URI: ${mongoURI}`);
    console.error(err.stack);
    process.exit(1);
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

app.get('/users', function (request, response, next) {
    request.params.id
    userModel.find({})
    .then(function (users) {
        response.json({ 'users': users });
    })
    .catch(function (error) {
        response.status(500).json({ message : error.message})
        return next(error); // Handle the error using Express's error handling middleware
    });
})



//user login

//function to signup user
app.post("/signup", (req, res, next) => {
  var user = new userModel(req.body);
  user.save()
  .then(function (user){
    res.status(201).json(user)
  })
  .catch(function(error){
    next(error)
  })
});

//add recipe to DB
app.post("/recipe/create", (req, res, next) => {
  var recipe = new recipeModel(req.body);
  recipe
    .save()
    .then(function (recipe) {
      res.status(201).json(recipe);
    })
    .catch((err) => {
      next(err);
    });
});

// override recipe put
app.put("/recipe/:id", function(req, res){
  var id = req.params.id;
  recipeModel
    .findById(id)         //there is findByIDAndUpdate methodm todo check it out
    .then(async function(recipe){
      if (recipe == null) { 
       return res.status(404).json({ message: "recipe is null" }) 
      }
      recipe.ingredients = req.body.ingredients;
      recipe.steps = req.body.steps 
      recipe.serving = req.body.serving
      recipe.description = req.body.description 
      recipe.tags =req.body.tags 
      recipe.nutritionalInfo = req.body.nutritionalInfo 
      await recipe.save();
      res.json(recipe)
    })
    .catch(function (err) {
      return res.status(500).json({message: err.message });
    })
  })


// override user  put 
app.put("/user/:id",  function (req, res){
  var id = req.params.id;
  userModel
    .findById(id)
    .then(async function (user){
      if (user == null) {
        return res.status(404).json({message: "user is null"})
      }
      user.username = req.body.username
      user.email = req.body.email
      user.password = req.body.password
      user.name = req.body.name
      user.recipes = req.body.recipes
      await user.save(); // await is used to catch the error
      res.json(user);
    })
    .catch(function (err) {
      return res.status(500).json({message: err.message });
    })
    
})

// update recipe 
app.patch("/recipe/:id", function (req, res) {
  var id = req.params.id;
  recipeModel
    .findById(id)
    .then(function (recipe) {
      if (recipe == null) {
        return res.status(404).json({ message: "recipe is null" });
      }
      Object.assign(recipe, req.body); // Update user object with values from req.body instead of writing them one by one
      recipe.save();
      res.json(recipe);
    })
    .catch(function (err) {
      return res.status(500).json({message: err.message });
    })
});

// update user 
app.patch("/user/:id", function (req, res) {
  var id = req.params.id;
  userModel
    .findById(id)
    .then(function (user) {
      if (user == null) {
        return res.status(404).json({ message: "user is null" });
      }
      
      Object.assign(user, req.body); 
      
      user.save();
      res.json(user);
    })
    .catch(function (err) {
      return res.status(500).json({message: err.message });
    })
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
