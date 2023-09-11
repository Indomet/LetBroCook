var express = require("express");
var mongoose = require("mongoose");
var morgan = require("morgan");
var path = require("path");
var cors = require("cors");
var history = require("connect-history-api-fallback");
const { recipeModel, Tag } = require("./models/recipeModel.js"); //. for windows
const userModel = require("./models/userModel.js");
const serverUtil = require('./serverUtil.js');


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

mongoose.connection.on('error', function (error) {
  console.error(error)
})
mongoose.connection.once('open', function () {
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
  userModel.find({})
    .then(function (users) {
      res.json({ 'users': users });
    })
    .catch(function (error) {
      res.status(500).json({ message: error.message })
      return next(error); // Handle the error using Express's error handling middleware
    });
})

app.get("/v1/recipes/:recipeid", (req, res, next) => {
  //label cache-ability
  res.set('Cache-control', `no-store`)
  recipeModel.findById(req.params.recipeid).
    then(recipe => {
      res.status(200).json({ "Recipe": recipe })
    }).
    catch(err => { return next(err) })
});

app.get("/v1/users/:userid", (req, res, next) => {
  //label cache-ability
  res.set('Cache-control', `no-store`)
  userModel.findById(req.params.userid).
    then(user => { res.status(200).json({ "User": user }) }).
    catch(err => { return next(err) })
});


app.get('/v1/recipes', function (req, res, next) {
  //label cache-ability
  res.set('Cache-control', `no-store`)
  recipeModel.find({})
    .then(function (users) {
      res.json({ 'recipes': users });
    })
    .catch(function (error) {
      res.status(500).json({ message: error.message })
      return next(error); // Handle the error using Express's error handling middleware
    });
})
app.get('/v1/tags', function (req, res, next) {
  //label cache-ability
  res.set('Cache-control', `no-store`)
  Tag.find({})
    .then(function (tags) {
      res.json({ 'tags': tags });
    })
    .catch(function (error) {
      response.status(500).json({ message: error.message })
      return next(error); // Handle the error using Express's error handling middleware
    });
})

//function to signup user
app.post("/v1/users/signup", (req, res, next) => {
  var user = new userModel(req.body);
  user.save()
    .then(function (user) {
      res.status(201).json(user)
    })
    .catch(function (error) {
      return next(error)
    })
});

app.get('/v1/user/sign-in', async (req, res, next) => {
  const { email, password } = req.body
  if (!userModel) return res.status(404).json({ message: "Email required" })

  await userModel.findOne({ email: email }).exec().then(user => {
    if (!serverUtil.validateEmail(email)) { return res.status(404).json({ message: "Please input a correct email" }) }
    else if (!user) return res.status(404).json({ message: "Account not registered" })

    user.comparePassword(password, ((err, isMatch) => {
      if (err) { return next(err) }
      else if (isMatch) { res.json(user) }
      else { res.status(401).json({ message: "Email or password is incorrect" }) }

    }))
  }).catch(err => { return next(err) })

})

//add a comment by a user to a certain recipe
app.post('/v1/users/:userId/recipes/:recipeId/comment', (req, res, next) => {
  const { userId, recipeId } = req.params;
  userModel.findById(userId).then(user => {
    recipeModel.findById(recipeId).then(async recipe => {
      const { body } = req.body
      const newComment = {
        body: body,
        author: user.username
      }
      recipe.comments.push(newComment)
      recipe.save()
      res.status(201).json(newComment)
    }).catch(err => { return next(err) })
  }).catch(err => { return next(err) })

})

//add a recipe to a users favourited list
app.post('/v1/users/:userId/favorite-recipes/:recipeId', async (req, res, next) => {
  const { userId, recipeId } = req.params;
  try {
    // attempt to find user
    const user = await userModel.findById(userId)
    if (!user) {
      //return resource not found error
      return res.status(404).json({ message: "User does not exist" })
    }

    // check if recipeId already exists in the favorite recipes
    if (user.favouriteRecipes.includes(recipeId)) {
      return res.status(400).json({ message: "Recipe already in favorite list" })
    }

    user.favouriteRecipes.push(recipeId)
    user.save()
    //request created
    res.status(201).json({ message: "Recipe added to favorite list" })
  } catch (error) {
    return next(error)
  }
});



app.post("/v1/users/:userId/create-recipe/", async (req, res, next) => {
  const recipeData = req.body;
  const unformattedTags = req.body.tags

  try {
    var formattedTags = []
    for (const element of unformattedTags) {
      //make a query to find if a tag already exists
      let existingTag = await Tag.findOne({ name: element })
      //if the tag doesnt exist create a new one and save it
      if (!existingTag) {
        existingTag = new Tag({ name: element })
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
        user.save().then(function () {
          res.status(201).json({
            message: "Recipe created",
            Recipe: recipe
          })
        }).
          catch(err => { return next(err) })
      })
    })
    .catch((err) => {
      return next(err);
    });
});


