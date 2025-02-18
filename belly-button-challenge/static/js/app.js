// URL to fetch the JSON data
let url = "https://static.bc-edx.com/data/dl-1-2/m14/lms/starter/samples.json";

// This function updates the demographic information panel with metadata for the selected ID. 
function updatePanelData(id) {
    // Fetch data from the URL
    d3.json(url).then (function (data) {
        // Display the info using console log
        console.log(data)
        let sampleData = data;
        let metadata = sampleData.metadata;
        // Filter the metadata to find the entry matching the selected ID
        let identifier = metadata.filter(sample =>
            sample.id.toString() == id)[0];
        // Append an HTML tag with that text to the #sample-metadata panel.
        let panel = d3.select('#sample-metadata');
        // Clear any existing content in the panel
        panel.html('');
        // Append new information to the panel for each key-value pair in the metadata
        Object.entries(identifier).forEach(([key, value]) => {
            panel.append('h6').text(`${key}: ${value}`);
        });
        // Add error handling to manage any issues with fetching data.
    }).catch(function (error) {
        console.log("Error fetching data: ", error);
    });
}



// Function to create both bar and bubble plots using Plotly, based on the selected ID
function updatePlots(id) {
    // Fetch data from the URL
    d3.json(url).then(function (data) {
        // Display the info using console log
        console.log(data)
        let sampleData = data;
        let samples = sampleData.samples;
        // Filter the samples to find the entry matching the selected ID.
        let identifier = samples.filter(sample => sample.id == id);
        let filtered = identifier[0];
        // Extract and processes the top 10 OTU (Operational Taxonomic Units) values, IDs, and labels.
        let OTUvalues = filtered.sample_values.slice(0, 10).reverse();
        let OTUids = filtered.otu_ids.slice(0, 10).reverse();
        let labels = filtered.otu_labels.slice(0, 10).reverse();

        // Create a horizontal bar chart using Plotly to display the top 10 OTUs.
        // Create trace for horizontal bar chart 
        let barChartTrace = {
            x: OTUvalues,
            y: OTUids.map(object => 'OTU ' + object),
            name: labels,
            type: 'bar',
            orientation: 'h'
        };
        // Set format and layout for bar chart
        let barFormat = {
            title: `Top 10 Bacteria Cultures found for Subject ${id}`,
            xaxis: {title: 'Number of Bacteria'},
            yaxis: {title: 'Operational Taxonomic Units (OTU) ID'}
        };
        let barData = [barChartTrace];
        Plotly.newPlot('bar', barData, barFormat);

        // Create a bubble chart using Plotly to display all OTUs for the selected sample.
        // Create trace for bubble chart
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
        // Set format and layout for bubble chart
        let bubbleFormat = {
            title: `Bacteria Cultures per Sample for Subject ${id}`,
            xaxis: {title: 'OTU ID'},
            yaxis: {title: 'Number of Bacteria'}
        };
        Plotly.newPlot('bubble', bubbleData, bubbleFormat);
    })
};

// Function to update the plots and panel information when a new ID is selected
function optionChanged(id) {
    // Call the updatePlots function to update the plots
    updatePlots(id);
    // Call the updatePanelData function to update the demographic information panel.
    updatePanelData(id);
};

// Function to initialize the dashboard by populating the dropdown menu and setting up the initial plots and panel information
function initDashboard() {
    // Select the dropdown menu element
    let dropDown = d3.select('#selDataset');
    // Populates the dropdown menu with the IDs from the data.
    let id = dropDown.property('value');
     // Fetch the JSON data from the URL
    d3.json(url).then(function (data) {
        // display the info using console log
        console.log(data)
        sampleData = data;
        let names = sampleData.names;
        let samples = sampleData.samples;
        // Populate the dropdown menu with the IDs from the data
        Object.values(names).forEach(value => {
            dropDown.append('option').text(value);
        })
        // Display the initial information and plots for the first ID in the list
        updatePanelData(names[0]);
        updatePlots(names[0])
    })
}; 


// Call the initDashboard function to set up the dashboard when the page loads
initDashboard();






        