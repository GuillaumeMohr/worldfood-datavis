 var which = null;

 var contains = function(needle) {
     var findNaN = needle !== needle;
     var indexOf;

     if (!findNaN && typeof Array.prototype.indexOf === 'function') {
         indexOf = Array.prototype.indexOf;
     } else {
         indexOf = function(needle) {
             var i = -1,
                 index = -1;

             for (i = 0; i < this.length; i++) {
                 var item = this[i];

                 if ((findNaN && item !== item) || item === needle) {
                     index = i;
                     break;
                 }
             }
             return index;
         };
     }
     return indexOf.call(this, needle) > -1;
 };

 function deselect_countries(countries) {
	 if (countries != null){
		 $.each(countries, function(element, country, array) {
				 var one_country = document.getElementById(country);
				 $(one_country).attr("class", "")
			 })
	 }
         //which = null;
 }

 function select_countries(countries, is_clicked = true) {
     //console.log("list countries: ", countries);
     $.each(countries, function(element, country, array) {
         var one_country = document.getElementById(country);
         var over_or_select = "active";
         if (is_clicked) {
             //console.log("is selected");
             over_or_select = "selected"
         }
         $(one_country).attr("class", over_or_select)
     })
     if (is_clicked)
         which = countries;
     //console.log("selected countries: ", which);
 }

 function update_map(countries) {
	 if (countries.length > 0){
		deselect_countries(which) 
		select_countries(countries)
	 }
	 else {
		deselect_countries(which) 
		var xyz = [width, height, 1];
         zoom(xyz);
	 }
 }

 var m_width = $("#map").width(),
     width = 938,
     height = 500,
     country;

 var projection = d3.geo.mercator()
     .scale(150)
     .translate([width / 2, height / 1.5]);

 var path = d3.geo.path()
     .projection(projection);

 var svg = d3.select("#map").append("svg")
     .attr("preserveAspectRatio", "xMidYMid")
     .attr("viewBox", "0 0 " + width + " " + height)
//	 .attr("width", m_width)
//   .attr("height", m_width * height / width);
	 .attr("preserveAspectRatio", "xMinYMin");

 svg.append("rect")
     .attr("class", "background")
     .attr("width", width)
     .attr("height", height)
     .on("click", country_clicked);

 var g = svg.append("g");

 d3.json("static/data/countries.topo.json", function(error, us) {
     g.append("g")
         .attr("id", "countries")
         .selectAll("path")
         .data(topojson.feature(us, us.objects.countries).features)
         .enter()
         .append("path")
         .attr("id", function(d) {
             return d.id;
         })
         .attr("d", path)
         .on("mousemove", over_country)
         .on("mouseout", out_country)
         .on("click", country_clicked);
 });

 function zoom(xyz) {
     g.transition()
         .duration(750)
         .attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
         .selectAll(["#countries"])
         .style("stroke-width", 1.0 / xyz[2] + "px")
         .attr("d", path.pointRadius(20.0 / xyz[2]));
 }

 function get_xyz(d) {
     var bounds = path.bounds(d);
     var w_scale = (bounds[1][0] - bounds[0][0]) / width;
     var h_scale = (bounds[1][1] - bounds[0][1]) / height;
     var z = .96 / Math.max(w_scale, h_scale);
     var x = (bounds[1][0] + bounds[0][0]) / 2;
     var y = (bounds[1][1] + bounds[0][1]) / 2 + (height / z / 6);
     return [x, y, z];
 }

 function over_country(d) {
     if (d) {
         if (document.getElementById("cOverName"))
             document.getElementById("cOverName").outerHTML = "";
         var svg = d3.select("#map").select("svg");
         var mouse = d3.mouse(svg.node()).map(function(d) {
             return parseInt(d);
         });
         //console.log("mouse: ", mouse);

         svg.append("text").text(d.properties.name)
             .attr("x", (mouse[0] + 10))
             .attr("y", (mouse[1] + 25))
             .attr("id", "cOverName");

         if (!contains.call(which, d.id)) {
             select_countries([this.id], false)
         }
     }
     // console.log("over country: ", d.id);

 }

 function out_country(d) {
     document.getElementById("cOverName").outerHTML = "";
     //tooltip.classed('hidden', true);
     if (!contains.call(which, d.id))
         deselect_countries([d.id])
 }

 function country_clicked(d) {
     if (d) {
         console.log("clicked country: ", d.properties.name)
         if (which != null)
             deselect_countries(which)
         select_countries([d.id])
     }

     if (d && country !== d) {
         deselect_countries(which)
         select_countries([d.id])
         which = [d.id]

         var xyz = get_xyz(d);
         zoom(xyz);

         compute_data({
             country_id: d.id
         })
     } else {
         var xyz = [width, height, 1];
         country = null;

         if (which != null) {
             deselect_countries(which)
             which = null;
         }
         zoom(xyz);
     }
 }
 