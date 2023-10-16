
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




module.exports = {
    validateEmail,
    handleExistingTags,}
