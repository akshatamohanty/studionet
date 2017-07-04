angular.module('studionet')

.controller('tagGraphCtrl', ['$scope', 'profile', '$stateParams',
                               function($scope, profile, $stateParams){

    $scope.stateParams = $stateParams;

    var width = 0, height = 0;
	var svg = d3.select("#timeline").append("svg:svg").attr("width", "1200px").attr("height", "150px"),
	    margin = {top: 20, right: 20, bottom: 30, left: 60},
	    width = 1200//+svg.attr("width") - margin.left - margin.right,
	    height = 150//+svg.attr("height") - margin.top - margin.bottom,
	    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	var zoom = d3.zoom()
	    .scaleExtent([0.8, 4])
	    .translateExtent([[-width, -Infinity], [2 * width, Infinity]])
	    .on("zoom", zoomed);

	var zoomRect = svg.append("rect")
	    .attr("width", width)
	    .attr("height", height)
	    .attr("fill", "none")
	    .attr("pointer-events", "all")
	    .call(zoom);

	g.append("clipPath")
	    .attr("id", "clip")
	  .append("rect")
	    .attr("width", width)
	    .attr("height", height);

	var parseDate = d3.timeParse("%Y-%m-%d"),
	    formatDate = d3.timeFormat("%Y");

	var x = d3.scaleTime()
	    .domain([new Date(2017, 0, 1), new Date(2018, 0, 1)])
	    .range([0, width]);

	var y = d3.scaleLinear()
	    .range([height, 0]);

	var xAxis = d3.axisTop(x);

	var yAxis = d3.axisLeft(y);


	var areaPath = g.append("g").attr("id", "circles")
	    .attr("clip-path", "url(#clip)")
	    .attr("fill", "steelblue");

	zoomRect.call(zoom.transform, d3.zoomIdentity)

	var data = profile.activity.filter(function(d){ return d.type == "CREATED" });
	var xExtent = d3.extent(data, function(d) { return d.date; });
	zoom.translateExtent([[x(xExtent[0]), -Infinity], [x(xExtent[1]), Infinity]])

	y.domain([0, d3.max(data, function(d) { return d.value; })]);
	//yGroup.call(yAxis).select(".domain").remove();
	areaPath.selectAll('circle').data(data).enter().append("circle").attr("cx", function(d){ return x(d.properties.dateCreated); } ).attr("cy", 50).attr("r", 2);

	function zoomed() {
	  xz = d3.event.transform.rescaleX(x);
	  //console.log(xz(new Date()));
	  g.call(xAxis.scale(xz));
	  //areaPath.selectAll('circle').transition().duration(1000).attr("cx", function(d){ return xz(d.properties.dateCreated); } );
	  //areaPath.attr("d", area.x(function(d) { return xz(d.date); }));
	}


}]);