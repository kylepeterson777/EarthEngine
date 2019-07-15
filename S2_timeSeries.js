// Script to process Sentinel-2 MSI imagery and create time series data
// script generates times series (csv) and chart of surface reflectance 

// Filter Sentinel-2 time series data //

//var USGS = ee.Geometry.Point([-90.735556, 38.466944]);
var USGS = geometry;
// Function to mask clouds using the Sentinel-2 QA band.
function maskS2clouds(image) {
  var qa = image.select('QA60');

  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
             qa.bitwiseAnd(cirrusBitMask).eq(0));

  // Return the masked and scaled data, without the QA bands.
  return image.updateMask(mask).divide(10000)
      .select("B1", "B2", "B3", "B4","B8A", "B11", "B12")
      .copyProperties(image);
}
// Load Sentinel-2 TOA reflectance data.
var now = Date.now();
var eeNow = ee.Date(now);

var USGS_refl = ee.ImageCollection('COPERNICUS/S2')
    .filterDate('2015-01-01', eeNow) //run one year at a time
    .filterBounds(USGS)
    .map(function(image) {
  //add date information
  var date = ee.Date(image.get('system:time_start')).format("YYYY-MM-dd");
    return image.set('date', ee.Date(date));
  })
  
  // Pre-filter to get less cloudy granules.
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
    
    .map(maskS2clouds);
 print(USGS_refl);
 
// generate csv reflectance data 
// create chart of reflectance time series data
print(ui.Chart.image.series(USGS_refl, USGS.buffer(30), 
      ee.Reducer.mean(),30,"system:index"));