const fs = require('fs');

regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const validateEmail = function(email) {
    return regex.test(email)
};



//  handle existing tags
const handleExistingTags = async (tags,model, userId) => {
    const formattedTags = [];
    for (const element of tags) {
      let existingTag = await model.findOne({ name: element });

      if (!existingTag) {
        existingTag = new model({
             name: element,
             ownerId: userId
            });
        await existingTag.save();
      }

      formattedTags.push(existingTag);
    }

    return formattedTags;
  };


//TODO USE THIS METHOD WHEN SAVING USER OR RECIPE MODELS TO UPDATE THE JSON FILE TO REFLECT THE CHANGES
//BY USING SCHEMA.POST
const writeToFile = function(filePath,model){
model.find({}).then(data=>{
    fs.writeFile(filePath,JSON.stringify(data,null,4),function(err){
        if(err){
            console.log(err)
        }
        else{
            console.log("File written")
        }
    })
})}  



module.exports = {
    validateEmail,
    handleExistingTags,
    writeToFile}
