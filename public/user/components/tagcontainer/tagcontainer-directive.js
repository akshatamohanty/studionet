angular.module('studionet')
.controller('spaceController', ['$scope', 'profile', '$stateParams', '$state',
                               function($scope, profile, $stateParams, $state){
  $scope.stateParams = $stateParams;

  var renderBaseGraph = function(){
    // process graph according to home page
    var svgwidth = d3.select('#svg-container').style('width');
    var svgheight = d3.select('#svg-container').style('height');
    var svg = d3.select("#svg-container").append('svg').attr('width', svgwidth).attr('height', svgheight);
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody().strength(-5000))
        .force("center", d3.forceCenter(240, 240));


    d3.json("./templates/main-tags.json", function(error, graph) {
      if (error) throw error;
      
      graph.links.forEach(function(d){
        d.source = d.source_id;    
        d.target = d.target_id;
      });           

      var link = svg.append("g")
                    .style("stroke", "#aaa")
                    .selectAll("line")
                    .data(graph.links)
                    .enter().append("line");

      var node = svg.append("g")
                .attr("class", "nodes")
      .selectAll("circle")
                .data(graph.nodes)
      .enter().append("circle")
              .attr("r", 20)
              .on("click", function(d){
                $state.go('post', {tags:d.name});
              });

      
      var label = svg.append("g")
          .attr("class", "labels")
          .selectAll("text")
          .data(graph.nodes)
          .enter().append("text")
            .attr("class", "label")
            .style("margin-left", "-20px")
            .text(function(d) { return "#" + d.name; });

      simulation
          .nodes(graph.nodes)
          .on("tick", ticked);

      simulation.force("link")
          .links(graph.links);

      function ticked() {
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node
             .attr("r", function(d){return 10 + parseInt(d.count)/8})
             .style("fill", "#d9d9d9")
             .style("stroke", "#969696")
             .style("stroke-width", "1px")
             .attr("cx", function (d) { return d.x+6; })
             .attr("cy", function(d) { return d.y-6; });
        
        label
            .attr("x", function(d) { return d.x; })
                .attr("y", function (d) { return d.y; })
                .style("font-size", "10px").style("fill", "#4393c3").style("margin-left", "20px");
      }
    });
  }

  if(Object.keys($scope.stateParams).length === 0 && $scope.stateParams.constructor === Object){
    renderBaseGraph();
  }
  else{
    // process the graph
    renderBaseGraph();
  }

  $scope.changeSpace = function(){
    $state.go('tag', {tags:"studio"});
  }


}])
.directive('tagContainer', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    controller: 'spaceController',
    templateUrl: './components/tagcontainer/tags.html'
  };
});