var mongoose = require("mongoose")
var Schema = mongoose.Schema
var bcrypt = require("bcrypt")
var validateEmail = require(".././serverUtil.js").validateEmail


//salt work factor helps against rainbow table attacks if someone gets access of db
//so this makes the key setup more expensive to combat server ddos
const SALT_WORK_FACTOR = 10;

var userSchema= new Schema(
    {
        username:  {
            type: String,
            required: true,
            unique: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            unique: true,
            required: true,
            validate: [validateEmail, 'Please fill a valid email address'],
            match: [regex, 'Please fill a valid email address']
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            unique: true
        },
        recipes: {
            type: [Schema.Types.ObjectId],
            ref: 'recipes'
        },

        favouriteRecipes: {
            type: [Schema.Types.ObjectId],
            ref: 'favouriteRecipes'
        },

    }
)

//middleware function to has password when a suer document is saved
//the hook event aka when the function is called is when saving to the db
userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
userSchema.methods.validateEmail = validateEmail


const userModel = mongoose.model('users', userSchema);
module.exports = userModel
