const mongoose = require('mongoose');
const Schema = mongoose.Schema; //shortcut for references to schema

const CampgroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review' //review model
    }]
})

//compiles the model, looking for a pluralized, lowercased version of the first parameter in the database and exports it to use.
module.exports = mongoose.model('Campground', CampgroundSchema);