# NDVI Analysis Using Sentinel-2, Google Earth Engine, and Python

## Project Overview

This project demonstrates how to calculate the **Normalized Difference Vegetation Index (NDVI)** for **Purba Bardhaman District, West Bengal, India** using **Sentinel-2 Surface Reflectance Harmonized** imagery from **Google Earth Engine (GEE)**. The workflow is implemented in **Python** using the Earth Engine API, GeoPandas, and geemap.

The project imports the Area of Interest (AOI) from a shapefile, filters Sentinel-2 imagery based on date and cloud cover, computes NDVI, and visualizes the results on an interactive map with a custom legend.

---

## Objectives

* Import an Area of Interest (AOI) from a shapefile.
* Access Sentinel-2 imagery from Google Earth Engine.
* Filter imagery by date and cloud cover.
* Generate a median image composite.
* Calculate NDVI using Sentinel-2 bands.
* Display the NDVI map with an interactive legend.
* Visualize vegetation conditions for the study area.

---

## Study Area

**Purba Bardhaman District, West Bengal, India**

---

## Data Source

| Parameter          | Details                            |
| ------------------ | ---------------------------------- |
| Satellite          | Sentinel-2                         |
| Dataset            | `COPERNICUS/S2_SR_HARMONIZED`      |
| Platform           | Google Earth Engine                |
| Spatial Resolution | 10 m                               |
| Time Period        | 01 January 2025 – 31 December 2025 |
| Cloud Filter       | Less than 10%                      |

---

## Software and Libraries

* VS Code
* Python 3.14
* Google Earth Engine API (`earthengine-api`)
* geemap
* GeoPandas

---

## Project Workflow

1. Initialize the Google Earth Engine API.
2. Read the West Bengal district shapefile using GeoPandas.
3. Select **Purba Bardhaman** as the Area of Interest (AOI).
4. Convert the GeoDataFrame into an Earth Engine FeatureCollection.
5. Load the Sentinel-2 Surface Reflectance Harmonized image collection.
6. Filter images by:

   * Area of Interest
   * Date (2025)
   * Cloud cover (<10%)
7. Create a median composite image.
8. **What is NDVI?**

The Normalized Difference Vegetation Index (NDVI) is one of the most widely used vegetation indices in remote sensing. It measures the presence, condition, and health of vegetation by comparing the amount of near-infrared (NIR) light reflected by plants with the amount of red light they absorb.

Healthy vegetation absorbs most of the visible red light for photosynthesis and strongly reflects near-infrared light. Sparse or unhealthy vegetation reflects less near-infrared light, while water, bare soil, and built-up areas have different spectral responses. NDVI uses these differences to estimate vegetation density and vigor.

9. Calculate NDVI using:

```text
NDVI = (B8 - B4) / (B8 + B4)
```

Where:

* **B8** = Near Infrared (NIR)
* **B4** = Red

9. Apply a custom color palette for NDVI visualization.
10. Add an interactive legend to the map.
11. Display the AOI and NDVI layer using geemap.

---

## NDVI Visualization

### Color Palette

| Color       | Interpretation    |
| ----------- | ----------------- |
| Blue        | Water Body        |
| Yellow      | Land              |
| Light Green | Shrubs Vegetation |
| Dark Green  | Dense Vegetation  |

---

## Project Structure

```text
NDVI/
│
├── Data/
│   └── District_shape_West_Bengal.shp
│
├── ndvi.py
|
│── ndvi.tif
│
|── NDVI_Snapshot.png
│
└── README.md
```

---

## Expected Output

* NDVI map
* AOI boundary visualization
* Custom legend
---

## Author

**Debraj Kolya**

Remote Sensing & GIS Specialist

LinkedIn: *linkedin.com/in/debraj-kolya-57181b174*

---


