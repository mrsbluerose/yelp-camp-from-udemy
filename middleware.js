module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) { //checks if user is signed in via the passport authentication and session
        req.session.returnTo = req.originalUrl; //stores where the user is currently for use with redirects and returning to where they are if asked to login, etc.
        req.flash('error', 'You must be signed in.');
        return res.redirect('/login');
    }
    next();
}