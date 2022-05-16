class JoyPlot {
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

        d3.select('#saveButton').on('click', function(){
            var svgString = getSVGString(d3.select('svg').node());
            svgString2Image( svgString, 2*vis.width, 2*vis.height, 'png', save ); // passes Blob and filesize String to the callback

            function save( dataBlob, filesize ){
                saveAs( dataBlob, 'D3 vis exported to PNG.png' ); // FileSaver.js function
            }
        });
    }
    wrangleData(){
        let vis = this;
        if (selected_Region != "All"){
            vis.filteredData = vis.Data.filter(function(d){
                return (d.Region === selected_Region && d.LCA_Stage === selected_LCA && d.Database === selected_DB)})
        }
        else{vis.filteredData = vis.Data.filter(function(d){
            return (d.LCA_Stage === selected_LCA && d.Database === selected_DB)})}
           // && d.LCA_Stage === selected_LCA && d.Database === selected_DB
        vis.filteredDataG = Array.from(d3.group(vis.filteredData, d => d.Category), ([key, value]) => ({key, value}))
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

            document.getElementById('slca').innerHTML = selected_LCA;
            document.getElementById('sregion').innerHTML = selected_Region;
            document.getElementById('sdb').innerHTML = selected_DB;
            document.getElementById('scount').innerHTML = "Selected Data Points: " + vis.filteredData.length;
            document.getElementById('sND').innerHTML = " ";

            if (vis.filteredData.length == 0){
                document.getElementById('sND').innerHTML = "NO DATA TO DISPLAY";
            }
    }
}

// This is what I need to compute kernel density estimation
function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
    };
}
function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}

// Below are the functions that handle actual exporting:
// getSVGString ( svgNode ) and svgString2Image( svgString, width, height, format, callback )
function getSVGString( svgNode ) {
    svgNode.setAttribute('xlink', 'http://www.w3.org/1999/xlink');
    var cssStyleText = getCSSStyles( svgNode );
    appendCSS( cssStyleText, svgNode );

    var serializer = new XMLSerializer();
    var svgString = serializer.serializeToString(svgNode);
    svgString = svgString.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace
    svgString = svgString.replace(/NS\d+:href/g, 'xlink:href'); // Safari NS namespace fix

    return svgString;

    function getCSSStyles( parentElement ) {
        var selectorTextArr = [];

        // Add Parent element Id and Classes to the list
        selectorTextArr.push( '#'+parentElement.id );
        for (var c = 0; c < parentElement.classList.length; c++)
            if ( !contains('.'+parentElement.classList[c], selectorTextArr) )
                selectorTextArr.push( '.'+parentElement.classList[c] );

        // Add Children element Ids and Classes to the list
        var nodes = parentElement.getElementsByTagName("*");
        for (var i = 0; i < nodes.length; i++) {
            var id = nodes[i].id;
            if ( !contains('#'+id, selectorTextArr) )
                selectorTextArr.push( '#'+id );

            var classes = nodes[i].classList;
            for (var c = 0; c < classes.length; c++)
                if ( !contains('.'+classes[c], selectorTextArr) )
                    selectorTextArr.push( '.'+classes[c] );
        }

        // Extract CSS Rules
        var extractedCSSText = "";
        for (var i = 0; i < document.styleSheets.length; i++) {
            var s = document.styleSheets[i];

            try {
                if(!s.cssRules) continue;
            } catch( e ) {
                if(e.name !== 'SecurityError') throw e; // for Firefox
                continue;
            }

            var cssRules = s.cssRules;
            for (var r = 0; r < cssRules.length; r++) {
                if ( contains( cssRules[r].selectorText, selectorTextArr ) )
                    extractedCSSText += cssRules[r].cssText;
            }
        }


        return extractedCSSText;

        function contains(str,arr) {
            return arr.indexOf( str ) === -1 ? false : true;
        }

    }

    function appendCSS( cssText, element ) {
        var styleElement = document.createElement("style");
        styleElement.setAttribute("type","text/css");
        styleElement.innerHTML = cssText;
        var refNode = element.hasChildNodes() ? element.children[0] : null;
        element.insertBefore( styleElement, refNode );
    }
}


function svgString2Image( svgString, width, height, format, callback ) {
    var format = format ? format : 'png';

    var imgsrc = 'data:image/svg+xml;base64,'+ btoa( unescape( encodeURIComponent( svgString ) ) ); // Convert SVG string to data URL

    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");

    canvas.width = width;
    canvas.height = height;

    var image = new Image();
    image.onload = function() {
        context.clearRect ( 0, 0, width, height );
        context.drawImage(image, 0, 0, width, height);

        canvas.toBlob( function(blob) {
            var filesize = Math.round( blob.length/1024 ) + ' KB';
            if ( callback ) callback( blob, filesize );
        });


    };

    image.src = imgsrc;
}

//reference: https://d3-graph-gallery.com/graph/ridgeline_basic.html