const express = require('express');
const router = express.Router(); //set all routes to be router.whatever
const catchAsync = require('../utils/catchAsync'); //uses catchAsync utility to wrap async errors and forward to next
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer')
const { storage } = require('../cloudinary');
const upload = multer({ storage }) //define a destination (storage is from cloudinary)
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware'); //from middleware file

router.route('/')
    .get(catchAsync(campgrounds.index)) //show of all campgrounds
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground)); //save new campground. include image as an array to upload to cloudinary (put before validateCampground)

router.get('/new', isLoggedIn, campgrounds.renderNewForm); //create new campground

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))//show page for a campground
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground)) //submit the edits
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) //delete campground

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)) //edit a campground

module.exports = router;