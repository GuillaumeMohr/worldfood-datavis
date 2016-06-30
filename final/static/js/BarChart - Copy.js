 function get_categories(objects) {
	 var results = [];
	 $.each(objects, function(element, object, array) {
		 results.push(object.mean);
     })
	 console.log("get_categories detected: ", results);
	 return results;
 }
 
 function get_measures(objects) {
	 var results = [];
	 $.each(objects, function(element, object, array) {
		 results.push(object.mean);
     })
	 console.log("get_measures detected: ", results);
	 return results;
 }
 
 
 function update_bars(stats){
    	Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
    		return Highcharts.Color(color)
    			.setOpacity(0.5)
    			.get('rgba');
    	});

        $('#BarChart').highcharts({
            chart: {
                type: 'column'
            },
            title: {
                text: 'Actual product vs. the rest'
            },
            subtitle: {
                text: 'Source: WorldFood for DataVis'
            },
            xAxis: {
                categories: get_categories(stats)
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Value'
                }
            },
            legend: {
                layout: 'vertical',
                backgroundColor: '#FFFFFF',
                align: 'left',
                verticalAlign: 'top',
                x: 100,
                y: 70,
                floating: true,
                shadow: true
            },
            tooltip: {
                shared: true,
                valueSuffix: ' mm'
            },
            plotOptions: {
                column: {
                	grouping: false,
                	shadow: false
                }
            },
            series: [{
                name: stats.product.name,
                data: get_measures(stats.product.data),
                pointPadding: 0

            }//, {
              //  name: 'New York',
               // data: [83.6, 78.8, 98.5],
               // pointPadding: 0.1

            //}
			]
        });
 }
 
 
 $(function (stats) {
	 console.log("entered");
	 dict = {
				others: {
					name: "Other Sauces",
					data: [{
						mean: 19,
						name: "nutrition_score_uk_100g"
					}, {
						mean: 12,
						name: "aautre_valeur_nutri"
					}]
				},
				product: {
					name: "Harissa",
					data: [{
						mean: 11.625,
						name: "nutrition_score_uk_100g"
					}, {
						mean: 15,
						name: "aautre_valeur_nutri"
					}]
				}
			}
    	update_bars(dict)
    });
 
