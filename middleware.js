const ExpressError = require('./utils/ExpressError');// uses utitlity class for express errors
const { campgroundSchema, reviewSchema } = require('./schemas.js'); //joi schema
const Campground = require('./models/campground'); //imports the Campground database

//middlware to check if a user is logged in
module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) { //checks if user is signed in via the passport authentication and session
        req.session.returnTo = req.originalUrl; //stores where the user is currently for use with redirects and returning to where they are if asked to login, etc.
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}

//middleware to make sure camground information is correctly entered
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body); //calls schemas.js
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //maps over array of error details
        throw new ExpressError(msg, 400); //utilize standard error method below
    } else {
        next();
    }
    //console.log(result);
}

//middlware to see if current user is author of campground
module.exports.isAuthor = async(req, res, next) => {
    const{ id } = req.params;
    const campground = await Campground.findById(id);
        if (!campground.author.equals(req.user._id)) {
            req.flash('error', 'You do not have permission for this action.');
            return res.redirect(`/campgrounds/${id}`);
        }
    next();
}

//middlware to make sure review information is correct
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body); //calls schemas.js
    if (error) {
        const msg = error.details.map(el => el.message).join(','); //maps over array of error details
        throw new ExpressError(msg, 400); //utilize standard error method below
    } else {
        next();
    }
    //console.log(result);
}