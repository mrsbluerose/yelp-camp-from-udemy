//self contained file to run when necessary to seed files (rebuild, changes, etc.)

const mongoose = require('mongoose');
const cities = require('./cities'); //import cities file
const {places, descriptors} = require('./seedHelpers');  //destructures from file
const Campground = require('../models/campground');
//const Campground = require('./models/campground'); // testing adding a document

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

//create names
const sample = array => array[Math.floor(Math.random() * array.length)];

//clear database and add 50 new documents
const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i=0;i<50;i++){
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 30) + 10;
        const camp = new Campground({
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`, 
            image: 'https://source.unsplash.com/collection/483251',
            description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Praesentium ut non accusantium unde magnam omnis reprehenderit animi enim quibusdam quam ipsum tempora neque nulla, id perferendis culpa itaque, quidem minus.',
            price
        })
        await camp.save();
    }
}

//execute the seed function and close the database connection
seedDB().then(() => {
    mongoose.connection.close();
});