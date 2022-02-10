//self contained file to run when necessary to seed files (rebuild, changes, etc.)

const mongoose = require('mongoose');
const cities = require('./cities'); //import cities file
const { places, descriptors } = require('./seedHelpers');  //destructures from file
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

//clear database and add 50 new documents --MUST HAVE FILENAMES AND URLS FOR PHOTOS
//see cloudinary > yelp camp seed > download/upload to yelp camp
const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 30) + 10;
    const camp = new Campground({
      //your user ID
      author: '61fabfac779c47d47714217b',
      geometry: { 
        type: 'Point', 
        coordinates: [ 
          cities[random1000].longitude, 
          cities[random1000].latitude ] 
      }, 
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
      //     url: 'https://res.cloudinary.com/mrsblue/image/upload/v1644353515/YelpCamp/j7hupidvdf5qnlr1tn1z.jpg',
      //   filename: 'YelpCamp/j7hupidvdf5qnlr1tn1z'
      // },
      // {
      //   url: 'https://res.cloudinary.com/mrsblue/image/upload/v1644353517/YelpCamp/urxodimrxprcsoi0oumc.jpg',
      //   filename: 'YelpCamp/urxodimrxprcsoi0oumc'
      // },
      // {
      //   url: 'https://res.cloudinary.com/mrsblue/image/upload/v1644353517/YelpCamp/xlg7b7ih6c340v2ahmb8.jpg',
      //   filename: 'YelpCamp/xlg7b7ih6c340v2ahmb8'
      // },
      // {
        url: 'https://res.cloudinary.com/mrsblue/image/upload/v1644353518/YelpCamp/hs4mu89rf6zf9k1nnjkx.jpg',
        filename: 'YelpCamp/hs4mu89rf6zf9k1nnjkx'
      },
      {
        url: 'https://res.cloudinary.com/mrsblue/image/upload/v1644353518/YelpCamp/j2gfikqakhcb5wolnfrn.jpg',
        filename: 'YelpCamp/j2gfikqakhcb5wolnfrn'
      },
      {
        url: 'https://res.cloudinary.com/mrsblue/image/upload/v1644353520/YelpCamp/wsfd0x8ib3ywe4f5ectc.jpg',
        filename: 'YelpCamp/wsfd0x8ib3ywe4f5ectc'
      },
      {
        url: 'https://res.cloudinary.com/mrsblue/image/upload/v1644353521/YelpCamp/pxvuqeuu8y0be5rqslhv.jpg',
        filename: 'YelpCamp/pxvuqeuu8y0be5rqslhv'
        }
      ],
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