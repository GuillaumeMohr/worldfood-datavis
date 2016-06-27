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
  //console.log(flare);
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
  console.log("the returned tree");
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
      //update(d);
      d._children.forEach(collapse);
      d.children = null;

    }
  }
  root.children.forEach(collapse);
  update(root);
}

d3.select(self.frameElement).style("height", "800px");

function update(source) {

  //console.log(source);
  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);
  console.log("the nodes are");
  console.log(nodes);
// tree.nodes(root.children[0]).reverse()
  //console.log(nodes);
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 150; });  // changer la longueur de l'arc

  // Update the nodes…

  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id = ++i; });

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

function simulate_clicks(source) {
  //console.log(source)
  if (source.children) {
    source._children = source.children;
    //source._children.forEach(simulate_clicks);
    source.children = null;
    
  } else {
    source.children = source._children;
    //source.children.forEach(simulate_clicks);
    source._children = null;
    
  } 
 console.log("source node to update node");
 console.log(source);
 update(source);
}

function click(d) {
  //updateBarChart(d.name);
  //console.log("[CollapsedTree click] selected_country, object sent to compute_data");
  //console.log(selected_country);
  //console.log({level: d.level, category: d.name, query: selected_country});
  compute_data({level: d.level, category: d.name, query: selected_country});
  //root.children.forEach(simulate_clicks);
  svg.selectAll("g.node").remove();
 // var childsFile = root.children;  // Array of root childrens

  // create a new queue
var queue = new Queue();

// enqueue an item
queue.enqueue(root.children);

// dequeue an item
var item = queue.dequeue();

while(item)
{
  for (i=0;i<item.length;i++)
  {
    if (item[i]._children.length!=0)
    queue.enqueue(item[i]._children);
    simulate_clicks(item[i]);
  } 
  item = queue.dequeue()
}



  /*var test = False;
  var i = 0;
  While (test)
  {
 //for (i = 0; i < childsFile.length; i++) 
  //{
    simulate_clicks(childsFile[i]);
    // append children to next layer
    console.log(childsFile[i]);
    childsFile.push(childsFile[i]._children);
    childsFile = childsFile.reduce(function(a, b) {return a.concat(b);}, []);
    console.log(childsFile);
    i++;
  } */
} 

