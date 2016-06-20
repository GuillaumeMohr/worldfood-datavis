 function highlight_countries(countries) {
   
     $.each(countries, function (element, country, array) {
      //console.log('array[' + index + '] = ' + element);
      var one_country = document.getElementById(country);
      $(one_country).attr("class", "active")
    })
      }

var m_width = $("#map").width(),
        width = 938,
        height = 500,
        country,
        state;

    var projection = d3.geo.mercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);

    var path = d3.geo.path()
        .projection(projection);

    var svg = d3.select("#map").append("svg")
        .attr("preserveAspectRatio", "xMidYMid")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("width", m_width)
        .attr("height", m_width * height / width);

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
        .attr("id", function(d) { return d.id; })
        .attr("d", path)
        .on("mouseover", over_country)
		.on("mouseout", out_country)
        .on("click", country_clicked);
    });

    function zoom(xyz) {
      g.transition()
        .duration(750)
        .attr("transform", "translate(" + projection.translate() + ")scale(" + xyz[2] + ")translate(-" + xyz[0] + ",-" + xyz[1] + ")")
        .selectAll(["#countries", "#states", "#cities"])
        .style("stroke-width", 1.0 / xyz[2] + "px")
        .selectAll(".city")
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
	
	  if (d){
    var coords = d3.mouse(this);
    var svg = d3.select("#map").select("svg");
		svg.append("text").text(d.properties.name)
		   .attr("x", get_xyz(d)[0])
		   .attr("y", get_xyz(d)[1])
		   .attr("id", "cOverName");
	  console.log("selected country: ", d.properties.name);
		console.log(get_xyz(d)[0]);
    console.log(get_xyz(d)[1]);   
		   

		d3.select(this).attr("class", "active")

   
	}
    }
	
	function out_country(d){
		   document.getElementById("cOverName").outerHTML = "";
		   d3.select(this).attr("class", "")
	}

    function country_clicked(d) {
	  if (d){
	  console.log("selected country: ", d.properties.name)}
      g.selectAll(["#states", "#cities"]).remove();
      state = null;

      if (country) {
        g.selectAll("#" + country.id).style('display', null);
      }

      if (d && country !== d) {
        var xyz = get_xyz(d);
        zoom(xyz);
        
      } else {
        var xyz = [width / 2, height / 1.5, 1];
        country = null;
        zoom(xyz);
      }
    }

    $(window).resize(function() {
      var w = $("#map").width();
      svg.attr("width", w);
      svg.attr("height", w * height / width);
    });