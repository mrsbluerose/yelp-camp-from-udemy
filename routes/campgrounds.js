const express = require('express');
const router = express.Router(); //set all routes to be router.whatever
const catchAsync = require('../utils/catchAsync'); //uses catchAsync utility to wrap asyn errors and forward to next
const Campground = require('../models/campground'); //imports the Campground database
const { isLoggedIn } = require('../middleware'); //from middleware file
const { isAuthor } = require('../middleware'); //from middleware file
const { validateCampground } = require('../middleware'); //from middleware file

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
router.get('/new', isLoggedIn, (req, res) => { //isLoggedIn comes from middleware file
    res.render('campgrounds/new');
})

//save new campground
//uses async wrapper class in utils/catchAsync
router.post('/', isLoggedIn, validateCampground, catchAsync(async (req, res, next) => {
    //throws error if incomplete or incorrect type of data sent
    //if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400); 
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id; //saves the currently logged in user as the author 
    await campground.save();
    req.flash('success', 'New campground created'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${campground._id}`)
}))

//show page for a campground
router.get('/:id', catchAsync(async (req, res) => {
    const id = req.params.id;
    if (id.length > 24 || id.length < 24) { //My addition: makes sure ID is exactly 24 characters before checking database
        req.flash('error', 'Campground does not exist.');
        return res.redirect('/campgrounds');
    }
    const campground = await Campground.findById(id).populate('reviews').populate('author'); //populating reviews and author;
    if (!campground) {
        req.flash('error', 'Campground does not exist.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}))

//edit a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params; //deconstruct
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground does not exist.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}))

//submit the edits
router.put('/:id', isLoggedIn, validateCampground, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params; //deconstruct
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //spread operator
    req.flash('success', 'Campground updated'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${campground._id}`)
}))

//delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router;