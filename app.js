//load env -- secret file stuff. See .env file
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

//load modules
const express = require('express');
const path = require('path'); //runs path module
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');// uses utitlity class for express errors
const methodOverride = require('method-override'); //allows for overriding PUT, PATCH, etc.
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const helmet = require('helmet');

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds'); //uses the routes defined in routes/campgrounds.js
const reviewRoutes = require('./routes/reviews');
//const { getMaxListeners } = require('process');

const MongoStore = require('connect-mongo');

const mongoSanitize = require('express-mongo-sanitize'); //security against SQL (or NoSQL) injection attacks
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';//process.env.DB_URL; //Mongo Atlas credentials
mongoose.connect(dbUrl, {//dbUrl, {
    //useNewUrlParser: true,  //depricated since course video
    //useCreateIndex: true,  //depricated since course video
    //useUnifiedTopology: true  //depricated since course video
});

//bind connection to error and open events
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();

app.engine('ejs', ejsMate); //uses the ejs-mate engine for layout design
//use ejs and set views directory. Lets you run app from within other directories
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })) //parse the request body
app.use(methodOverride('_method'));//use method override
app.use(express.static(path.join(__dirname, 'public'))); //serve the public directory
app.use(mongoSanitize());
const secret = process.env.SECRET || 'secret';

const store = MongoStore.create({ //diff from instructor's code. updated for latest version of connect Mongo from comments and documentation
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 //specify laxy session update https://github.com/jdesboeufs/connect-mongo#lazy-session-update
})

store.on("error", function(e) {
    console.log("SESSION STORE ERROR", e)
})

//set session config and use. Test by starting up server, open browser > dev tools > application tab > cookies > click on server running. Send some requests (click on page links) to see cookies show up
const sessionConfig = {
    store,
    name: 'session', //changes default name to keep it more secure
    secret, //a 'secret' to sign cookies
    resave: false, //removes deprication warning
    saveUninitialized: true, //removes deprication warning
    cookie: {
        httpOnly: true, //security not to reveal cookies to third party
        //secure: true, //only over https in deployment
        expires: Date.now() + (1000 * 60 * 60 * 24 * 7), //expire in miliseconds * in minute * in hour * in day * in week = one week. Good to set. There is no default, and you don't want someone to stay logged in forever.
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

//Must set the following to use helmet. If it doesn't seem to work, try logging in as a user. Seems to reset and fix everything.
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const connectSrcUrls = [
    "https://*.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://events.mapbox.com",
    "https://res.cloudinary.com/dv5vm4sqh/"
];
const fontSrcUrls = [ "https://res.cloudinary.com/dv5vm4sqh/" ];
 
app.use(
    helmet.contentSecurityPolicy({
        directives : {
            defaultSrc : [],
            connectSrc : [ "'self'", ...connectSrcUrls ],
            scriptSrc  : [ "'unsafe-inline'", "'self'", ...scriptSrcUrls ],
            styleSrc   : [ "'self'", "'unsafe-inline'", ...styleSrcUrls ],
            workerSrc  : [ "'self'", "blob:" ],
            objectSrc  : [],
            imgSrc     : [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/" + process.env.CLOUDINARY_CLOUD_NAME + "/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com/"
            ],
            fontSrc    : [ "'self'", ...fontSrcUrls ],
            mediaSrc   : [ "https://res.cloudinary.com/dv5vm4sqh/" ],
            childSrc   : [ "blob:" ]
        }
    })
);

//passport
app.use(passport.initialize());
app.use(passport.session()); //make sure to use session first before this definition
passport.use(new LocalStrategy(User.authenticate())); //tells passport to use local strategy from the passport package and to use the authentication method (from passport-local-mongoose)
passport.serializeUser(User.serializeUser()); //tells passport how to serialize user or store them in session
passport.deserializeUser(User.deserializeUser()); //how to get user out of session

//middleware to access the success message. gives all templates access to the res.locals.success property. Every request activates this and checks for 'success' in flash.
app.use((req, res, next) => {
    res.locals.currentUser = req.user; //access to current user from passport
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

////test adding a user
// app.get('/fakeUser', async (req,res) => {
//     const user = new User({email: "u@gmail.com", username: "this guy"});
//     const newUser = await User.register(user, 'password123'); //uses register method https://github.com/saintedlama/passport-local-mongoose#readme
//     res.send(newUser); //does all the work for us - hashes password, salts password, etc.
// })

//use the campground and review
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes); //prefix for routes and the route defined above
app.use('/campgrounds/:id/reviews', reviewRoutes);

//route (use render method of express. it knows the file extention because of the app.set above, and it looks in the views folder by default)
app.get('/', (req, res) => {
    //res.send('HELLO FROM YELP CAMP') //test that it's working
    res.render('home');
})

//ERRORS
//404 error for paths that don't exist
app.all('*', (req, res, next) => { //* means all paths
    next(new ExpressError('General Error Occurred', 404));
})

//Basic error handling
app.use((err, req, res, next) => {
    //const { statusCode = 500, message = "Something went wrong" } = err;
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render('error', { err }); //use error.js in /views, pass entire error
    //res.send("Something is wrong!")
})

//listening on port
const port = process.env.PORT || 3000; //horuku's port or local port
app.listen(port, () => { 
    console.log(`Serving on port ${port}`);
}) 
