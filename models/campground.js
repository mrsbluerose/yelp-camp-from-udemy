const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema; //shortcut for references to schema

const CampgroundSchema = new Schema({
    title: String,
    images: [ //array to hold image name and url for cloudinary
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author: { //adds field for user author of campground
        type: Schema.Types.ObjectId,
        ref: 'User' //User model
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review' //review model
    }]
})

//mongo middleware. Instructor's recommendation
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if(doc){
        await Review.deleteOne({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

//compiles the model, looking for a pluralized, lowercased version of the first parameter in the database and exports it to use.
module.exports = mongoose.model('Campground', CampgroundSchema);