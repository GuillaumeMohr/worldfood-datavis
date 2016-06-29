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

data = d3.csv('static/data/data.csv')
	.row(function(r) {
		return {
			product_name: r.product_name,
			code_country: r.code_country,
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

function prune_nested(nested_data, level, category) {
	/*
	 * Prune the nested data: only one element up until "level", then all of its children
	 */
	//console.log("[PRUNE] arguments received (nested_data, level, category");
	//console.log(nested_data);
	//console.log(level);
	//console.log(category);
	var children;
	// if we are at the children we want to display
	if (nested_data.level > level) children = [];
	// if we are at the node clicked on by the user
	else if (nested_data.level === level && nested_data.name === category) { 
		children = nested_data.children.map(function(d) {return prune_nested(d, level, category);});
	}
	// if we are at the brother nodes that we do not want to display
	else if (nested_data.level === level)  return null;
	// if we are at a (grand)parent or (grand)uncle nodes
	else {
		children = nested_data.children
			.map(function(d) {return prune_nested(d, level, category);})
			.filter(function(d) {return d != null;});
		// if all children are null, then we should not display the node
		if (children.length === 0) return null;
	}
	//nested_data["children"] = children;
	//console.log("[PRUNE] output nested_data");
	//console.log(nested_data);
	return {
		name: nested_data.name,
		level: nested_data.level,
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
	// Reset case
	if("query" in new_data && new_data.query === "reset") {
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
		query = new_data.country_id;
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
			return (d.code_country === new_data.query)
		});
		// we compute the tree
		nested_data = {
			name: "root",
			level: 0,
			children: d3.nest()
				.key(function(d) { return d.category; })
				.key(function(d) { return d.subcategory; })
				.key(function(d) { return d.product_name; })
				.rollup(function(l) { return null; })
				.entries(useful_data)
				.map(function(d) {return rename_nested(d, 1);})
		};
		// we prune the tree
		console.log("[COMPUTE_DATA]: full tree before pruning");
		console.log(nested_data);

		nested_data = prune_nested(nested_data, new_data.level, new_data.category);

		console.log("[COMPUTE_DATA]: tree after pruning");
		console.log(nested_data);
		
		// and we only show the selected contry
		country_id_list = [query];
		query = new_data.query;
	}
	// we compute the stats
	/*
	stats = {
		product: null,
		others: {
			name: "All Products",
			data: nutritionals.map(function(n) {
				return {
					name: n,
					mean: d3.mean(useful_data, function(d) { return d[n] })
				};
			})
		}
	};
	*/
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
