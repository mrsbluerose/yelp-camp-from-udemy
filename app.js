//load express module
const express = require('express');
const path = require('path'); //runs path module
const mongoose = require('mongoose');
const methodOverride = require('method-override'); //allows for overriding PUT, PATCH, etc.
const Campground = require('./models/campground'); //imports the Campground database

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
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

//use ejs and set views directory. Lets you run app from within other directories
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//parse the request body
app.use(express.urlencoded({ extended: true}))
//use method override
app.use(methodOverride('_method'));

//route (use render method of express. it knows the file extention because of the app.set above, and it looks in the views folder by default)
app.get('/', (req, res) => {
    //res.send('HELLO FROM YELP CAMP') //test that it's working
    res.render('home');
})

//testing adding a document
// app.get('/makecampground', async (req, res) => {
//     const camp = new Campground({title: 'my backyard', description: 'cheap camping!'});
//     await camp.save();
//     res.send(camp);
// })

//list of all campgrounds
app.get('/campgrounds', async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
})

//create new campground
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

//save new campground
app.post('/campgrounds', async(req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

//show page for a campground
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', { campground });
})

//edit a campground
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
})

//submit the edits
app.put('/campgrounds/:id', async (req,res) => {
    const { id } = req.params; //deconstruct
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //spread operator
    res.redirect(`/campgrounds/${campground._id}`)
})

app.delete('/campgrounds/:id', async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

//listening on port
app.listen(3000, () => {
    console.log('Serving on port 3000');
})