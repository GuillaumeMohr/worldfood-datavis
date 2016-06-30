var data_bars = {
  labels: [
    'Nutrition-score-uk_100g', 'Nutrition-score-fr_100g', 'Sodium_100g',
    'Salt_100g', 'Proteins_100g', 'Energy_100g','Saturated-fat_100g','Sugars_100g','Fat_100g'
  ],
  series: [
    {
      label: 'Nutritional Value',
      values: [4, 8, 15, 16, 23, 42,63,20,29]
    },
    {
      label: 'Mean nutritional value of category',
      values: [12, 43, 22, 11, 73, 25,53,30,19]
    }]
};

function update_bars(data) {
	var chartWidth       = 300,
	    barHeight        = 12,
	    groupHeight      = barHeight * data.series.length,
	    gapBetweenGroups = 10,
	    spaceForLabels   = 180,
	    spaceForLegend   = 190;

	// Zip the series data together (first values, second values, etc.)
	var zippedData = [];
	for (var i=0; i<data.labels.length; i++) {
	  for (var j=0; j<data.series.length; j++) {
	    zippedData.push(data.series[j].values[i]);
	  }
	}

	// Color scale
	var color = d3.scale.category20c();
	var chartHeight = barHeight * zippedData.length + gapBetweenGroups * data.labels.length;

	var x = d3.scale.linear()
	    .domain([0, d3.max(zippedData)])
	    .range([0, chartWidth]);

	var y = d3.scale.linear()
	    .range([chartHeight + gapBetweenGroups, 0]);

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .tickFormat('')
	    .tickSize(0)
	    .orient("left");

	// Specify the chart area and dimensions
	var chart = d3.select(".chart")
	    .attr("width", spaceForLabels + chartWidth + spaceForLegend)
	    .attr("height", chartHeight);


	var selection_bar = chart.selectAll("g")
	    .data(zippedData)

	var selection_legend = chart.selectAll('.legend')
	    .data(data.series)

	// CREATION
	// Create bars
	var bar = selection_bar.enter()
	    .append("g")
	    .attr("transform", function(d, i) {
	      return "translate(" + spaceForLabels + "," + (i * barHeight + gapBetweenGroups * (0.5 + Math.floor(i/data.series.length))) + ")";
	    });

	// Create rectangles of the correct width
	bar.append("rect")
	    .attr("fill", function(d,i) { return color(i % data.series.length); })
	    .attr("class", "bar")
	    .attr("width", x)
	    .attr("height", barHeight - 1);

	// Add text label in bar
	bar.append("text")
		.attr("class", "value")
	    .attr("y", barHeight / 2)
	    .attr("dy", ".35em")
	    .text(function(d) { return d.toFixed(1); });

	// Draw labels
	bar.append("text")
	    .attr("class", "label")
	    .attr("x", function(d) { return - 10; })
	    .attr("y", groupHeight / 2)
	    .attr("dy", ".35em")
	    .text(function(d,i) {
	      if (i % data.series.length === 0)
		return data.labels[Math.floor(i/data.series.length)];
	      else
		return ""});

	chart.append("g")
	      .attr("class", "y axis")
	      .attr("transform", "translate(" + spaceForLabels + ", " + -gapBetweenGroups/2 + ")")
	      .call(yAxis);

	// Draw legend
	var legendRectSize = 15,
	    legendSpacing  = 4;

	var legend = selection_legend
	    .enter()
	    .append('g')
	    .attr('transform', function (d, i) {
		var height = legendRectSize + legendSpacing;
		var offset = -gapBetweenGroups/2;
		var horz = spaceForLabels + chartWidth  - legendRectSize;
		var vert = i * height - offset;
		return 'translate(' + horz + ',' + vert + ')';
	    });

	legend.append('rect')
	    .attr('width', legendRectSize)
	    .attr('height', legendRectSize)
	    .style('fill', function (d, i) { return color(i); })
	    .style('stroke', function (d, i) { return color(i); });

	legend.append('text')
	    .attr('class', 'legend')
	    .attr('x', legendRectSize + legendSpacing)
	    .attr('y', legendRectSize - legendSpacing)
	    .text(function (d) { return d.label; });

	// UPDATE
	chart.selectAll(".bar").data(zippedData)
		.transition().duration(1000)
		.attr("width", x)

	chart.selectAll(".value").data(zippedData)
		.transition().duration(1000)
		.attr("x", function(d) { return x(d) + 3; })
		.text(function(d) { return d.toFixed(1); });
	/*
	// Add text label in bar
	bar.append("text")
	    .attr("x", function(d) { return x(d) - 3; })
	    .attr("y", barHeight / 2)
	    .attr("fill", "red")
	    .attr("dy", ".35em")
	    .text(function(d) { return d; });

	// Draw labels
	bar.append("text")
	    .attr("class", "label")
	    .attr("x", function(d) { return - 10; })
	    .attr("y", groupHeight / 2)
	    .attr("dy", ".35em")
	    .text(function(d,i) {
	      if (i % data.series.length === 0)
		return data.labels[Math.floor(i/data.series.length)];
	      else
		return ""});
	*/

}
