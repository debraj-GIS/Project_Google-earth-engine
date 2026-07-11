import ee
import geemap
import geopandas as gpd

ee.Initialize(project= "*****") #write a google earth engine project id
#AOI
gdf = gpd.read_file(r"D:\Google Earth Engine\West bengal\District_shape_West_Bengal.shp")
purba_bardhaman = gdf[
    gdf['NAME'] == 'Purba Barddhaman'
    ]
aoi = geemap.geopandas_to_ee(purba_bardhaman)
Map = geemap.Map()

#Sentinel-2 data
s2 = (
    ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
    .filterBounds(aoi)
    .filterDate('2025-01-01', '2025-12-31')
    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
    .median()
    .clip(aoi)
)
Map.addLayer(s2,{}, 'S2')

# NDVI CALCULATE
ndvi = s2.normalizedDifference(['B8', 'B4']).rename('NDVI')

# Visualization parameters for NDVI
ndvi_vis = {
    'min': 0.044137662842698815,
    'max': 0.7501776325138554,
    'palette': ['#3700ff', '#fbff00', '#00ff88', '#108a00']
}

# Create a legend
legend = {
    'Water Body': '#3700ff',
    'Land': '#fbff00',
    'Shrubs Vegetation': '#00ff88',
    'Dense Vegetation': '#108a00'
    }

Map.add_legend(
    title='LEGEND',
    legend_dict=legend
)

Map.addLayer(aoi, {}, 'Purba Bardhaman')
Map.centerObject(aoi, 9)
Map.addLayer(ndvi, ndvi_vis, "NDVI")
Map

#Export NDVI Map
task = ee.batch.Export.image.toDrive(
    image=ndvi,
    description='NDVI_Export',
    folder='VS_GEE_Output',          
    fileNamePrefix='ndvi',
    region=aoi.geometry(),
    scale=10,                
    maxPixels=1e13,
    fileFormat='GeoTIFF'
)
task.start()

