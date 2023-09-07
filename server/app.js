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
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/animalDevelopmentDB";
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



//user login

//function to signup user
app.post("/signup", (req, res, next) => {
  var user = new userModel(req.body);

  if(!validateEmail(user.email)){
    
    next(new Error("Invalid email"))
  }
  else if(userModel.findById(req.body.id)){

  }

  user
    .save()
    .then(function (user) {
      res.status(201).json(user);
    })
    .catch((err) => {
      next(err);
    });
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

// update
app.patch("/recipe/:id", function (req, res) {
  var id = req.params.id;
  var recipe = new recipeModel(req.body);
  recipeModel
    .findById(id)
    .then(function (recipe) {
      if (recipe == null) {
        return res.status(404).json({ message: "recipe is nnull" });
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

function validateEmail(mail){
    return String(mail)
    .toLowerCase()
    .match(//regex to match email patterns
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )  
}
module.exports = app;
