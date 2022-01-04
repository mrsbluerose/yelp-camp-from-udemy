const mongoose = require('mongoose');
const Schema = mongoose.Schema; //shortcut for references to schema

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String
})

//compiles the model, looking for a pluralized, lowercased version of the first parameter in the database and exports it to use.
module.exports = mongoose.model('Campground', CampgroundSchema);