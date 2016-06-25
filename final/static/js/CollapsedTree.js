var margin = {top: 20, right: 120, bottom: 20, left: 50},  // left: 120,top: 20
    //width = 960 - margin.right - margin.left,
    //height = 800 - margin.top - margin.bottom;
    width = 500 //- margin.right - margin.left,
    height = 300 //- margin.top - margin.bottom;

var selected_country = null;
var i = 0,
    duration = 750,
    root;

var tree = d3.layout.tree()
    .size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

// Change is HERE - I change body to #collapsedTree so that the chart is inserted in "<div id="collapsedTree"></div>"
var svg = d3.select("#collapsedTree").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// tree init
d3.json("static/data/data.json", function(error, flare) {
  if (error) throw error;
  console.log(flare);
  root = flare;
  root.x0 = height / 2;
  root.y0 = 0;
  function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
  }
  root.children.forEach(collapse);
  update(root);
});
// tree update
function update_tree(dataTree,query) {
  console.log(dataTree);
  selected_country = query;
  root = dataTree;
  root.x0 = height / 2;
  root.y0 = 0;
  function collapse(d) {
    if (d.children) {
      console.log(d);
      console.log("---------");
      d._children = d.children;
      var x = [];
      if (Array.isArray(d._children))
        d._children.forEach(collapse);
      else
      {
        d._children = [d._children];
        //x.push(d._children);
        d._children.forEach(collapse);
      }

      d.children = null;
    }
  }
  root.children.forEach(collapse);
  update(root);
}

d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 90; });  // changer la longueur de l'arc

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", click);

  // add the circle
  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  // add the text
  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })  // here we put the name of the node (d.name)
      .style("fill-opacity", 1e-6);
  //console.log(d.name);
  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)  // duration of nodes creation
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; }); // position of he created nodes

  // create circles and fill color
  nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d._children ? "lightsteelred" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 0.5);  // change the opacity of circles

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  //updateBarChart(d.name);
  console.log("[CollapsedTree click] selected_country, object sent to compute_data");
  console.log(selected_country);
  console.log({level: d.level, category: d.name, query: selected_country});
  compute_data({level: d.level, category: d.name, query: selected_country});
  /*
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
  */
}

