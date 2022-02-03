const Campground = require('../models/campground'); //imports the Campground database
const Review = require('../models/review');

module.exports.createReview = async(req,res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Your review has been added.'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})//modgo $pull operator
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Your review has been deleted.'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${id}`);
};