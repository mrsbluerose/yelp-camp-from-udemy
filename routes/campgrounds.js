const express = require('express');
const router = express.Router(); //set all routes to be router.whatever
const catchAsync = require('../utils/catchAsync'); //uses catchAsync utility to wrap async errors and forward to next
const campgrounds = require('../controllers/campgrounds');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware'); //from middleware file

//CAMPGROUND ROUTES
//testing adding a document
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'my backyard', description: 'cheap camping!'});
//     await camp.save();
//     res.send(camp);
// })

//show of all campgrounds
router.get('/', catchAsync(campgrounds.index));

//create new campground
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

//save new campground. Uses async wrapper class in utils/catchAsync
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//show page for a campground
router.get('/:id', catchAsync(campgrounds.showCampground));

//edit a campground
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

//submit the edits
router.put('/:id', isLoggedIn, validateCampground, isAuthor, catchAsync(campgrounds.updateCampground))

//delete campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground))

module.exports = router;