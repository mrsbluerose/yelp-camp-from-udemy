const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const users = require('../controllers/users');

router.route('/register')
    .get(users.renderRegisterForm) //register form
    .post(catchAsync(users.registerUser)); //register

router.route('/login')
    .get(users.renderLoginForm) //login form
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.loginUser); //login
    
router.get('/logout', users.logoutUser); //logout

module.exports = router;