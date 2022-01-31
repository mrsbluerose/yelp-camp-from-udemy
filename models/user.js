const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema( {
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose); //pass in from pasport package. creates username, password fields, makes them unique, and adds methods.

module.exports = mongoose.model('User", UserSchema');