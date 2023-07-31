const type = d3.annotationLabel

const annotations = [{
    note: {
        label: "The latest data shows in 3/22/23, California has most COVID-19 cases(12,169,158)",
        bgPadding: 20,
        title: "California"
    },
    //can use x, y directly instead of data
    data: { date: "3/22/2023", cases: 12169158 },
    color: ['black'],
    className: "show-bg",
    x: 120,
    y: 350,
    dy: 0,
    dx: 800
}]

const parseTime = d3.timeParse("%d-%b-%y")
const timeFormat = d3.timeFormat("%d-%b-%y")

//Skipping setting domains for sake of example
const x = d3.scaleTime().range([0, 800])
const y = d3.scaleLinear().range([300, 0])

const makeAnnotations = d3.annotation()
    .editMode(true)
    //also can set and override in the note.padding property
    //of the annotation object
    .notePadding(15)
    .type(type)
    //accessors & accessorsInverse not needed
    //if using x, y in annotations JSON
    // .accessors({
    //     x: d => x(parseTime(d.date)),
    //     y: d => y(d.close)
    // })
    // .accessorsInverse({
    //     date: d => timeFormat(x.invert(d.x)),
    //     close: d => y.invert(d.y)
    // })
    .annotations(annotations);

// d3.select("svg")
//     .append("g")
//     .attr("class", "annotation-group")
//     .call(makeAnnotations)


// const annotations2 = [{
//     note: {
//         label: "The latest data shows in 3/22/23, California has most COVID-19 cases(12,169,158)",
//         bgPadding: 20,
//         title: "California"
//     },
//     //can use x, y directly instead of data
//     data: { date: "3/22/2023", cases: 12169158 },
//     className: "show-bg",
//     x: 120,
//     y: 350,
//     dy: 0,
//     dx: 800
// }];

// const makeAnnotations2 = d3.annotation()
//     .editMode(true)
//     .notePadding(15)
//     .type(type)
//     .annotations(annotations2);