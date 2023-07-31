// main.js

// Define the dimensions of your map visualization
const width = 1000;
const height = 650;
const marginTop = 20;
const marginRight = 60;
const marginBottom = 120;
const marginLeft = 80;

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

    const maxDate = d3.max(data, d => d.date);
    const minDate = d3.min(data, d => d.date);
    var currentDate = maxDate;
    var currentFips;
    var stateData = {};

    // Load the US map TopoJSON file
    d3.json("https://d3js.org/us-10m.v1.json").then(function (us) {
        // Create a GeoJSON feature collection from the TopoJSON
        const usStates = topojson.feature(us, us.objects.states);

        // Set up the color scale based on COVID-19 data (cases or deaths)
        const colorScale = d3.scaleSequential()
            .domain([0, d3.max(data, d => d.cases)]) // Adjust the domain as needed
            .interpolator(d3.interpolateYlOrRd);

        // Create a tooltip
        const tooltip = d3.select("#chart")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Add the map to the SVG container
        svg.append("g")
            .attr("class", "chart")
            .selectAll("path")
            .data(usStates.features)
            .enter()
            .append("path")
            .attr("d", d3.geoPath())
            .attr("fill", d => {
                // Find the corresponding data for the state and use it to set the fill color
                stateData = data.find(item => item.fips == d.id && item.date.getTime() === currentDate.getTime());
                return stateData ? colorScale(stateData.cases) : "gray";
            })
            .on("mouseover", function (event, d) {
                d3.select(this)
                    .style("opacity", 0.9) // Reduce the opacity to highlight the state
                    .style("stroke", "black")
                    .style("stroke-width", 2);

                stateData = data.find(item => item.fips == d.id && item.date.toLocaleDateString() === currentDate.toLocaleDateString());

                if (stateData) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);

                    tooltip.html(`<strong>${stateData.state}</strong><br>
                                Date: ${stateData.date.toLocaleDateString()}<br>
                                Cases: ${stateData.cases}<br>
                                Deaths: ${stateData.deaths}`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                }
                else {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);

                    tooltip.html(`<strong>${data.find(item => item.fips == d.id).state}</strong><br>
                                No data for current date.`)
                        .style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
                }
            })
            .on("mouseout", function () {
                d3.select(this)
                    .style("opacity", 1) // Restore the original opacity when mouseout
                    .style("stroke", "#fff");
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function (event, d) {
                currentFips = d.id;

                const s2data = data.filter(item => item.fips == currentFips);
                // const s2data = data2.filter(item => item.date>=currentDate && item.date<=maxDate);
                var currentNode = s2data.find(item => item.date.toLocaleDateString() === currentDate.toLocaleDateString());

                const el = d3.select("#scenes")
                    .html("")
                    .append("div")
                    .attr("id", "scene2");
                d3.select("#title").text("Understanding Narrative Visualization: A Journey through COVID-19 Daily Cases and Deaths in " + s2data[0].state);
                d3.select("#desc").html(`<p>This scene shows COVID-19 Daily Cases and Deaths in ${s2data[0].state}. X-axis represents the date while Y-axis 
                represents the daily cases number. In the bar chart, the top indicates the daily COVID-19 cases while the bottom indicates the deaths. Bar colors are implemented with a color scale indicating the darker the worse.</p>
                <p>Feel free to ZOOM in/out to view partial data and CLICK a specific date to the next observation.</p>`);

                const tooltip = d3.select("#scene2")
                    .append("div")
                    .attr("class", "tooltip")
                    .style("opacity", 0);

                chart = () => {
                    // Create the horizontal scale and its axis generator.
                    // const x = d3.scaleBand()
                    //     .domain(d3.sort(s2data, d => d.date).map(d => d.date))
                    //     .range([marginLeft, width - marginRight])
                    //     .padding(0.1);
                    const x = d3.scaleTime()
                        .domain(d3.extent(s2data, d => d.date))
                        .range([marginLeft, width - marginRight]);

                    const xAxis = d3.axisBottom(x).tickSizeOuter(0);

                    // Create the vertical scale.
                    const y = d3.scaleLinear()
                        .domain([0, d3.max(s2data, d => d.cases)]).nice()
                        .range([height - marginBottom, marginTop]);

                    const annotations2 = [{
                        note: {
                            label: "On your selected date " + currentNode.date.toLocaleDateString() + ", cases: " + currentNode.cases + ", deaths: " + currentNode.deaths + ".",
                            bgPadding: 20,
                            title: currentNode.state
                        },
                        //can use x, y directly instead of data
                        data: currentNode,
                        color: ['black'],
                        className: "show-bg",
                        x: x(currentNode.date),
                        y: y(currentNode.cases),
                        dy: 0,
                        dx: 0
                    }];
                    const makeAnnotations2 = d3.annotation()
                        .editMode(true)
                        .notePadding(15)
                        .type(type)
                        .annotations(annotations2);

                    // Create the SVG container and call the zoom behavior.
                    const svg = el.append("svg")
                        .attr("viewBox", [0, 0, width, height])
                        .attr("width", width)
                        .attr("height", height)
                        .attr("style", "max-width: 100%; height: auto;")
                        .call(zoom);

                    // Append the bars.
                    svg.append("g")
                        .attr("class", "bars")
                        .selectAll("rect")
                        .data(s2data)
                        .join("rect")
                        .attr("x", d => x(d.date))
                        .attr("y", d => y(d.cases))
                        .attr("height", d => (y(d.deaths * 10) - y(d.cases)) > 0 ? (y(d.deaths * 10) - y(d.cases)) : (y(d.deaths) - y(d.cases)))
                        // .attr("height", d => y(0) - y(d.cases))
                        // .attr("height", 20)
                        // .attr("width", x.bandwidth());
                        .attr("fill", d => colorScale(d.cases))
                        .attr("width", 1)
                        .on("mouseover", function (event, d) {
                            d3.select(this)
                                .style("opacity", 0.9) // Reduce the opacity to highlight the state
                                .style("stroke", "black")
                                .style("stroke-width", 2);

                            const stateDateData = s2data.find(item => item.date.toLocaleDateString() === d.date.toLocaleDateString());

                            if (stateDateData) {
                                tooltip.transition()
                                    .duration(200)
                                    .style("opacity", 0.9);

                                tooltip.html(`<strong>${stateDateData.state}</strong><br>
                                            Date: ${stateDateData.date.toLocaleDateString()}<br>
                                            Cases: ${stateDateData.cases}<br>
                                            Deaths: ${stateDateData.deaths}`)
                                    .style("left", (event.pageX + 10) + "px")
                                    .style("top", (event.pageY - 10) + "px");
                            }
                            else {
                                tooltip.transition()
                                    .duration(200)
                                    .style("opacity", 0.9);

                                tooltip.html(`<No data for current date.`)
                                    .style("left", (event.pageX + 10) + "px")
                                    .style("top", (event.pageY - 10) + "px");
                            }
                        })
                        .on("mouseout", function () {
                            d3.select(this)
                                .style("opacity", 1) // Restore the original opacity when mouseout
                                .style("stroke", "none")
                                .style("stroke-width", 1);
                            tooltip.transition()
                                .duration(500)
                                .style("opacity", 0);
                        })
                        .on("click", function (event, d) {
                            currentDate = d.date;

                            const s3data = d3.sort(data.filter(item => item.date.toLocaleDateString() == currentDate.toLocaleDateString()), d => d.cases);
                            if(s3data=={}){
                                d3.select("#scenes")
                                .html("")
                                .append("div")
                                .attr("id", "scene3")
                                .text("No data on "+currentDate.toLocaleDateString()+" , please start over with another date.");
                            }
                            // const s2data = data2.filter(item => item.date>=currentDate && item.date<=maxDate);
                            // var currentNode = s3data.find(item => item.fips === d.fips);
                            const maxNode = s3data[s3data.length-1];
                            const minNode = s3data[0];

                            const el3 = d3.select("#scenes")
                                .html("")
                                .append("div")
                                .attr("id", "scene3");
                            d3.select("#title").text("Understanding Narrative Visualization: A Journey through COVID-19 Daily Cases and Deaths on " + s3data[0].date.toLocaleDateString());
                            d3.select("#desc").html(`<p>This scene shows COVID-19 Daily Cases and Deaths on ${s3data[0].date.toLocaleDateString()} among the states in the US with ranks. 
                            X-axis represents states from left to right the least to the worst, while Y-axis represents the daily cases number. In the bar chart, the top 
                            indicates the daily COVID-19 cases while the bottom indicates the deaths. Bar colors are implemented with a color scale indicating the darker 
                            the worse.</p>
                            <p>Feel free to ZOOM in/out to view partial data or CLICK start over for other filters. Have fun with your have fun with your exploration. Thanks:)</p>`);

                            const tooltip3 = d3.select("#scene3")
                                .append("div")
                                .attr("class", "tooltip")
                                .style("opacity", 0);

                            chart3 = () => {
                                // Create the horizontal scale and its axis generator.
                                const x = d3.scaleBand()
                                    .domain(s3data.map(d => d.state))
                                    .range([marginLeft, width - marginRight])
                                    .padding(0.1);

                                const xAxis = d3.axisBottom(x).tickSizeOuter(0);

                                // Create the vertical scale.
                                const y = d3.scaleLinear()
                                    .domain([0, d3.max(s3data, d => d.cases)]).nice()
                                    .range([height - marginBottom, marginTop]);

                                const annotations3 = [{
                                    note: {
                                        label: "has most cases on " + maxNode.date.toLocaleDateString() + ", cases: " + maxNode.cases + ", deaths: " + maxNode.deaths + ".",
                                        bgPadding: 20,
                                        title: maxNode.state
                                    },
                                    //can use x, y directly instead of data
                                    data: maxNode,
                                    color: ['black'],
                                    className: "show-bg",
                                    x: x(maxNode.state),
                                    y: y(maxNode.cases),
                                    dy: 0,
                                    dx: -100
                                },
                                {
                                    note: {
                                        label: "has least cases on" + minNode.date.toLocaleDateString() + ", cases: " + minNode.cases + ", deaths: " + minNode.deaths + ".",
                                        bgPadding: 20,
                                        title: minNode.state
                                    },
                                    //can use x, y directly instead of data
                                    data: minNode,
                                    color: ['black'],
                                    className: "show-bg",
                                    x: x(minNode.state),
                                    y: y(minNode.cases),
                                    dy: -100,
                                    dx: 100
                                }];
                                const makeAnnotations3 = d3.annotation()
                                    .editMode(true)
                                    .notePadding(15)
                                    .type(type)
                                    .annotations(annotations3);

                                // Create the SVG container and call the zoom behavior.
                                const svg = el3.append("svg")
                                    .attr("viewBox", [0, 0, width, height])
                                    .attr("width", width)
                                    .attr("height", height)
                                    .attr("style", "max-width: 100%; height: auto;")
                                    .call(zoom);

                                // Append the bars.
                                svg.append("g")
                                    .attr("class", "bars")
                                    .selectAll("rect")
                                    .data(s3data)
                                    .join("rect")
                                    .attr("x", d => x(d.state))
                                    .attr("y", d => y(d.cases))
                                    .attr("height", d => (y(d.deaths * 10) - y(d.cases)) > 0 ? (y(d.deaths * 10) - y(d.cases)) : (y(d.deaths) - y(d.cases)))
                                    // .attr("height", d => y(0) - y(d.cases))
                                    // .attr("height", 20)
                                    .attr("width", x.bandwidth())
                                    .attr("fill", d => colorScale(d.cases))
                                    // .attr("width", 1)
                                    .on("mouseover", function (event, d) {
                                        d3.select(this)
                                            .style("opacity", 0.9) // Reduce the opacity to highlight the state
                                            .style("stroke", "black")
                                            .style("stroke-width", 2);

                                        const stateDateData = s3data.find(item => item.fips === d.fips);

                                        if (stateDateData) {
                                            tooltip3.transition()
                                                .duration(200)
                                                .style("opacity", 0.9);

                                            tooltip3.html(`<strong>${stateDateData.state}</strong><br>
                                                        Date: ${stateDateData.date.toLocaleDateString()}<br>
                                                        Cases: ${stateDateData.cases}<br>
                                                        Deaths: ${stateDateData.deaths}`)
                                                .style("left", (event.pageX + 10) + "px")
                                                .style("top", (event.pageY - 10) + "px");
                                        }
                                        else {
                                            tooltip3.transition()
                                                .duration(200)
                                                .style("opacity", 0.9);

                                            tooltip3.html(`<No data for current date.`)
                                                .style("left", (event.pageX + 10) + "px")
                                                .style("top", (event.pageY - 10) + "px");
                                        }
                                    })
                                    .on("mouseout", function () {
                                        d3.select(this)
                                            .style("opacity", 1) // Restore the original opacity when mouseout
                                            .style("stroke", "none")
                                            .style("stroke-width", 1);
                                        tooltip3.transition()
                                            .duration(500)
                                            .style("opacity", 0);
                                    });
                                // Append the axes.
                                svg.append("g")
                                    .attr("class", "x-axis")
                                    .attr("transform", `translate(0,${height - marginBottom})`)
                                    .call(xAxis)
                                    .selectAll("text")
                                    .style("text-anchor", "end")
                                    .attr("dx", "-.8em")
                                    .attr("dy", ".15em")
                                    .attr("transform", "rotate(-65)");

                                svg.append("g")
                                    .attr("class", "y-axis")
                                    .attr("transform", `translate(${marginLeft},0)`)
                                    .call(d3.axisLeft(y))
                                    .call(g => g.select(".domain").remove());

                                svg.append("g")
                                    .attr("class", "annotation-group")
                                    .call(makeAnnotations3);

                                return svg.node();

                                function zoom(svg) {
                                    const extent = [[marginLeft, marginTop], [width - marginRight, height - marginTop]];

                                    svg.call(d3.zoom()
                                        .scaleExtent([1, 8])
                                        .translateExtent(extent)
                                        .extent(extent)
                                        .on("zoom", zoomed));

                                    function zoomed(event) {
                                        x.range([marginLeft, width - marginRight].map(d => event.transform.applyX(d)));
                                        // svg.selectAll(".bars rect").attr("x", d => x(d.state)).attr("width", 1);
                                        svg.selectAll(".bars rect").attr("x", d => x(d.state)).attr("width", x.bandwidth());
                                        svg.selectAll(".x-axis").call(xAxis);
                                    }
                                }
                            }
                            chart3();

                        });

                    // Append the axes.
                    svg.append("g")
                        .attr("class", "x-axis")
                        .attr("transform", `translate(0,${height - marginBottom})`)
                        .call(xAxis);

                    svg.append("g")
                        .attr("class", "y-axis")
                        .attr("transform", `translate(${marginLeft},0)`)
                        .call(d3.axisLeft(y))
                        .call(g => g.select(".domain").remove());

                    svg.append("g")
                        .attr("class", "annotation-group")
                        .call(makeAnnotations2);

                    return svg.node();

                    function zoom(svg) {
                        const extent = [[marginLeft, marginTop], [width - marginRight, height - marginTop]];

                        svg.call(d3.zoom()
                            .scaleExtent([1, 8])
                            .translateExtent(extent)
                            .extent(extent)
                            .on("zoom", zoomed));

                        function zoomed(event) {
                            x.range([marginLeft, width - marginRight].map(d => event.transform.applyX(d)));
                            svg.selectAll(".bars rect").attr("x", d => x(d.date)).attr("width", 1);
                            // svg.selectAll(".bars rect").attr("x", d => x(d.letter)).attr("width", x.bandwidth());
                            svg.selectAll(".x-axis").call(xAxis);
                        }
                    }
                }
                chart();


            });

        function drawColorScaleLegend(colorScale) {
            const legendWidth = 150;
            const legendHeight = 50;
            const maxCase = d3.max(data, d => d.cases);

            const legendSvg = d3.select("#legend")
                .append("svg")
                .attr("width", legendWidth)
                .attr("height", legendHeight);

            // Add a gradient to the legend
            const defs = legendSvg.append("defs");
            const linearGradient = defs.append("linearGradient")
                .attr("id", "gradient");
            //   .attr("gradientTransform", "rotate(90)");

            linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", colorScale(0)); // Set the starting color of the gradient

            linearGradient.append("stop")
                .attr("offset", "50%")
                .attr("stop-color", colorScale(maxCase / 2));

            linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", colorScale(maxCase)); // Set the ending color of the gradient

            legendSvg.append("rect")
                .attr("x", 25)
                .attr("y", 20)
                .attr("width", 100)
                .attr("height", 10)
                .style("fill", "url(#gradient)");

            const colorAxis = d3.scaleBand().domain([0, maxCase / 2, maxCase]).range([0, legendWidth]);

            legendSvg.append("g")
                .attr("transform", `translate(0, 30)`)
                .call(d3.axisBottom(colorAxis));

            // Add a label to the legend
            legendSvg.append("text")
                .attr("x", 95)
                .attr("y", 15)
                .style("text-anchor", "end")
                .style("font-size", "x-small")
                .text("COVID-19 Cases"); // Set the label text
        }
        // Call the function to draw the color scale legend
        drawColorScaleLegend(colorScale);

        // Make datesArray
        const startDate = d3.min(data, d => d.date);
        const endDate = d3.max(data, d => d.date);
        const datesArray = [];
        // loop from start date to end date
        for (
            let date = startDate;
            date <= endDate;
            date.setDate(date.getDate() + 1)
        ) {
            datesArray.push(new Date(date));
        }
        // Get the date slider element
        const dateSlider = document.getElementById("dateSlider");
        // d3.select("#dateSlider").attr("max", datesArray.length-1).attr("value", datesArray[-1]);
        d3.select("#currentDate").text(endDate.toLocaleDateString());
        // Function to update currentDate based on the slider value
        function updateCurrentDate() {
            const index = parseInt(dateSlider.value, 10);
            currentDate = datesArray[index];

            d3.select("#currentDate").text(currentDate.toLocaleDateString());

            // Update the map colors based on the new currentDate
            svg.selectAll("path")
                .attr("fill", d => {
                    stateData = data.find(item => item.fips == d.id && item.date.toLocaleDateString() == currentDate.toLocaleDateString());
                    return stateData ? colorScale(stateData.cases) : "gray";
                });
        }
        // Add an event listener to the date slider to update currentDate on change
        dateSlider.addEventListener("input", updateCurrentDate);
        // Call the updateCurrentDate function to initialize the map with the initial date
        updateCurrentDate();

        // Annotations
        svg.append("g")
            .attr("class", "annotation-group")
            .call(makeAnnotations);

    });

});
