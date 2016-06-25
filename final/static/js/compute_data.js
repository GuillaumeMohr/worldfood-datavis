var csv_data; // global variable with complete data

// constant
var nutritionals = [
	"nutrition_score_uk_100g",
	"nutrition_score_fr_100g",
	"sodium_100g",
	"salt_100g",
	"proteins_100g",
	"energy_100g",
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
			energy_100g: +r.energy_100g,
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

function rename_nested_old(data) {
	// TODO : REMOVE
	if (data.values.constructor === Array )
		return {name: data.key, level: "1", children: data.values.map(rename_nested)}; 
	else return {
		name: data.key, 
		level: "2", 
		children: {name: "#products = " + data.values, level:"3"}
	};
}

function rename_nested(data, level) {
	var children = [];
	if (data.values.constructor === Array ) 
		children = data.values.map(function(d) {rename_nested(d, level+1)});
	return {
		name: data.key, 
		level: level, 
		children: children
	};
}

function prune(nested_data, level, category) {
	/*
	 * Prune the nested data: only one element up until "level", then all of its children
	 */
	var children;
	// if we are at the children we want to display
	if (nested_data.level > level) children = [];
	// if we are at the node clicked on by the user
	else if (nested_data.level === level && nested_data.category === category) { 
		children = nested_data.children.map(function(d) {prune(d, level, category);});
	}
	// if we are at the brother nodes that we do not want to display
	else if (nested_data.level === level) return null;
	// if we are at a (grand)parent or (grand)uncle nodes
	else {
		children = nested_data.children
			.map(function(d) {prune(d, level, category);})
			.filter(function(d) {d != null});
		// if all children are null, then we should not display the node
		if (children.length === 0) return null;
	}
	nested_data.children = children;
	return nested_data;
}

function compute_data(new_data) {
	/* new_data is an object with possible fields :
	 *   country_id (string): used in case the user click on a country on the map
	 *   query (string): used in case the user click on the tree afte
	 *   level (int)
	 *   category (string)
	 */
	var country_id_list;
	var nested_data;
	var stats;
	// Fist case : the country_id
	if("country_id" in new_data && new_data.country_id != null) {
		// we filter on the selected country
		var useful_data = csv_data.filter(function(d) {
			return (d.code_country === new_data.country_id)
		});
		// we compute the tree
		nested_data = {
			name: "root",
			level: 0,
			children: d3.nest()
				.key(function(d) { return d.category; })
				//.key(function(d) { return d.subcategory; })
				//.rollup(function(l) { return l.length; })
				//.key(function(d) { return d.product_name; })
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
		// we compute the stats
		stats = nutritionals.map(function(n) {
			return {name: n,
				mean: d3.mean(useful_data, function(d) { return d[n] })};
		});
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
		var useful_data = csv_data.filter(function(d) {
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
				.map(function(d) {rename_nested(d, 1);})
		};
		// we prune the tree
		nested_data = prune(nested_data, new_data.level, new_data.category)
		
		// we compute the stats
		stats = nutritionals.map(function(n) {
			return {name: n,
				mean: d3.mean(useful_data, function(d) { return d[n] })};
		});
		// and we only show the selected contry
		country_id_list = [new_data.country_id];
		query = new_data.country_id;
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

	//update_map(data.country_id_list);
	update_tree(data.tree);
	//update_bars(data.stats);
}
