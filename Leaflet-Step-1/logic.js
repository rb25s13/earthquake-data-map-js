let queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';

let myMap = L.map('map', {
    center: [37.09, -95.71],
    zoom: 3,
});

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    id: 'light-v9',
    accessToken: API_KEY,
}).addTo(myMap);

let legend = L.control({ position: "bottomright" });
legend.onAdd = () => {
    let div = L.DomUtil.create("div", "info legend");
    let legendInfo = "<p>Depth</p>" +
        "<div class=\"labels\">" +
        "</div>";
    div.innerHTML = legendInfo;
    let categories = ['-10-10','10-30','30-50','50-70','70-90', '90+'];
    let colors = ['#a3f600','#dcf400','#f7db11','#fdb72a','#fca35d','#ff5f65'];
    let labels = [];
    categories.forEach((a, index) => {
        labels.push("<li><div style=\"background-color: " + colors[index] + "\"></div>&nbsp;&nbsp;" + categories[index] + "</li>");
    });
    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};

legend.addTo(myMap);
d3.json(queryUrl).then(response => {
    for (let i = 0; i < response.features.length; i++) {
        let mag = response.features[i].properties.mag;
        if (mag < 0) mag = 0;
        let location = response.features[i].geometry;
        let depth = location.coordinates[2]
        location = [location.coordinates[1], location.coordinates[0]];
        let date = new Date(response.features[i].properties.time).toLocaleDateString("en-US")
        let time = new Date(response.features[i].properties.time).toLocaleTimeString("en-US")
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
        }).bindPopup(`<h5>${response.features[i].properties.place}</h5>${time} - ${date}<hr><p>
        <b>Magnitude:</b> ${mag}<br/><b>Depth:</b> ${depth}</p>`).addTo(myMap);
    }
}); 