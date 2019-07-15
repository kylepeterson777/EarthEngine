// Script to process Landsat 8 OLI imagery and create time series data
// script generates times series (csv) and chart of surface reflectance

// Filter Landsat 8 data//
var now = Date.now();
var eeNow = ee.Date(now);

//var geometry = ee.Geometry.Point([ -89.27367,38.73693]);
var geometry = geometry;

// Function to cloud mask from the pixel_qa band of Landsat 8 SR data.
function maskL8sr(image) {
  // Bits 2, 3, and 5 are water, cloud shadow, and cloud, respectively.
  var cloudShadowBitMask = 1 << 3;
  var cloudsBitMask = 1 << 5;
  var water = 2;
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
      .and(qa.bitwiseAnd(water).eq(0))
      .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
      
  // Return the masked image, scaled to TOA reflectance, without the QA bands.
  return image.updateMask(mask).divide(10000)
      .select("B1", "B2", "B3","B4","B5","B6","B7")
      .copyProperties(image, ["system:time_start"]);
}

// Map the function over the data.
var geometry_refl = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
    .filterDate('2010-01-01', '2019-12-31')
    .filterBounds(geometry)
    .map(maskL8sr);
print(geometry_refl);
/////////////////////////

////////////////////////////
print(ui.Chart.image.series(geometry_refl, geometry.buffer(30), ee.Reducer.mean(), 30));
