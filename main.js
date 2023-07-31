// main.js

// Define the dimensions of your map visualization
const width = 800;
const height = 600;

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
        // Add any other necessary data processing steps
    });

    console.log(data);

    // Load the US map TopoJSON file
    //   d3.json("https://d3js.org/us-10m.v1.json").then(function(us) {
    //     // Create a GeoJSON feature collection from the TopoJSON
    //     const usStates = topojson.feature(us, us.objects.states);

    //     // Set up the color scale based on COVID-19 data (cases or deaths)
    //     const colorScale = d3.scaleSequential()
    //       .domain([0, d3.max(data, d => d.cases)]) // Adjust the domain as needed
    //       .interpolator(d3.interpolateYlOrRd);

    //     // Add the map to the SVG container
    //     svg.selectAll("path")
    //       .data(usStates.features)
    //       .enter()
    //       .append("path")
    //       .attr("d", d3.geoPath())
    //       .attr("fill", d => {
    //         // Find the corresponding data for the state and use it to set the fill color
    //         const stateData = data.find(item => item.state === d.properties.name);
    //         return stateData ? colorScale(stateData.cases) : "gray";
    //       });

    //     // Add interactivity (e.g., tooltips) and other visual elements as needed
    //   });
});
