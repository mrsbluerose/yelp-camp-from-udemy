//Note: VS automatically added the following const campground, and it breaks the code. 
//s
//Note2: when adding "const campground = <%- JSON.stringify(campground) %>" to the script in show.ejs, VS autoformat incorrectly adds a space like this: <% -
//Note3: While coding along with the project, seeds added before this lecture do not have the "geometry" field and will not show a map. If you add a new campground, it will use the location field to populate geometry

// mapboxgl.accessToken = mapToken;
// const map = new mapboxgl.Map({
//     container: 'map', // container ID
//     style: 'mapbox://styles/mapbox/streets-v11', // style URL
//     center: campground.geometry.coordinates, // starting position [lng, lat] //[-74, 40]
//     zoom: 9 // starting zoom
// });

// new mapboxgl.Marker()
// .setLngLat([-74.5, 40])
// .addTo(map)

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location //can choose differnt styles
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl()); //found in examples > search controls https://docs.mapbox.com/mapbox-gl-js/api/map/#map#addcontrol

const marker1 = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)//[-74, 40])
    .setPopup(
        new mapboxgl.Popup({ offset: 25 })
            .setHTML(
                `<h4>${campground.title}</h4><p>${campground.location}</p>`
            )
    )
    .addTo(map);
