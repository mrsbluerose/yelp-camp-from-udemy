const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')


router.get('/register', (req, res) => {
    res.render('users/register');
})
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password); //calls the included passport method register(user,password)
        req.login(registeredUser, err => { //use passport login method to automatically login a newly registered user
            if(err) return next(err);
        });
        req.flash('success', 'Welcome to Yelp Camp!');
        res.redirect('/campgrounds');
        console.log(registeredUser);
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
    

}));

router.get('/login', (req,res) => {
    res.render('users/login');
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => { //uses local authenication strategy - see documentation
    req.flash('success', 'Welcome Back!');
    const redirectUrl = req.session.returnTo || '/campgrounds'; //uses the stored returnTo URL for redirect if it exists
    delete req.session.returnTo; //deletes the returnTo URL after using it
    res.redirect(redirectUrl);
})

router.get('/logout', (req,res) => {
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
})

module.exports = router;