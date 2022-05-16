class LCA_EIO_BoxPlot_Overall {
    constructor(parentElement, yLimLow, yLimHigh, Data, TallyData,TallyData_noBio) {
        this.parentElement = parentElement;
        this.Data = Data;
        this.TallyData = TallyData;
        this.TallyData_noBio = TallyData_noBio;
        this.yLimLow = yLimLow;
        this.yLimHigh = yLimHigh;
        this.initVis()
    }

    initVis() {
        let vis = this;


        vis.margin = {top: 10, right: 5, bottom: 10, left: 5};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.padding = 50;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        let parent_box = document.getElementById(vis.parentElement).getBoundingClientRect()
        let ratios = [parent_box.height / 900, parent_box.width / 900]
        let ratio = Math.min.apply(Math, ratios)

        vis.yAxis = vis.svg.append("g")
            .attr("class", "y_axis")
            .attr("transform", `translate(50, 0)`)

        vis.wrangleData()
        d3.select('#saveButton_LCA_OA').on('click', function(){
            var svgString = getSVGString(d3.select('svg').node());
            svgString2Image( svgString, 2*vis.width, 2*vis.height, 'png', save ); // passes Blob and filesize String to the callback

            function save( dataBlob, filesize ){
                saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
            }
        });
    }

    wrangleData() {
        let vis = this;

        vis.filteredDataG = Array.from(d3.group(vis.Data, d => d.Stages), ([key, value]) => ({key, value}))
        vis.filteredTallyG = Array.from(d3.group(vis.TallyData, d => d.Stages), ([key, value]) => ({
            key,
            value
        }))
        vis.filteredTally_noBioG = Array.from(d3.group(vis.TallyData_noBio, d => d.Stages), ([key, value]) => ({
            key,
            value
        }))
        //console.log(vis.filteredTallyG)
        vis.byCategroy = {}
        vis.MTL = []
        vis.filteredDataG.forEach(function (d) {
            vis.byCategroy[d.key] = d.value;
            vis.MTL.push(d.key)
        })
        //TL
        vis.tallybyCategroy = {}
        vis.filteredTallyG.forEach(function (d) {
            vis.tallybyCategroy[d.key] = d.value;
        })
        //console.log(vis.tallybyCategroy)
        vis.tallybyCategroy_noBio = {}
        vis.filteredTally_noBioG.forEach(function (d) {
            vis.tallybyCategroy_noBio[d.key] = d.value;
        })

        vis.allBox = []
        for (let key in vis.byCategroy) {
            let q1
            let q3
            let median
            let min
            let max
            let mean
            let dev
            let interQuantileRange
            vis.byCategroy[key].forEach(function (d) {
                q1 = d.Q1
                q3 = d.Q3
                median = d.Median
                min = d.Min
                max = d.Max
                mean = d.Mean
                dev = d.Sd
                interQuantileRange = q3 - q1
            })
            vis.allBox.push({
                key: key,
                q1: q1,
                q3: q3,
                median: median,
                min: min,
                max: max,
                mean: mean,
                sd: dev,
                interQuantileRange: interQuantileRange
            })
        }
        console.log(vis.allBox)

        //tally
        vis.tallyline = []
        for (let key in vis.tallybyCategroy) {
            let value
            vis.tallybyCategroy[key].forEach(function (d) {
                value = d.Value
                //console.log(value)
            })
            vis.tallyline.push({
                key: key,
                value: value
            })
        }
        //tally_noBio
        vis.tallyline_noBio = []
        for (let key in vis.tallybyCategroy_noBio) {
            let value
            vis.tallybyCategroy_noBio[key].forEach(function (d) {
                value = d.Value
                //console.log(value)
            })
            vis.tallyline_noBio.push({
                key: key,
                value: value
            })
        }
        console.log(vis.tallyline)
        console.log(vis.tallyline_noBio)
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        let x = d3.scaleBand()
            .range([0, vis.width - 200])
            .domain(vis.MTL)
            .paddingInner(1)
            .paddingOuter(.5)

        //Show the Y scale
        let y = d3.scaleLinear()
            .domain([vis.yLimLow, vis.yLimHigh])
            .range([vis.height - vis.padding, vis.padding])
        vis.yAxis.call(d3.axisLeft(y))

        //Show the main vertical line
        let vertLine = vis.svg
            .selectAll(".vertLines")
            .data(vis.allBox)

        vertLine.enter()
            .append("line").merge(vertLine)
            .attr("class", "vertLines")
            .attr("x1", function(d){return(x(d.key))})
            .attr("x2", function(d){return(x(d.key))})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("transform", `translate (50, 0)`)
            .style("width", 40)
        vertLine.exit().remove()

        let coverbox2 = vis.svg
            .append("rect")
            .attr("class", "coverboxes")
            .attr("x",0)
            .attr("y",vis.height - vis.padding)
            .attr("height",vis.padding)
            .attr("width", vis.width -200)
            .attr("transform", `translate (50, 0)`)
            .style("fill", "black")
            .style("opacity", "1")

        vis.svg.append("g")
            .attr("transform", `translate (50, ${vis.height - vis.padding})`)
            .attr("class","x_axis")
            .call(d3.axisBottom(x))

        // // rectangle for the main box
        var boxWidth = 80
        let box = vis.svg
            .selectAll(".boxes")
            .data(vis.allBox)
        box
            .enter()
            .append("rect").merge(box)
            .attr("class", "boxes")
            .attr("x", function (d) {
                return (x(d.key) - boxWidth / 2)
            })
            .attr("y", function (d) {
                return (y(d.q3))
            })
            .attr("height", function (d) {
                return (y(d.q1) - y(d.q3))
            })
            .attr("width", boxWidth)
            .attr("stroke", "lightgrey")
            .attr("transform", `translate (50, 0)`)
            .style("fill", "lightgrey")
            .style("opacity", "0.4")
        box.exit().remove()

        // Show the median
        let med = vis.svg
            .selectAll(".medianLines")
            .data(vis.allBox)
        med
            .enter()
            .append("line").merge(med)
            .attr("class", "medianLines")
            .attr("x1", function (d) {
                return (x(d.key) - boxWidth / 2)
            })
            .attr("x2", function (d) {
                return (x(d.key) + boxWidth / 2)
            })
            .attr("y1", function (d) {
                return (y(d.median))
            })
            .attr("y2", function (d) {
                return (y(d.median))
            })
            .attr("transform", `translate (50, 0)`)
            .attr("stroke", "grey")
            .style("width", 80)
        med.exit().remove()

        //Tally Values
        // let tallyLine = vis.svg
        //     .selectAll(".tallyLines")
        //     .data(vis.tallyline)
        // tallyLine
        //     .enter()
        //     .append("line").merge(tallyLine)
        //     .attr("class", "tallyLines")
        //     .attr("x1", function (d) {
        //         return (x(d.key) - boxWidth / 2)
        //     })
        //     .attr("x2", function (d) {
        //         return (x(d.key) + boxWidth / 2)
        //     })
        //     .attr("y1", function (d) {
        //         return (y(d.value))
        //     })
        //     .attr("y2", function (d) {
        //         return (y(d.value))
        //     })
        //     .attr("transform", `translate (50, 0)`)
        //     .attr("stroke", "#ccb59a")
        //     .style("width", 80)
        // tallyLine.exit().remove()

        //Tally Values
        let tallyLine_noBio = vis.svg
            .selectAll(".tallyLines_noBio")
            .data(vis.tallyline_noBio)
        tallyLine_noBio
            .enter()
            .append("line").merge(tallyLine_noBio)
            .attr("class", "tallyLines_noBio")
            .attr("x1", function (d) {
                return (x(d.key) - boxWidth / 2)
            })
            .attr("x2", function (d) {
                return (x(d.key) + boxWidth / 2)
            })
            .attr("y1", function (d) {
                return (y(d.value))
            })
            .attr("y2", function (d) {
                return (y(d.value))
            })
            .attr("transform", `translate (50, 0)`)
            .attr("stroke", "#69b3a2")
            .style("width", 80)
        tallyLine_noBio.exit().remove()

        let coverbox1 = vis.svg
            .append("rect")
            .attr("class", "coverboxes")
            .attr("x",0)
            .attr("y",0)
            .attr("height",vis.padding)
            .attr("width", vis.width-200)
            .attr("transform", `translate (50, 0)`)
            .style("fill", "black")
            .style("opacity", "1")
        let ytext = vis.svg
            .append('text')
            .attr("fill","lightgrey")
            .attr("class","y_axis")
            .attr("text-anchor","middle")
            .attr("y", 10)
            .attr("x", -(vis.height - vis.padding)/2)
            .attr("transform", "rotate(-90)")
            .text("kgCO2e / sqm")
    }
}

//reference: https://d3-graph-gallery.com/graph/boxplot_several_groups.html
