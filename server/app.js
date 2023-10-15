var express = require("express");
var mongoose = require("mongoose");
var morgan = require("morgan");
var path = require("path");
var cors = require("cors");
var history = require("connect-history-api-fallback");
const { recipeModel, Tag } = require("./models/recipeModel.js"); //. for windows
const userModel = require("./models/userModel.js");
const serverUtil = require('./serverUtil.js')
const { spawn } = require('child_process');

// Spawn a new process for your zPython server
if (process.env.CI !== 'true'){
const pythonServer = spawn('python', ['Recommendation.py']);

// Log any errors from the Python server
pythonServer.stderr.on('data', (data) => {
  console.error(`Python server error: ${data}`);
});

// Log any output from the Python server
pythonServer.stdout.on('data', (data) => {
  console.log(`Python server output: ${data}`);
});
}
const corsOptions ={
  origin:'http://localhost:8080', 
  credentials:true,            //access-control-allow-credentials:true
  optionSuccessStatus:200
}

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

mongoose.connection.on("error", function (error) {
  console.error(error);
});
mongoose.connection.once("open", async function () {
  console.log("Connected to database");
  const count = await recipeModel.countDocuments().exec();
  var originalOGuser = new userModel(
    {
      email:"gusalmual@student.gu.se",
      password:"asimzepeialiareallgs",
      username:"Chef Chef",
      name:"Ali"
    }
  )
  //specify a consisteant and findable id
  originalOGuser._id=mongoose.mongo.BSON.ObjectId.createFromHexString("4eb6e7e7e9b7f4194e000001")

  if(count == 0){
  try {
    recipeData = require("../RecipeData.json");

    for (let i = 0; i < recipeData.length; i++) {
        recipeData[i].tags = await serverUtil.handleExistingTags(recipeData[i].tags, Tag, originalOGuser._id) // Assign the array of ObjectIds to the recipeData

        var recipe = new recipeModel(recipeData[i])
        recipe.owner= originalOGuser._id
        await recipe.save()
        originalOGuser.recipes.push(recipe._id)

      }
      console.log("Database populated")
      originalOGuser.save().catch(function(err){
        return console.error(err)
    })
    }
   catch (err) {
    console.log(err);
  }}
});



//-------------------------------------------------------------------------------------
// Create Express app
var app = express();
// Parse requests of content-type 'application/json'
// HTTP request logger
app.use(morgan("dev"));
// Enable cross-origin resource sharing for frontend must be registered before api
app.options("*", cors());
app.use(cors(corsOptions));

//accounts for 8k pic resolution
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));
//app.use(setUserData)


//Routers
const userRouter = require('./routes/userRouter.js');
const recipeRouter = require('./routes/recipeRouter.js')
const tagRouter = require('./routes/tagRouter.js')

app.use('/v1/users', userRouter)
app.use('/v1/recipes', recipeRouter)
app.use('/v1/tags', tagRouter)

// Import routes
app.get("/api", function (req, res) {
  res.json({ message: "Welcome to your DIT342 backend ExpressJS project!" });
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
