var csv_data; // global variable with complete data

// constant
var nutritionals = [
	"nutrition_score_uk_100g",
	"nutrition_score_fr_100g",
	"sodium_100g",
	"salt_100g",
	"proteins_100g",
	//"energy_100g",
	"saturated_fat_100g",
	"sugars_100g",
	"fat_100g",
	"carbohydrates_100g"
];
var levels = {
	0: "root",
	1: "category",
	2: "subcategory",
	3: "product_name"
}

data = d3.csv('static/data/data.csv')
	.row(function(r) {
		return {
			product_name: r.product_name,
			code_country: r.code_country,
			root: "root",
			category: r.pnns_groups_1,
			subcategory: r.pnns_groups_2,
			nutrition_score_uk_100g: +r["nutrition-score-uk_100g"],
			nutrition_score_fr_100g: +r["nutrition-score-fr_100g"],
			sodium_100g: +r.sodium_100g,
			salt_100g: +r.salt_100g,	
			proteins_100g: +r.proteins_100g,
			//energy_100g: +r.energy_100g,
			saturated_fat_100g: +r["saturated-fat_100g"],	
			sugars_100g: +r.sugars_100g,
			fat_100g: +r.fat_100g,
			carbohydrates_100g: +r.carbohydrates_100g
		}
	})
	.get(function(error, rows) {
		console.log(rows);
		csv_data = rows;
	});

var test_new_data_0 = {country_id: "DEU", category: null};
var test_new_data_1 = {country_id: null, category: ["root", "Sugary sncacks"]};


function rename_nested(data, level) {
	//console.log("[RENAME_NESTED] input (data, level)");
	//console.log(data);
	//console.log(level);
	var children = [];
	if (data.values != null) 
		children = data.values.map(function(d) {return rename_nested(d, level+1);});
	return {
		name: data.key, 
		level: level, 
		children: children
	};
}

function compute_data(new_data) {
	/* new_data is an object with possible fields :
	 *   country_id (string): used in case the user click on a country on the map
	 *   query (string): used in case the user click on the tree afte
	 *   level (int)
	 *   category (string)
	 */
	console.log("[COMPUTE_DATA]: received argument");
	console.log(new_data);
	var country_id_list;
	var nested_data;
	var stats;
	var useful_data;
	// Second case next step : a category or a product has been selected
	if ("category" in new_data && new_data.category != null &&
		 "level" in new_data && new_data.level != null &
		 "query" in new_data && new_data.query === "reset") {
		console.log("category is input ! (after reset)");
		// we filter on the selected category
		
		useful_data = csv_data.filter(function(d) {
			return d[levels[new_data.level]] === new_data.category;
		});
		// we compute the tree
		var children;
		if(new_data.level === 0) children = d3.nest()
				.key(function(d) { return d.category; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {return rename_nested(d, 1);});
		else if(new_data.level === 1) children = d3.nest()
				.key(function(d) { return d.category; })
				.key(function(d) { return d.subcategory; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {return rename_nested(d, 1);});
		else if(new_data.level >= 2) children = d3.nest()
				.key(function(d) { return d.category; })
				.key(function(d) { return d.subcategory; })
				.key(function(d) { return d.product_name; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {return rename_nested(d, 1);});
		nested_data = {
			name: "root",
			level: 0,
			children: children
		};
		
		// and we show all the countries concerned
		country_id_list = [... new Set(useful_data.map(function(d) {return d.code_country}))];
		query = "reset";
	}
	// Reset case
	else if("query" in new_data && new_data.query === "reset") {
		// we compute the tree
		useful_data = csv_data;
		nested_data = {
			name: "root",
			level: 0,
			children: d3.nest()
				.key(function(d) { return d.category; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {
					return {
						name: d.key,
						level: 1,
						children: []
					};
				})
		};
		// and we only show the selected contry
		country_id_list = [];
		query = "reset";
	}
	// Fist case : the country_id
	else if("country_id" in new_data && new_data.country_id != null) {
		// we filter on the selected country
		useful_data = csv_data.filter(function(d) {
			return (d.code_country === new_data.country_id)
		});
		// we compute the tree
		nested_data = {
			name: "root",
			level: 0,
			children: d3.nest()
				.key(function(d) { return d.category; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {
					return {
						name: d.key,
						level: 1,
						children: []
					};
				})
		};
		// and we only show the selected contry
		country_id_list = [new_data.country_id];
		query = new_data.country_id;
	}
	// First case next step : a category or a product has been selected
	else if ("category" in new_data && new_data.category != null &&
		 "level" in new_data && new_data.level != null &
		 "query" in new_data && new_data.query != null) {
		console.log("manage category !");
		// we filter on the selected country
		useful_data = csv_data.filter(function(d) {
			return d.code_country === new_data.query &&
			 	d[levels[new_data.level]] === new_data.category;
		});
		// we compute the tree
		var children;
		if(new_data.level === 0) children = d3.nest()
				.key(function(d) { return d.category; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {return rename_nested(d, 1);});
		else if(new_data.level === 1) children = d3.nest()
				.key(function(d) { return d.category; })
				.key(function(d) { return d.subcategory; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {return rename_nested(d, 1);});
		else if(new_data.level >= 2) children = d3.nest()
				.key(function(d) { return d.category; })
				.key(function(d) { return d.subcategory; })
				.key(function(d) { return d.product_name; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {return rename_nested(d, 1);});
		nested_data = {
			name: "root",
			level: 0,
			children: children
		};
		
		// and we only show the selected contry
		country_id_list = [query];
		query = new_data.query;
	}
	// we compute the stats
	stats = {
		labels: nutritionals,
		series: [
			{
			label: 'Nutritional Value',
			values: nutritionals.map(function(n) {
				var m = d3.mean(useful_data, function(d) { return d[n] });
				if(typeof m !== 'undefined') return m;
				return 0;
				})
			},
			{
			label: 'Mean nutritional value of category',
			values: nutritionals.map(function(n) {
				var m = d3.mean(csv_data, function(d) { return d[n] });
				if(typeof m !== 'undefined') return m;
				return 0;
				})
			}
		]
	}
	update_all({
		country_id_list: country_id_list,
		tree: nested_data,
		stats: stats,
		query: query
	});
}

function update_all(data) {
	console.log("update_all");
	console.log(data);

	
	update_tree(data.tree,data.query);
	update_map(data.country_id_list);
	update_bars(data.stats);
}
