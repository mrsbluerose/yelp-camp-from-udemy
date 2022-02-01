module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) { //checks if user is signed in via the passport authentication and session
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}