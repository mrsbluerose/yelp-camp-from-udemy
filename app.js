//load express module
const express = require('express');
const path = require('path'); //runs path module
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const { campgroundSchema } = require('./schemas.js');
const { reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync'); //uses catchAsync utility to wrap asyn errors and forward to next
const methodOverride = require('method-override'); //allows for overriding PUT, PATCH, etc.
const Campground = require('./models/campground'); //imports the Campground database
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');// uses utitlity class for express errors

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


const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //calls schemas.js
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //maps over array of error details
        throw new ExpressError(msg, 400); //utilize standard error method below
    } else {
        next();
    }
    //console.log(result);
}

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


//route (use render method of express. it knows the file extention because of the app.set above, and it looks in the views folder by default)
app.get('/', (req, res) => {
    //res.send('HELLO FROM YELP CAMP') //test that it's working
    res.render('home');
})

//testing adding a document
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'my backyard', description: 'cheap camping!'});
//     await camp.save();
//     res.send(camp);
// })

//list of all campgrounds
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
}))

//create new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//save new campground
//uses async wrapper class in utils/catchAsync
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    //throws error if incomplete or incorrect type of data sent
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); 


    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

// //uses try/catch and adds next parameter to send to basic error handler
// app.post('/campgrounds', async (req, res, next) => {
//     try {
//         const campground = new Campground(req.body.campground);
//         await campground.save();
//         res.redirect(`/campgrounds/${campground._id}`)
//     } catch (e) {
//         next(e);
//     }

// })

//show page for a campground
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews'); //populating reviews;
    res.render('campgrounds/show', { campground });
}))

//edit a campground
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

//submit the edits
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params; //deconstruct
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //spread operator
    res.redirect(`/campgrounds/${campground._id}`)
}))

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

//
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

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