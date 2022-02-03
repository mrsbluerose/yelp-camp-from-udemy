const express = require('express');
const router = express.Router({mergeParams: true}); //set all routes to be router.whatever. use 'mergeParams' to see all params
const catchAsync = require('../utils/catchAsync'); //uses catchAsync utility to wrap asyn errors and forward to next
const reviews = require('../controllers/reviews');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware'); //from middleware file

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;