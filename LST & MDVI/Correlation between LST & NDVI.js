// Define the Area of interest (AOI). Here I select Purba bardhaman District as AOI
Map.addLayer(AOI, {}, "Purba Bardhaman");
Map.centerObject(AOI, 10);


// Load Landsat 8 imagery
var landsat8 = ee.ImageCollection('LANDSAT/LC08/C02/T1')
  .filterDate('2024-04-01', '2024-07-30')
  .filter(ee.Filter.lt('CLOUD_COVER', 10))
  .median()
  .clip(AOI);

// Function to calculate NDVI
var calculateNDVI = function(image) {
  var ndvi = image.normalizedDifference(['B5', 'B4']).rename('NDVI');
  return image.addBands(ndvi);
};


// Function to calculate emissivity
var calculateEmissivity = function(image) {
  var ndvi = image.select('NDVI');
  var emissivity = ndvi.multiply(0.0003342).add(0.1); 
  return image.addBands(emissivity.rename('EMISSIVITY'));
};

// Function to calculate LST
var calculateLST = function(image) {
  var thermalBand = image.select('B10');
  
  // Constants for Landsat 8
  var K1 = 774.8853; // Calibration constant 1
  var K2 = 1321.0789; // Calibration constant 2
  
  // Convert DN to TOA radiance
  var toaRadiance = thermalBand.multiply(0.0003342).add(0.1);
  
  // Convert TOA radiance to brightness temperature
  var brightnessTemp = toaRadiance.expression(
    '(K2 / (log((K1 / L) + 1))) - 273.15', {
      'K1': K1,
      'K2': K2,
      'L': toaRadiance
    }
  ).rename('BRIGHTNESS_TEMP');
  
  // Calculate LST
  var emissivity = image.select('EMISSIVITY');
  var lst = brightnessTemp.expression(
    '(BT / (1 + (0.00115 * BT / 1.4388) * log(emissivity)))', {
      'BT': brightnessTemp,
      'emissivity': emissivity
    }
  ).rename('LST');
  
  return image.addBands(lst);
};

// Apply the functions
var ndviImage = calculateNDVI(landsat8);
var emissivityImage = calculateEmissivity(ndviImage);
var lstImage = calculateLST(emissivityImage);

print('LST Image:', lstImage);

var lstValue = lstImage.select('LST').reduceRegion({
  reducer: ee.Reducer.min().combine({
    reducer2: ee.Reducer.max(),
    sharedInputs: true
  }).combine({
    reducer2: ee.Reducer.mean(),
    sharedInputs: true
  }),
  geometry: AOI,
  scale: 30,
  maxPixels: 1e13
});
print("LST Statistics :", lstValue);

// Extract min, max, and mean values
var minLST = lstValue.get('LST_min');
var maxLST = lstValue.get('LST_max');
var meanLST = lstValue.get('LST_mean');

// Format the values into a string
var lst_Stats_Text = [
  ['Min', minLST.getInfo().toFixed(2) + ' °C'],
  ['Max', maxLST.getInfo().toFixed(2) + ' °C'],
  ['Mean', meanLST.getInfo().toFixed(2) + ' °C']
];

// set position of LST Statistics panel
var lst_stat_panel = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '10px 10px',
    backgroundColor: 'white', 
    border: '1px solid black'
  }
});

// Create heading title
var lst_stat_heading = ui.Label({
  value: 'LST STATISTICS',
  style: {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0 0 4px 0',
    padding: '0',
    color: 'black',
    position: 'top-center',
    }
});

lst_stat_panel.add(lst_stat_heading);

// Create rows for the table
for (var i = 0; i < lst_Stats_Text.length; i++) {
  var row = ui.Panel({
    layout: ui.Panel.Layout.flow('horizontal'),
    style: { margin: '0 0 4px 0' }
  });

  // Add columns to the row
  for (var j = 0; j < lst_Stats_Text[i].length; j++) {
    var cell = ui.Label({
      value: lst_Stats_Text[i][j],
      style: {
        padding: '4px 4px',
        fontSize: '14px', 
        color: 'black'
      }
    });
    row.add(cell);
  }
  lst_stat_panel.add(row);
}

// Sample the pixel values of LST and NDVI
var sample = lstImage.select(['LST', 'NDVI']).sample({
  region: AOI, 
  scale: 30, 
  numPixels: 1000 
});

// Calculate correlation
var correlation = sample.reduceColumns({
  reducer: ee.Reducer.pearsonsCorrelation(),
  selectors: ['LST', 'NDVI']
});

// Print the correlation result
print('Correlation between LST and NDVI:', correlation);

// Extract the correlation value
var correlationValue = correlation.get('correlation').getInfo().toFixed(4);

