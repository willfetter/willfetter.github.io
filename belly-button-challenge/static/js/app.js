// Use the D3 library to read in samples.json from the URL and declare the url as a variable
let url = "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json";

// this function updates the demographic information panel with metadata for the selected ID. 
function panelData(id) {
    // use inline function to fetch data from the url
    d3.json(url).then (function (data) {
        // display the info using console log
        console.log(data)
        // filters the metadata to find the entry matching the selected ID
        let sampleData = data;
        let metadata = sampleData.metadata;
        let identifier = metadata.filter(sample =>
            sample.id.toString() == id)[0];
        // Append an html tag with that text to the #sample-metadata panel.
        let panel = d3.select('#sample-metadata');
        // clears any existing content in the panel
        panel.html('');
        // appends new information to the panel for each key-value pair in the metadata
        Object.entries(identifier).forEach(([key, value]) => {
            panel.append('h6').text(`${key}: ${value}`);
        })
    })
};


// This function creates both bar and bubble plots using Plotly, based on the selected ID.
function Plots(id) {
    // use inline function to fetch data from the url
    d3.json(url).then(function (data) {
        // display the info using console log
        console.log(data)
        // Filters the samples to find the entry matching the selected ID.
        let sampleData = data;
        let samples = sampleData.samples;
        let identifier = samples.filter(sample => sample.id == id);
        let filtered = identifier[0];
        // Extracts and processes the top 10 OTU (Operational Taxonomic Units) values, IDs, and labels.
        let OTUvalues = filtered.sample_values.slice(0, 10).reverse();
        let OTUids = filtered.otu_ids.slice(0, 10).reverse();
        let labels = filtered.otu_labels.slice(0, 10).reverse();

        // Creates a horizontal bar chart using Plotly to display the top 10 OTUs.
        // create trace for horizontal bar chart 
        let barChartTrace = {
            x: OTUvalues,
            y: OTUids.map(object => 'OTU' + object),
            name: labels,
            type: 'bar',
            orientation: 'h'
        };
        //set format and layout for bar chart
        let barformat = {
            title: `Top 10 Bacteria Cultures found for Subject ${id}`,
            xaxis: {title: 'Number of Bacteria'},
            yaxis: {title: 'OTU ID'}
        };
        let barData = [barChartTrace];
        Plotly.newPlot('bar', barData, barformat);

        // Creates a bubble chart using Plotly to display all OTUs for the selected sample.
        // create trace for bubble chart
        let bubbleChartTrace = {
            x: filtered.otu_ids,
            y: filtered.sample_values,
            mode: 'markers',
            marker: {
                size: filtered.sample_values,
                color: filtered.otu_ids,
                colorscale: "Earth" //finally found the color scale that matches the instructions, yes!
            },
            text: filtered.otu_labels,
        };
        let bubbleData = [bubbleChartTrace];
        //set format and layout for bubble chart
        let bubbleformat = {
            title: `Bacteria Cultures per Sample for Subject ${id}`,
            xaxis: {title: 'OTU ID'},
            yaxis: {title: 'Number of Bacteria'}
        };
        Plotly.newPlot('bubble', bubbleData, bubbleformat);
    })
};

// This function updates the plots and panel information when a new ID is selected.
function optionChanged(id) {
    // calls the Plots function to update the plots
    Plots(id);
    // calls the panelInfo function to update the demographic information panel.
    panelData(id);
};

//This function initializes the dashboard by populating the dropdown menu and setting up the initial plots and panel information.
function init() {
    // Selects the dropdown menu element
    let dropDown = d3.select('#selDataset');
    // Populates the dropdown menu with the IDs from the data.
    let id = dropDown.property('value');
    // Fetches the JSON data from the URL.
    d3.json(url).then(function (data) {
        // display the info using console log
        console.log(data)
        sampleData = data;
        let names = sampleData.names;
        let samples = sampleData.samples;
        Object.values(names).forEach(value => {
            dropDown.append('option').text(value);
        })
        // Calls the panelInfo and Plots functions for the first ID in the list to display the initial information and plots.
        panelData(names[0]);
        Plots(names[0])
    })
}; 


// This line calls the init function to set up the dashboard when the page loads
init();






        