// main.js

// Define the dimensions of your map visualization
const width = 1920;
const height = 1080;

// Create an SVG container for the map
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Load the COVID-19 data from your CSV file
d3.csv("./nytimes_covid-19-data_master_us-states.csv").then(function (data) {
    // Process the data as needed (e.g., convert date strings to JavaScript Date objects)
    data.forEach(d => {
        d.date = new Date(d.date);
        d.cases = +d.cases;
        d.deaths = +d.deaths;
        d.fips = +d.fips;
    });

    var currentDate = new Date('2023-01-13');
    var stateData = {};

    // Load the US map TopoJSON file
    d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
        // Create a GeoJSON feature collection from the TopoJSON
        const usStates = topojson.feature(us, us.objects.states);

        // Set up the color scale based on COVID-19 data (cases or deaths)
        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.cases)]) // Adjust the domain as needed
            .interpolator(d3.interpolateYlOrRd);

        // Add the map to the SVG container
        svg.selectAll("path")
            .data(usStates.features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath())
            .attr("fill", d => {
                // Find the corresponding data for the state and use it to set the fill color
                stateData = data.find(item => item.fips == d.id && item.date.getTime() === currentDate.getTime());

                return stateData ? colorScale(stateData.cases) : "gray";
            })
            .append("title")
            .text(stateData.state);

        // Add interactivity (e.g., tooltips) and other visual elements as needed
    });

});
