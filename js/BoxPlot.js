class BoxPlot {
    constructor(parentElement, Data) {
        this.parentElement = parentElement;
        this.Data = Data;

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
            .attr('transform', `translate (${vis.margin.left + 150}, ${vis.margin.top})`);

        let parent_box = document.getElementById(vis.parentElement).getBoundingClientRect()
        let ratios = [parent_box.height / 900, parent_box.width / 900]
        let ratio = Math.min.apply(Math, ratios)

        vis.yAxis = vis.svg.append("g")
            .attr("class", "y_axis")
            .attr("transform", `translate(50, 0)`)

        vis.wrangleData()
        d3.select('#saveButton_b').on('click', function(){
            var svgString = getSVGString(d3.select('svg').node());
            svgString2Image( svgString, 2*vis.width, 2*vis.height, 'png', save ); // passes Blob and filesize String to the callback

            function save( dataBlob, filesize ){
                saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
            }
        });
    }

    wrangleData() {
        let vis = this;
        if (selected_Region_Box != "All") {
            vis.filteredData = vis.Data.filter(function (d) {
                return (d.Region === selected_Region_Box && d.Category_Comparison === selected_MTL && d.LCA_Stage === selected_LCA_Box
                    && d.GWP != "#DIV/0!")
            })
        } else {
            vis.filteredData = vis.Data.filter(function (d) {
                return (d.Category_Comparison === selected_MTL && d.LCA_Stage === selected_LCA_Box && d.GWP != "#DIV/0!")
            })
        }
        vis.filteredDataG = Array.from(d3.group(vis.filteredData, d => d.Database), ([key, value]) => ({key, value}))
        vis.byCategroy = {}
        vis.filteredDataG.forEach(function (d) {
            vis.byCategroy[d.key] = d.value;
        })

        vis.allBox = []
        for (let key in vis.byCategroy) {
            //console.log(vis.byCategroy[key])
            let ArrayCat = []
            vis.byCategroy[key].forEach(function (d) {
                //console.log(d.GWP);
                ArrayCat.push(d.GWP)
            })
            let q1 = d3.quantile(ArrayCat, .25)
            //console.log(q1)
            let q3 = d3.quantile(ArrayCat, .75)
            //console.log(q3)
            let median = d3.quantile(ArrayCat, .5)
            let interQuantileRange = q3 - q1
            let min = q1 - 1.5 * interQuantileRange
            let max = q3 + 1.5 * interQuantileRange
            let mean = d3.mean(ArrayCat)
            let dev = d3.deviation(ArrayCat)
            let maxreal = parseFloat(d3.max(ArrayCat))
            let minreal = parseFloat(d3.min(ArrayCat))
            vis.allBox.push({
                key: key,
                q1: q1,
                q3: q3,
                median: median,
                min: min,
                max: max,
                maxreal: maxreal,
                minreal: minreal,
                mean: mean,
                sd: dev,
                interQuantileRange: interQuantileRange
            })
        }
        //console.log(vis.allBox)
        vis.updateVis()
    }
    updateVis(){
        let vis = this;
        let x = d3.scaleBand()
            .range([ 0, vis.width- 200])
            .domain(["EC3", "ICE", "OBD"])
            .paddingInner(1)
            .paddingOuter(.5)
        vis.svg.append("g")
            .attr("transform", `translate (50, ${vis.height-vis.padding})`)
            .attr("class","x_axis")
            .call(d3.axisBottom(x))

        // Show the Y scale
        let y = d3.scaleLinear()
            .domain([-10,20])
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
            .attr("y1", function(d){return(y(d.minreal))})
            .attr("y2", function(d){return(y(d.maxreal))})
            .attr("transform", `translate (50, 0)`)
            .attr("stroke", "grey")
            .style("width", 40)
        vertLine.exit().remove()

        // rectangle for the main box
        var boxWidth = 150
        let box = vis.svg
            .selectAll(".boxes")
            .data(vis.allBox)
        box
            .enter()
            .append("rect").merge(box)
            .attr("class", "boxes")
            .attr("x", function(d){return(x(d.key)-boxWidth/2)})
            .attr("y", function(d){return(y(d.q3))})
            .attr("height", function(d){return(y(d.q1)-y(d.q3))})
            .attr("width", boxWidth )
            .attr("stroke", "grey")
            .attr("transform", `translate (50, 0)`)
            .style("fill", "#69b3a2")
        box.exit().remove()

        // Show the median
        let med = vis.svg
            .selectAll(".medianLines")
            .data(vis.allBox)
        med
            .enter()
            .append("line").merge(med)
            .attr("class", "medianLines")
            .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
            .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
            .attr("y1", function(d){return(y(d.median))})
            .attr("y2", function(d){return(y(d.median))})
            .attr("transform", `translate (50, 0)`)
            .attr("stroke", "grey")
            .style("width", 80)
        med.exit().remove()
    }
}

//reference: https://d3-graph-gallery.com/graph/boxplot_several_groups.html