//  handle existing tags
const handleExistingTags = async (tags) => {
  const formattedTags = [];

  for (const element of tags) {
    let existingTag = await Tag.findOne({ name: element });

    if (!existingTag) {
      existingTag = new Tag({ name: element });
      await existingTag.save();
    }

    formattedTags.push(existingTag);
  }

  return formattedTags;
};


// edit a recipe
app.patch("/v1/users/:userId/edit-recipe/:recipeId", async (req, res, next) => {
  const { userId, recipeId } = req.params;
  const updatedRecipeData = req.body;
  const unformattedTags = req.body.tags;

  try {
    const formattedTags = await handleExistingTags(unformattedTags);
    updatedRecipeData.tags = formattedTags;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await userModel.findById(userId);
    const recipeIndex = user.recipes.indexOf(recipeId);
    // it is -1 because If it's not found, it returns -1.
    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found for this user" });
    }

    const updatedRecipe = await recipeModel.findByIdAndUpdate(recipeId, updatedRecipeData);

    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    const tagDetails = await Tag.find({ _id: { $in: updatedRecipe.tags } });
    res.status(200).json({
      message: "Recipe updated", Recipe: {
        // ... is a spread syntax and i used it to add edited tags in the middle of the model and not at the end
        ...updatedRecipe.toObject(),
        tags: tagDetails,
      }
    });
  } catch (err) {
    return next(err);
  }
});


// edit a user
app.patch("/v1/users/:userId/edit-user", (req, res, next) => {
  var userId = req.params.userId;
  userModel.findByIdAndUpdate(userId, req.body)
    .then(function (user) {
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    })
    .catch(function (error) {
      return next(error);
    });
});

// this one works as well
//   app.patch("/v1/users/:userId/edit-user", function (req, res) {
//     var userId = req.params.userId;
//     userModel
//       .findById(userId)
//       .then(function (user) {
//         if (user == null) {
//           return res.status(404).json({ message: "user is null" });
//         }
//         Object.assign(user, req.body); // this is basically 
//         user.save();
//         res.json(user);
//       })
//       .catch(function (err) {
//         return res.status(500).json({ message: "user is not found" });
//       });
//   });

// edit a comment
app.patch('/v1/users/:userId/recipes/:recipeId/edit-comment/:commentId', async (req, res, next) => {
  try {
    const { userId, recipeId, commentId } = req.params;

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const recipe = await recipeModel.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    const commentToUpdate = recipe.comments.id(commentId);
    if (!commentToUpdate) return res.status(404).json({ message: 'Comment not found' });

    const { body } = req.body;
    commentToUpdate.body = body;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe.comments);
  } catch (err) {
    next(err);
  }
});


//replace a user
app.put("/v1/users/:userId/replace-user", function (req, res, next) {
  var userId = req.params.userId;
  userModel
    .findById(userId)
    .then(function (user) {
      if (user == null) {
        return res.status(404).json({ message: "User not found" });
      }
      const { username, email, password, name, recipes, favouriteRecipes } = req.body;
      user.set({ username, email, password, name, recipes, favouriteRecipes });
      user.save()
        .then(updatedUser => {
          res.json(updatedUser);
        })
        .catch(err => {
          return next(err);
        });
    })
    .catch((err) => {
      return next(err);
    });
});


//replacce a recipe
app.put("/v1/users/:userId/replace-recipe/:recipeId", async (req, res, next) => {
  const { userId, recipeId } = req.params;
  const updatedRecipeData = req.body;
  const unformattedTags = req.body.tags;

  try {
    const formattedTags = await handleExistingTags(unformattedTags);
    updatedRecipeData.tags = formattedTags;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    const user = await userModel.findById(userId);

    const recipeIndex = user.recipes.indexOf(recipeId);
    if (recipeIndex === -1) {
      return res.status(404).json({ message: "Recipe not found for this user" });
    }
    const updatedRecipe = await recipeModel.findById(recipeId);
    if (!updatedRecipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    const { ingredients, steps, serving, description, tags, nutritionalInfo, comments } = req.body;
    updatedRecipe.set({ ingredients, steps, serving, description, tags, nutritionalInfo, comments });

    await updatedRecipe.save();
    const tagDetails = await Tag.find({ _id: { $in: updatedRecipe.tags } });
    res.status(200).json({
      message: "Recipe updated", Recipe: { ...updatedRecipe.toObject(), tags: tagDetails, }
    });

  } catch (err) {
    return next(err);
  }
});

//Delete recipe by id
app.delete('/v1/recipe/deleteOne/:id', function (req, res, next) {
  var id = req.params.id
  recipeModel.findByIdAndDelete(id)
    .then(function (recipe) {
      if (!recipe) {
        return res.status(404).json({ message: "Recipe does not exist" })
      }
      return res.status(200).json({ message: "Recipe deleted", body: recipe })
    }).catch(function (error) {
      return next(error)
    })
})


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
