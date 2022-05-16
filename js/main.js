let myJoyPlot;
let myJoyPlot_M;
let myBoxPlot;
let myLCA_EIO_BoxPlot_Total;
let myLCA_EIO_BoxPlot_Total_zoom;
let myLCA_EIO_BoxPlot_Overall;
let myLCA_EIO_BoxPlot_Overall_M;
let myLCA_EIO_BoxPlot_A1_A3;
let myLCA_EIO_BoxPlot_A4;
let myLCA_EIO_BoxPlot_B2_B5;
let myLCA_EIO_BoxPlot_C2_C4;
let myLCA_EIO_BoxPlot_D;
let sel_stages;

// load data using promises
let promises = [
    d3.json("data/jp_full.json"),
    d3.json("data/LCA_EIO_full_normal.json"),
    d3.json("data/LCA_Tally_Gabi_full_normal.json"),
    d3.json("data/LCA_Tally_Gabi_full_nobio_normal.json"),
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

// initMainPage
function initMainPage(allDataArray) {
    myJoyPlot = new JoyPlot('joyplot', allDataArray[0])
    myJoyPlot_M = new JoyPlot_M('joyplot_m', allDataArray[0])
    myBoxPlot = new BoxPlot('boxplot', allDataArray[0])
    myLCA_EIO_BoxPlot_Total = new LCA_EIO_BoxPlot_Total('LCA_EIO_Box_Total',-20000,180000)
    myLCA_EIO_BoxPlot_Total_zoom = new LCA_EIO_BoxPlot_Total('LCA_EIO_Box_Total_zoom',-1000,6000)
    myLCA_EIO_BoxPlot_Overall = new LCA_EIO_BoxPlot_Overall('LCA_EIO_Box_Overall',-200,200, allDataArray[1],allDataArray[2],allDataArray[3])
    myLCA_EIO_BoxPlot_A1_A3 = new LCA_EIO_BoxPlot('LCA_EIO_Box_A1_A3','A1_A3',-150,200, allDataArray[1],allDataArray[2],allDataArray[3])
    myLCA_EIO_BoxPlot_A4 = new LCA_EIO_BoxPlot('LCA_EIO_Box_A4','A4',-150,200, allDataArray[1],allDataArray[2],allDataArray[3])
    myLCA_EIO_BoxPlot_B2_B5 = new LCA_EIO_BoxPlot('LCA_EIO_Box_B2_B5','B2_B5',-150,200, allDataArray[1],allDataArray[2],allDataArray[3])
    myLCA_EIO_BoxPlot_C2_C4 = new LCA_EIO_BoxPlot('LCA_EIO_Box_C2_C4','C2_C4', -150,500,allDataArray[1],allDataArray[2],allDataArray[3])
    myLCA_EIO_BoxPlot_D = new LCA_EIO_BoxPlot('LCA_EIO_Box_D','D', -150,200,allDataArray[1],allDataArray[2],allDataArray[3])
}

let selected_LCA = d3.select("#categorySelector_LCA").property("value");
let selected_Region = d3.select("#categorySelector_Region").property("value");
let selected_DB = d3.select("#categorySelector_Database").property("value");
let selected_Region_Box = d3.select("#categorySelector_Region_Box").property("value");
let selected_MTL = d3.select("#categorySelector_Material_Box").property("value");
let selected_LCA_Box = d3.select("#categorySelector_LCA_Box").property("value");
let selected_LCA_M = d3.select("#categorySelector_LCA_m").property("value");
let selected_Region_M = d3.select("#categorySelector_Region_m").property("value");
let selected_DB_M = d3.select("#categorySelector_Database_m").property("value");

function categoryChange() {
    selected_LCA = d3.select("#categorySelector_LCA").property("value");
    selected_Region = d3.select("#categorySelector_Region").property("value");
    selected_DB = d3.select("#categorySelector_Database").property("value");
    console.log("changed");
    console.log(selected_LCA);
    console.log(selected_Region);
    console.log(selected_DB);
    myJoyPlot.wrangleData(); // maybe you need to change this slightly depending on the name of your MapVis instance
}
function categoryChange_M() {
    selected_LCA_M = d3.select("#categorySelector_LCA_m").property("value");
    selected_Region_M = d3.select("#categorySelector_Region_m").property("value");
    selected_DB_M = d3.select("#categorySelector_Database_m").property("value");
    console.log(selected_Region_M)
    console.log("M changed");
    myJoyPlot_M.wrangleData();
}
function categoryChange_Box() {
    selected_Region_Box = d3.select("#categorySelector_Region_Box").property("value");
    selected_MTL = d3.select("#categorySelector_Material_Box").property("value");
    selected_LCA_Box = d3.select("#categorySelector_LCA_Box").property("value");
    console.log("changed");
    myBoxPlot.wrangleData();
}
function sel_LCA(){
}


