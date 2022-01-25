//load express module
const express = require('express');
const path = require('path'); //runs path module
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
//const { campgroundSchema } = require('./schemas.js');
const { reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync'); //uses catchAsync utility to wrap asyn errors and forward to next
const methodOverride = require('method-override'); //allows for overriding PUT, PATCH, etc.
//const Campground = require('./models/campground'); //imports the Campground database
const Review = require('./models/review');
//const ExpressError = require('./utils/ExpressError');// uses utitlity class for express errors

const campgrounds = require('./routes/campgrounds'); //uses the routes defined in routes/campgrounds.js

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    //useNewUrlParser: true,  //depricated since course video
    //useCreateIndex: true,  //depricated since course video
    //useUnifiedTopology: true  //depricated since course video
});

//bind connection to error and open events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

//uses the ejs-mate engine for layout design
app.engine('ejs', ejsMate);

//use ejs and set views directory. Lets you run app from within other directories
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse the request body
app.use(express.urlencoded({ extended: true }))
//use method override
app.use(methodOverride('_method'));




const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); //calls schemas.js
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //maps over array of error details
        throw new ExpressError(msg, 400); //utilize standard error method below
    } else {
        next();
    }
    //console.log(result);
}

app.use('/campgrounds', campgrounds) //prefix for routes and the route defined above

//route (use render method of express. it knows the file extention because of the app.set above, and it looks in the views folder by default)
app.get('/', (req, res) => {
    //res.send('HELLO FROM YELP CAMP') //test that it's working
    res.render('home');
})

//CAMPGROUND ROUTES
//testing adding a document
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'my backyard', description: 'cheap camping!'});
//     await camp.save();
//     res.send(camp);
// })



//REVIEW ROUTES
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})//modgo $pull operator
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

//ERRORS
//404 error for paths that don't exist
app.all('*', (req, res, next) => { //* means all paths
    next(new ExpressError('General Error Occurred', 404));
})

//Basic error handling
app.use((err, req, res, next) => {
    //const { statusCode = 500, message = "Something went wrong" } = err;
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render('error', { err }); //use error.js in /views, pass entire error
    //res.send("Something is wrong!")
})

//listening on port
app.listen(3000, () => {
    console.log('Serving on port 3000');
})