const mongoose = require('mongoose');
const { campgroundSchema } = require('../schemas');
const Review = require('./review');
const Schema = mongoose.Schema; //shortcut for references to schema

//virtual image use method to display thumbnail sized photos
const ImageSchema = new Schema ({ //array to hold image name and url for cloudinary
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function() { //virtual property not stored in mongo. good for temorary information
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } }; //helps Mongoos include virtuals when a document is converted to JSON. pass into schema. (see video 555)

const CampgroundSchema = new Schema({
    title: String,
    // images: {
    //     url: String,
    //     filename: String
    // },
    images: [ImageSchema], 
    price: Number,
    description: String,
    geometry: { //used from Mongoose docs https://mongoosejs.com/docs/geojson.html. Mongoose has lots of geo functionality and requires this format
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'], // 'location.type' must be 'Point'
          required: true
        },
        coordinates: {
          type: [Number],
          required: true
        }
      },
    location: String,
    author: { //adds field for user author of campground
        type: Schema.Types.ObjectId,
        ref: 'User' //User model
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: 'Review' //review model
    }]
}, opts);

//creates virtual properties specifically for mapbox popup in campground index view
CampgroundSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

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