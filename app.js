//load express module
const express = require('express');
const path = require('path'); //runs path module
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');// uses utitlity class for express errors
const methodOverride = require('method-override'); //allows for overriding PUT, PATCH, etc.
const Joi = require('joi');

//const { campgroundSchema } = require('./schemas.js');
//const { reviewSchema } = require('./schemas.js');
//const catchAsync = require('./utils/catchAsync'); //uses catchAsync utility to wrap asyn errors and forward to next
//const Campground = require('./models/campground'); //imports the Campground database
//const Review = require('./models/review');

const campgrounds = require('./routes/campgrounds'); //uses the routes defined in routes/campgrounds.js
const reviews = require('./routes/reviews');

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

app.engine('ejs', ejsMate); //uses the ejs-mate engine for layout design
//use ejs and set views directory. Lets you run app from within other directories
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })) //parse the request body
app.use(methodOverride('_method'));//use method override

//use the campground and review
app.use('/campgrounds', campgrounds); //prefix for routes and the route defined above
app.use('/campgrounds/:id/reviews', reviews);

//route (use render method of express. it knows the file extention because of the app.set above, and it looks in the views folder by default)
app.get('/', (req, res) => {
    //res.send('HELLO FROM YELP CAMP') //test that it's working
    res.render('home');
})

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