// Create a scatter plot
var chart = ui.Chart.feature.byFeature({
  features: sample,
  xProperty: 'NDVI',
  yProperties: 'LST'
})
.setChartType('ScatterChart')
.setOptions({
  title: 'CORRELATION BETWEEN LST AND NDVI',
  hAxis: {title: 'NDVI'},
  vAxis: {title: 'LST (°C)'},
  pointSize: 1,
  trendlines: {0: {color: 'red'}},
});

// Print the combined panel
print(chart);


// ____________________________________________________________________;
// Add Heading and Legend for LST

// set position of heading panel
var heading = ui.Panel({
  style: {
    position: 'top-center',
    padding: '8px 15px'
  }
});

// Create heading title
var headingTitle = ui.Label({
  value: 'LST Map of Purba Bardhaman District',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});

// Add the heading title to the heading panel
heading.add(headingTitle);



// set position of legend panel
var legend = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '15px 15px'
  }
});


// Create legend title
var legendTitle = ui.Label({
  value: 'LST',
  
  style: {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});




// Add the legend title to the legend panel
legend.add(legendTitle);


// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          padding: '14px',
          margin: '0 0 4px 0'
        }
      });
      
      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 8px 6px'}
      });
      
      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};


//  Palette with the colors
var LST_palette = ["0400ff","37ff00","fff875","ffb1d7","ff0000"]

// name of the legend
var LST_names = ['Very Low','Low','Medium', 'High', 'Very High'];

// Add color and and names
for (var i = 0; i < 5; i++) {
  legend.add(makeRow(LST_palette[i], LST_names[i]));
  }  

// ___________________________________________________________________________________________
// Add Heading and Legend for NDVI
// set position of heading panel
var heading2 = ui.Panel({
  style: {
    position: 'top-center',
    padding: '8px 15px'
  }
});

// Create legend heading title
var headingTitle2 = ui.Label({
  value: 'NDVI Map of Purba Bardhaman District',
  style: {
    fontWeight: 'bold',
    fontSize: '18px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});

// Add the heading title to the heading panel
heading2.add(headingTitle2);



// set position of legend panel
var legend2 = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '15px 15px'
  }
});


// Create legend title
var legendTitle2 = ui.Label({
  value: 'NDVI',
  
  style: {
    fontWeight: 'bold',
    fontSize: '20px',
    margin: '0 0 4px 0',
    padding: '0'
    }
});



// Add the legend title to the legend panel
legend2.add(legendTitle2);


// Creates and styles 1 row of the legend.
var makeRow = function(color, name) {
      var colorBox = ui.Label({
        style: {
          backgroundColor: '#' + color,
          padding: '14px',
          margin: '0 0 4px 0'
        }
      });
      
      // Create the label filled with the description text.
      var description = ui.Label({
        value: name,
        style: {margin: '0 0 8px 6px'}
      });
      
      // return the panel
      return ui.Panel({
        widgets: [colorBox, description],
        layout: ui.Panel.Layout.Flow('horizontal')
      });
};


//  Palette with the colors
var NDVI_palette =  ["0008ff","fffd2a","5aff5c","16b300"]

// name of the legend
var NDVI_names = ['Water Body', 'Land', 'Low Vegetation', 'Dense Vegetation']

// Add color and and names
for (var i = 0; i < 4; i++) {
  legend2.add(makeRow(NDVI_palette[i], NDVI_names[i]));
  }  



// Create a dropdown menu to switch between LST and NDVI maps
var dropdown = ui.Select({
  items: ['Select a Map','LST', 'NDVI'],
  style: {
    position: 'top-left',
  },
  onChange: function(selected) {
    Map.layers().reset();
    
    // Show/hide panels based on selection
    if (selected === 'Select a Map'){
      Map.addLayer(AOI.style({color: '000000',fillColor: '00000000',width: 1}),  {}, "Purba Bardhaman");
      Map.centerObject(AOI, 9.6);
      Map.remove(lst_stat_panel);
    } else if (selected === 'LST') {
      Map.add(lst_stat_panel);
      Map.add(heading); 
      Map.add(legend);  
      Map.remove(heading2); 
      Map.remove(legend2);  
      Map.addLayer(AOI, {}, "Purba Bardhaman");
      Map.centerObject(AOI, 9.6);
      Map.addLayer(lstImage.select('LST'), LST_VIS, 'LST'); // Add LST layer
    } else if (selected === 'NDVI') {
      Map.add(heading2); 
      Map.add(legend2);  
      Map.remove(lst_stat_panel);
      Map.remove(heading); 
      Map.remove(legend);  
      Map.addLayer(AOI, {}, "Purba Bardhaman");
      Map.centerObject(AOI, 9.6);
      Map.addLayer(ndviImage.select('NDVI'), NDVI_VIS, 'NDVI'); 
    }
  }
});

// Add the dropdown to the map
Map.add(dropdown);
dropdown.setValue('Select a Map'); 

