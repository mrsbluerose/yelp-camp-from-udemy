const express = require('express');
const router = express.Router(); //set all routes to be router.whatever
const catchAsync = require('../utils/catchAsync'); //uses catchAsync utility to wrap asyn errors and forward to next
const ExpressError = require('../utils/ExpressError');// uses utitlity class for express errors
const Campground = require('../models/campground'); //imports the Campground database
const { campgroundSchema } = require('../schemas.js');

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

//CAMPGROUND ROUTES
//testing adding a document
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'my backyard', description: 'cheap camping!'});
//     await camp.save();
//     res.send(camp);
// })

//show of all campgrounds
router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
}))

//create new campground
router.get('/new', (req, res) => {
    res.render('campgrounds/new');
})

//save new campground
//uses async wrapper class in utils/catchAsync
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
    //throws error if incomplete or incorrect type of data sent
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); 
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', 'New campground created'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${campground._id}`)
}))

// //uses try/catch and adds next parameter to send to basic error handler
// router.post('/campgrounds', async (req, res, next) => {
//     try {
//         const campground = new Campground(req.body.campground);
//         await campground.save();
//         res.redirect(`/campgrounds/${campground._id}`)
//     } catch (e) {
//         next(e);
//     }

// })

//show page for a campground
router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews'); //populating reviews;
    res.render('campgrounds/show', { campground });
}))

//edit a campground
router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
}))

//submit the edits
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params; //deconstruct
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //spread operator
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete campground
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;