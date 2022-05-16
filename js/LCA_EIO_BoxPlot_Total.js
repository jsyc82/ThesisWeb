class LCA_EIO_BoxPlot_Total {
    constructor(parentElement, yLimLow, yLimHigh) {
        this.parentElement = parentElement;
        this.Data = [{key:"Total", median: 500.56,q1:297.4,q3:5068.76, min:-16936.24, max:171149.44}];
        this.TallyData =[{key:"Total",value:154.23}];
        this.TallyData_noBio =[{key:"Total",value:290.98}];
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
            .attr("transform", `translate(55, 0)`)

        vis.wrangleData()
        d3.select('#saveButton_LCA').on('click', function(){
            var svgString = getSVGString(d3.select('svg').node());
            svgString2Image( svgString, 2*vis.width, 2*vis.height, 'png', save ); // passes Blob and filesize String to the callback

            function save( dataBlob, filesize ){
                saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
            }
        });
    }

    wrangleData() {
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;
        let x = d3.scaleBand()
            .range([0, vis.width - 100])
            .domain(["Total"])
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
            .data(vis.Data)

        vertLine.enter()
            .append("line").merge(vertLine)
            .attr("class", "vertLines")
            .attr("x1", function(d){return(x(d.key))})
            .attr("x2", function(d){return(x(d.key))})
            .attr("y1", function(d){return(y(d.min))})
            .attr("y2", function(d){return(y(d.max))})
            .attr("transform", `translate (55, 0)`)
            .attr("stroke", "grey")
            .style("width", 40)
        vertLine.exit().remove()

        let coverbox2 = vis.svg
            .append("rect")
            .attr("class", "coverboxes")
            .attr("x",0)
            .attr("y",vis.height - vis.padding)
            .attr("height",vis.padding)
            .attr("width", vis.width-100)
            .attr("transform", `translate (55, 0)`)
            .style("fill", "black")
            .style("opacity", "1")

        vis.svg.append("g")
            .attr("transform", `translate (55, ${vis.height - vis.padding})`)
            .attr("class","x_axis")
            .call(d3.axisBottom(x))

        // // rectangle for the main box
        var boxWidth = 80
        let box = vis.svg
            .selectAll(".boxes")
            .data(vis.Data)
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
            .attr("stroke", "grey")
            .attr("transform", `translate (55, 0)`)
            .style("fill", "grey")
            .style("opacity", "0.3")
        box.exit().remove()

        // Show the median
        let med = vis.svg
            .selectAll(".medianLines")
            .data(vis.Data)
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
            .attr("transform", `translate (55, 0)`)
            .attr("stroke", "grey")
            .style("width", 80)
        med.exit().remove()

        // //Tally Values
        // let tallyLine = vis.svg
        //     .selectAll(".tallyLines")
        //     .data(vis.TallyData)
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
        //     .attr("transform", `translate (55, 0)`)
        //     .attr("stroke", "#ccb59a")
        //     .style("width", 80)
        // tallyLine.exit().remove()

        //Tally Values
        let tallyLine_noBio = vis.svg
            .selectAll(".tallyLines_noBio")
            .data(vis.TallyData_noBio)
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
            .attr("transform", `translate (55, 0)`)
            .attr("stroke", "#69b3a2")
            .style("width", 80)
        tallyLine_noBio.exit().remove()

        let coverbox1 = vis.svg
            .append("rect")
            .attr("class", "coverboxes")
            .attr("x",0)
            .attr("y",0)
            .attr("height",vis.padding)
            .attr("width", vis.width-100)
            .attr("transform", `translate (55, 0)`)
            .style("fill", "black")
            .style("opacity", "1")
        let ytext = vis.svg
            .append('text')
            .attr("fill","lightgrey")
            .attr("class","y_axis")
            .attr("text-anchor","middle")
            .attr("y", 7)
            .attr("x", -(vis.height - vis.padding)/2)
            .attr("transform", "rotate(-90)")
            .text("kgCO2e / sqm")
    }
}

//reference: https://d3-graph-gallery.com/graph/boxplot_several_groups.html
