class JoyPlot_M {
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
        vis.padding = 120;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width )
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        let parent_box = document.getElementById(vis.parentElement).getBoundingClientRect()
        let ratios = [parent_box.height / 900, parent_box.width / 900]
        let ratio = Math.min.apply(Math, ratios)

        vis.yAxis = vis.svg.append("g")
            .attr("class","y_axis")
            .attr("transform", `translate(150, 90)`)
        vis.wrangleData()

        d3.select('#saveButton_m').on('click', function(){
            var svgString = getSVGString(d3.select('svg').node());
            svgString2Image( svgString, 2*vis.width, 2*vis.height, 'png', save ); // passes Blob and filesize String to the callback

            function save( dataBlob, filesize ){
                saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
            }
        });
    }
    wrangleData(){
        let vis = this;
        if (selected_Region_M == "All" && selected_DB_M == "All"){
            vis.filteredData = vis.Data.filter(function(d){
                return (d.LCA_Stage === selected_LCA_M && d.Category_Comparison != "Others")
        })}
        else if(selected_Region_M == "All"){
            vis.filteredData = vis.Data.filter(function(d){
                return (d.LCA_Stage === selected_LCA_M && d.Database === selected_DB_M && d.Category_Comparison != "Others")})
        }
        else if (selected_DB_M == "All"){
            vis.filteredData = vis.Data.filter(function(d){
                return (d.Region === selected_Region_M && d.LCA_Stage === selected_LCA_M && d.Category_Comparison != "Others")})
        }
        else{vis.filteredData = vis.Data.filter(function(d){
            return (d.Region === selected_Region_M && d.LCA_Stage === selected_LCA_M && d.Database === selected_DB_M
                && d.Category_Comparison != "Others")
        })}
        // && d.LCA_Stage === selected_LCA && d.Database === selected_DB
        vis.filteredDataG = Array.from(d3.group(vis.filteredData, d => d.Category_Comparison), ([key, value]) => ({key, value}))
        vis.byCategroy = {}
        vis.filteredDataG.forEach(function (d){vis.byCategroy[d.key] =d.value;})
        //console.log(vis.filteredData)
        vis.updateVis()
    }
    updateVis(){
        let vis = this;
        let categories = []
        for (let key in vis.byCategroy) {
            //console.log(key)
            categories.push(key)
        }
        let n = categories.length;
        categories.sort(d3.ascending)
        //console.log(categories)

        //Add X axis
        const x = d3.scaleLinear()
            .domain([-7, 18])
            .range([0, vis.width]);
        vis.svg.append("g")
            .attr("class","x_axis")
            .attr("transform", `translate(150, ${vis.height - 30})`)
            .call(d3.axisBottom(x));

        vis.svg.append("g")
            .append('text')
            .attr("class","x_axis")
            .attr("fill","grey")
            .attr("text-anchor","middle")
            .attr("transform", `translate(${(vis.width+150)/2}, ${vis.height-3})`)
            .text("kgCO2e / kgMaterial");

        // Create a Y scale for densities
        let gh = (vis.height - vis.padding) - (vis.height - vis.padding) / 30
        const y = d3.scaleLinear()
            //.domain([0, 5])
            .range([vis.height - vis.padding, gh]);

        // Create the Y axis for names
        const yName = d3.scaleBand()
            .domain(categories)
            .range([0, vis.height - vis.padding])
            .paddingInner(20)

        vis.yAxis.call(d3.axisLeft(yName));

        // Compute kernel density estimation for each column:
        let kde = kernelDensityEstimator(kernelEpanechnikov(0.2), x.ticks(500)) // increase this 40 for more accurate density.

        let allDensity = []
        let CatCount =[]
        for (let key in vis.byCategroy) {
            //console.log(vis.byCategroy[key])
            let ArrayCat = []
            vis.byCategroy[key].forEach(function (d) {
                ArrayCat.push(d.GWP)
            })
            let density = kde(ArrayCat)
            allDensity.push({key: key, density: density,len:vis.byCategroy[key].length})
        }
        //console.log(allDensity)

        // Add areas
        let area = vis.svg.selectAll(".areas").data(allDensity)
        area.enter()
            .append("path").merge(area)
            .attr("class", "areas")
            .attr("transform", function (d) {
                return (`translate(150, ${(yName(d.key) - (vis.height - 90 - vis.padding))})`)
            })
            .datum(function (d) {
                return (d.density)
            })
            .attr("fill", "#72b59a")
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .attr("d", d3.line()
                .curve(d3.curveBasis)
                .x(function (d) {
                    return x(d[0]);
                })
                .y(function (d) {
                    return y(d[1]);
                })
            )
        area.exit().remove()

        //add count
        let count = vis.svg.selectAll(".count").data(allDensity)
        count.enter()
            .append("text").merge(count)
            .attr("class", "count")
            .attr("transform", function (d) {
                return (`translate(${(vis.width-75)}, ${(yName(d.key)+90-2)})`)
            })
            .attr("fill", "#50806c")
            .text(function(d){return d.len + " data points"})

        count.exit().remove()

        document.getElementById('jpM_Title').innerHTML = "Common Material GWP Distribution: " + selected_DB_M;


        if (vis.filteredData.length == 0){
            document.getElementById('sND').innerHTML = "NO DATA TO DISPLAY";
        }
    }
}



//reference: https://d3-graph-gallery.com/graph/ridgeline_basic.html