const express = require('express');
const router = express.Router(); //set all routes to be router.whatever
const catchAsync = require('../utils/catchAsync'); //uses catchAsync utility to wrap async errors and forward to next
const campgrounds = require('../controllers/campgrounds');
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' }) //define a destination
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware'); //from middleware file

router.route('/')
    .get(catchAsync(campgrounds.index)) //show of all campgrounds
    //.post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground)); //save new campground
    .post(upload.array('image'), (req, res) => {
        console.log(req.body, req.files);
        res.send("it worked");
    })

router.get('/new', isLoggedIn, campgrounds.renderNewForm); //create new campground

router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))//show page for a campground
    .put(isLoggedIn, validateCampground, isAuthor, catchAsync(campgrounds.updateCampground)) //submit the edits
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground)) //delete campground

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm)) //edit a campground

module.exports = router;