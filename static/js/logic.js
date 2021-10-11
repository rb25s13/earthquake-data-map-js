let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

let platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';

// let myMap = L.map('map', {
//     center: [37.09, -95.71],
//     zoom: 5,
//   });

let mapStyle = {
    color: "yellow",
    fillColor: "pink",
    fillOpacity: 0.25,
    weight: 1.5
};

function tecPlates(tpData) {
    L.geoJson(tpData, {
        style: mapStyle
    }).addTo(myMap);
};

let tpl = d3.json(platesUrl).then(tecPlates);

function createMap(quakesLastMonth) {

    let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    let tecPlatesLines = L.layerGroup(tpl);

    let baseMaps = {
      "Street Map": streetmap,
      "Topographic Map": topo
    };
  
    let overlayMaps = {
      'Earthquakes': quakesLastMonth,
    //   'Tectonic Plates': tecPlatesLines
    };
  

    let myMap = L.map('map', {
        center: [37.09, -95.71],
        zoom: 5,
        layers: [topo, quakesLastMonth]
    });
  
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");

    let categories = ['-10-10','10-30','30-50','50-70','70-90', '90+'];
    let colors = ['#a3f600','#dcf400','#f7db11','#fdb72a','#fca35d','#ff5f65'];
    var labels = [];

    var legendInfo = "<p>Depth</p>" +
        "<div class=\"labels\">" +
        "</div>";

    div.innerHTML = legendInfo;

    categories.forEach(function(category, index) {
        labels.push("<li><div style=\"background-color: " + colors[index] + "\"></div>&nbsp;&nbsp;" + categories[index] + "</li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
    };

    legend.addTo(myMap);
};


function quakeCircles(response) {

    let quakeMarkers = [];

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

        let quakeMarker = L.circle(location, {
                                                fillOpacity: depth,
                                                color: 'rgba(0,0,0,0.1)',
                                                fillColor: color,
                                                radius: Math.sqrt(mag) * 27500
        }).bindPopup(`<h3>${response.features[i].properties.place}</h3><hr><p>${new Date(response.features[i].properties.time)}</p>`);

        quakeMarkers.push(quakeMarker);
    }

    createMap(L.layerGroup(quakeMarkers));

};

d3.json(queryUrl).then(quakeCircles);

// let tpl = d3.json(platesUrl).then(tecPlates);


// d3.json(platesUrl).then(tecPlates);

