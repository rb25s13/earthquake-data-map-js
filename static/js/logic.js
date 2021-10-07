let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

let platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';

let myMap = L.map('map', {
    center: [37.09, -95.71],
    zoom: 5,
  });

let mapStyle = {
    color: "yellow",
    fillColor: "pink",
    fillOpacity: 0.25,
    weight: 1.5
};

d3.json(platesUrl).then(function(data) {
    L.geoJson(data, {
        style: mapStyle
    }).addTo(myMap);
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(myMap);



d3.json(queryUrl).then(function(response) {

    for (var i = 0; i < response.features.length; i++) {
        let mag = response.features[i].properties.mag;
        if (mag < 0) mag = 0;

        let location = response.features[i].geometry;
        let depth = location.coordinates[2]
        location = [location.coordinates[1], location.coordinates[0]];

        let color = '';
        if (depth <= 10) {
          color = '#a3f600';
        } else if (depth <= 30) {
            color = '#dcf400';
        } else if (depth <= 50) {
            color = '#f7db11';
        } else if (depth <= 70) {
            color = '#fdb72a';
        } else if (depth <= 90) {
            color = '#fca35d';
        } else {
          color = '#ff5f65';
        }
      
        // lists for the legend
        categories = ['-10-10','10-30','30-50','50-70','70-90'];
        colors = ['#a3f600','#dcf400','#f7db11','#fdb72a','#fca35d','#ff5f65'];
        props = [categories, colors];
        

        L.circle(location, {
          fillOpacity: depth,
          color: 'rgba(0,0,0,0.1)',
          fillColor: color,
          radius: Math.sqrt(mag) * 20000
        }).bindPopup(`<h3>${response.features[i].properties.place}</h3><hr><p>${new Date(response.features[i].properties.time)}</p>`).addTo(myMap);
    }

  });