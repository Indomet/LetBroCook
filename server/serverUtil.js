regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    const validateEmail = function(email) {
    return regex.test(email)
};



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

module.exports = {
    validateEmail,
    handleExistingTags
}
