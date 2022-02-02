const express = require('express');
const router = express.Router({mergeParams: true}); //set all routes to be router.whatever. use 'mergeParams' to see all params
const catchAsync = require('../utils/catchAsync'); //uses catchAsync utility to wrap asyn errors and forward to next
const Campground = require('../models/campground'); //imports the Campground database
const Review = require('../models/review');
const { validateReview } = require('../middleware'); //from middleware file


//REVIEW ROUTES
router.post('/', validateReview, catchAsync(async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Your review has been added.'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})//modgo $pull operator
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Your review has been deleted.'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router;