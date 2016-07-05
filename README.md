# worldfood-datavis
INF344 - 2016
Visualization class group project

## Team 
Khalil CHOUROU
Siham LAAROUSSI
Guillaume MOHR
Mohamed Amine SALEM

## Data
Data is available online at http://world.openfoodfacts.org/data/en.openfoodfacts.org.products.csv but because of its size 
is not included in this repository.

## Main files description
- `DataCleaning.ipynb` is a Jupyter Notebook (Python3) that cleans and prepare the data (its output is `final/static/data/data.csv`)
- `final/app.py` is a short Python script that launch a simple Flask server on http://0.0.0.0:5000/.
- `final/templates/index.html` is the base page.
- `final/static/js/BarChartVert.js` contains the code managing the bar chart
- `final/static/js/CollapsedTree.js` contains the code managing the tree
- `final/static/js/WorldMap.js` contains the code managing the map
- `final/static/js/compute_data.js` contains the code computing the data after each user interaction

## Code structure
Each user interaction generates a call to the `compute_data` function in the `compute_data.js` script that analyzes the query,
performs the necessary data filters and transformations (list of useful countries, hierarchical organization, statistics aggregation),
and then calls the `update_map`, `update_bars` and `update_tree` functions with the data to display.
