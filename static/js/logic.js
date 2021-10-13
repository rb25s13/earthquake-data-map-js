let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
let platesUrl = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json';
let mapStyle = {
    color: "yellow",
    fillOpacity: 0.03,
    weight: 2
};
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});
let quakeMarkersLayer = L.layerGroup();
let tecPlatesLines = L.layerGroup();
let baseMaps = {
    "Street Map": streetmap,
    "Topographic Map": topo
  };
let overlayMaps = {
  'Earthquakes': quakeMarkersLayer,
  'Tectonic Plates': tecPlatesLines
};
let myMap = L.map('map', {
    center: [37.09, -75.71],
    zoom: 3,
    layers: [topo, quakeMarkersLayer]
});
L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
}).addTo(myMap);
d3.json(platesUrl).then(tpData => {
    L.geoJson(tpData, {
        style: mapStyle
    }).addTo(tecPlatesLines);
    tecPlatesLines.addTo(myMap);
});
d3.json(queryUrl).then(response => {
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
        L.circle(location, {
                            fillOpacity: depth,
                            color: 'rgba(0,0,0,0.1)',
                            fillColor: color,
                            radius: Math.sqrt(mag) * 27500
        }).bindPopup(`<h3>${response.features[i].properties.place}</h3><hr><p>${new Date(response.features[i].properties.time)}</p>`).addTo(quakeMarkersLayer);
    }
    quakeMarkersLayer.addTo(myMap);
});
let legend = L.control({ position: "bottomright" });
legend.onAdd = () => {
    let div = L.DomUtil.create("div", "info legend");
    let categories = ['-10-10','10-30','30-50','50-70','70-90', '90+'];
    let colors = ['#a3f600','#dcf400','#f7db11','#fdb72a','#fca35d','#ff5f65'];
    var labels = [];
    var legendInfo = "<p>Depth</p>" + "<div class=\"labels\">" + "</div>";
    div.innerHTML = legendInfo;
    categories.forEach(function(category, index) {
        labels.push("<li><div style=\"background-color: " + colors[index] + "\"></div>&nbsp;&nbsp;" + categories[index] + "</li>");
    });
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};
legend.addTo(myMap);