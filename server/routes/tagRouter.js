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



//Get all tags
router.get("/", function (req, res, next) {
  //label cache-ability
  res.set("Cache-control", `no-store`);

  const handleSuccess = (tags) => {
    res.status(200).json({ tags: tags });
  }

  const handleFailure = (error) => {
    error.status=400
    return next(error); // Handle the error using Express's error handling middleware
  }

  thenAndCatch({}, Tag.find.bind(Tag), handleSuccess, handleFailure);

    /*Tag.find({})
      .then(function (tags) {
        res.status(200).json({ tags: tags });
      })
      .catch(function (error) {
        error.status=400
        return next(error); // Handle the error using Express's error handling middleware
    });*/
});

function thenAndCatch(query, modelMethod, thenFunction, catchFunction) {
  modelMethod(query).then(thenFunction).catch(catchFunction);
}
//Delete all tags
router.delete("/",async function(req,res,next){

  const handleSuccess = (tags) => {
    return res.status(200).json({message:"All tags are deleted"})
  }

  const handleFailure = (error) => {
    error.status=404
    return next(error);
  }

  thenAndCatch({}, Tag.deleteMany.bind(Tag), handleSuccess, handleFailure);

  /*Tag.deleteMany({}).then(()=>{
      return res.status(200).json({message:"All tags are deleted"})}
  ).catch(err=>{
      err.status=404
      return next(err)
  })*/
})

//Get tag by id
router.get("/:tagId", userAuth.setRequestData, async function(req, res, next){
  const handleSuccess = (tag) => {
    return res.status(200).json({tag:tag}).then
  }
  const handleFailure = (error) => {
    error.status=404
    return next(error)
  }
  thenAndCatch(req.params.tagId, Tag.findById.bind(Tag), handleSuccess, handleFailure);

  /*const tagId = req.params.tagId
  await Tag.findById(tagId).then((tag)=>{
    return res.status(200).json({tag:tag}).then})
    .catch((err)=>{
      err.status=404
      return next(err)
    })
  /*try{
    res.status(200).json({tag : req.tag})
  }
  catch(err){
    err.status = 404
    return next(err)
  }*/
})

//delete one tag by ID
router.delete("/:tagId", async function(req,res,next){
    const handleSuccess = (tag) => {
      return res.status(200).json({
        message: "Tag deleted",
        tag: tag
    })
    }
    const handleFailure = (error) => {
      error.status=400
      return next(error)
    }
    thenAndCatch({_id:req.params.tagId}, Tag.deleteOne.bind(Tag), handleSuccess, handleFailure);
    /*const tagId = req.params.tagId
    await Tag.deleteOne({_id:tagId}).then((result)=>{
      return res.status(200).json({
        message: "Tag deleted",
        tag: result
    })
    }).catch(err=>{
      err.status=400
      return next(err)
    })*/
  })

//Update one tag by id
router.patch("/:tagId", userAuth.setRequestData, userAuth.authUser, async function (req, res, next) {
  const handleSuccess = async (tag) => {
    if (tag.ownerId != req.user.id) { return res.status(401).json({ message: "Unauthorized" })}
    console.log('tag before'+tag)
    Object.assign(tag, req.body);
    console.log(tag)
    await tag.save();
    return res.status(200).json(tag)
  }
  const handleFailure = (error) => {
    error.status=404
    return next(error)
  }
  thenAndCatch(req.params.tagId, Tag.findById.bind(Tag), handleSuccess, handleFailure);
  /*const tagId = req.params.tagId
  const tag = await Tag.findById(tagId)
  if (tag.ownerId != req.user.id) { return res.status(401).json({ message: "Unauthorized" }) }
  await Tag.findById({
        _id: tagId, 
    })
    .then(async tag => {
      Object.assign(tag, req.body);
      await tag.save();
      return res.status(200).json(tag)
    }).catch(err => {
      err.status = 404
      return next(err)
    })*/
})

//Create a tag
//Must have userId in request body
router.post("/", userAuth.setRequestData, userAuth.authUser, async function(req, res, next) {
  const newTag = req.body.tag;
  const query = { name: newTag };

  try {
    const existingTag = await Tag.findOne(query);
    if (existingTag) {
      return res.status(409).json({ message: "Tag already exists" });
    }

    const data = { name: newTag, ownerId: req.user.id };
    const handleSuccess = (result) => {
      return res.status(201).json({
        message: "Tag posted",
        tag: result
      });
    }
    const handleFailure = (error) => {
      error.status = 400;
      return next(error);
    }
    thenAndCatchWithParams(query, data, { upsert: true, new: true }, Tag.findOneAndUpdate.bind(Tag), handleSuccess, handleFailure);
  } catch (error) {
    error.status = 400;
    return next(error);
  }

    /*const existingTag = await Tag.find({name:newTag})//will return empty array if no tag exists
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
    }*/
  })
  
  function thenAndCatchWithParams(query, data, options, modelMethod, thenFunction, catchFunction) {
    modelMethod(query, data, options).then(thenFunction).catch(catchFunction);
  }
