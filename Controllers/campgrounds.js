const Campground = require('../models/campground'); //imports the Campground database
const { cloudinary } = require('../cloudinary') //using cloudinary methods to delete photos when editing campground
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); //instructors require is different than documentation
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); //contains forward geocode method
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', { campgrounds });
};

module.exports.renderNewForm = (req, res) => { //isLoggedIn comes from middleware file
    res.render('campgrounds/new');
};

module.exports.createCampground = async (req, res, next) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location, //returns longitude, latitude
        limit: 1
    }).send()
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename })); //map over files submitted to cloudinary
    campground.author = req.user._id; //saves the currently logged in user as the author 
    await campground.save();
    console.log(campground); //////
    req.flash('success', 'New campground created'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.showCampground = async (req, res) => {
    const id = req.params.id;
    if (id.length > 24 || id.length < 24) { //My addition: makes sure ID is exactly 24 characters before checking database
        req.flash('error', 'Campground does not exist.');
        return res.redirect('/campgrounds');
    }
    const campground = await Campground.findById(id).populate({
        path: 'reviews', //populating reviews;
        populate: {
            path: 'author' //populating review author;
        }
    }).populate('author'); //populating campground author;
    if (!campground) {
        req.flash('error', 'Campground does not exist.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params; //deconstruct
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash('error', 'Campground does not exist.');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
};

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params; //deconstruct
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground }); //spread operator
    const images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...images); //map over files submitted to cloudinary
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename); //use the cloudinary uploader to delete photos from cloudinary as well
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } }) //uses pull to remove any filnames located in deleteImages array (from req.body) from the campground document's images in database.
    }
    await campground.save();
    req.flash('success', 'Campground updated'); //flash a message to user (session flash)
    res.redirect(`/campgrounds/${campground._id}`)
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
};