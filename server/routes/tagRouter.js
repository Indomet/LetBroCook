const express = require('express');
var mongoose = require("mongoose");
const router = express.Router();
//just specify in the query options for example such as _method=PATCH to use a patch method
//but the actual form method is post/get
//will be used when deleting all tags for example
var methodOverride = require('method-override')
router.use(methodOverride('_method'))
const axios = require('axios');

const { Tag } = require("../models/recipeModel.js"); //. for windows
const userAuth = require("../basicAuth.js")


module.exports = router

//Must have userId in request body
router.post("/", userAuth.setRequestData, userAuth.authUser, async function(req,res,next){
    const newTag = req.body.tag
    console.log("the tag is"  + newTag)
    const existingTag = await Tag.find({name:newTag})//will return empty array if no tag exists
    if(existingTag.length>0){return res.status(409).json({messsage:"Tag already exists"})}
    else{
      await new Tag({
          name: newTag,
          ownerId: req.user.id
      }).save().then((result)=>{
        return res.status(201).json({
          message: "Tag posted",
          tag: result
      })
      }).catch(err=>{
        err.status=400
        return next(err)
      })
    }
  })