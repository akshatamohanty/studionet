angular.module('studionet')
.controller('SearchResultsController', ['$scope', '$state', '$stateParams', 'profile', 'tags', function($scope, $state, $stateParams, profile, tags){

	var allTags = tags.tagsHash;

	$scope.$emit('showBench');
	$scope.$emit('showSearch');

	var tagParams = $stateParams.tags.split(",");
	var dates = $stateParams.dates;
	var users = $stateParams.users;


	// TODO: Functionality to display the cards matching a query / tagspace
	/*var tags = $stateParams.tags && $stateParams.tags.length > 0 ? $stateParams.tags.split(",") : null;
	var dates = $stateParams.dates ? $stateParams.dates.split(",") : null;
	var users = $stateParams.users ? $stateParams.users.split(",") : null;*/

	if( tags || dates || users )
		console.log(tags, dates, users);
		//$scope.location = "/space/tags=" + tags.join(",") + (dates || users ? "?" : "") + (dates ? "dates=" + dates.join(",") + "&" : "") + (users ? "&users=" + users.join(",") : "");
	else
		$state.go('home.search');

	$scope.posts = [
		{"id": "1", "title": "Hello World 1", "author": 2, "rating": "gold", "size": "xl"},
		{"id": "2", "title": "Hello World 2", "author": 2, "rating": "silver", "size": "md"},
		{"id": "3", "title": "Hello World 3", "author": 2, "rating": "gold", "size": "xl"},
		{"id": "4", "title": "Hello World 4", "author": 2, "rating": "plastic", "size": "xl"},
		{"id": "5", "title": "Hello World 5", "author": 2, "rating": "bronze", "size": "sm"},
		{"id": "6", "title": "Hello World 6", "author": 2, "rating": "silver", "size": "md"},
		{"id": "7", "title": "Hello World 7", "author": 2, "rating": "plastic", "size": "xs"},
		{"id": "8", "title": "Hello World 8", "author": 2, "rating": "bronze", "size": "md"},
		{"id": "1", "title": "Hello World 1", "author": 2, "rating": "gold", "size": "xl"},
		{"id": "2", "title": "Hello World 2", "author": 2, "rating": "silver", "size": "md"},
		{"id": "3", "title": "Hello World 3", "author": 2, "rating": "gold", "size": "xl"},
		{"id": "4", "title": "Hello World 4", "author": 2, "rating": "plastic", "size": "xl"},
		{"id": "5", "title": "Hello World 5", "author": 2, "rating": "bronze", "size": "sm"},
		{"id": "6", "title": "Hello World 6", "author": 2, "rating": "silver", "size": "md"},
		{"id": "7", "title": "Hello World 7", "author": 2, "rating": "plastic", "size": "xs"},
		{"id": "8", "title": "Hello World 8", "author": 2, "rating": "bronze", "size": "md"}
	]

	// update the location
	$scope.location = "This space consists of posts which have the tags: " + tagParams.map(function(t){return allTags[t].name}).join(" and ");
	if(dates !== null){
		console.log("Dates", dates);
		$scope.location += " and have been posted between " + (new Date( parseInt(dates[0]) )).toString().substr(0,10) + " and " + (new Date( parseInt(dates[1]) )).toString().substr(0,10)
	}


	$scope.leaders = [
		{name: "Harry Potter", handle: "@harry"},
		{name: "Draco Malfoy", handle: "@malfoy"},
		{name: "Ron Weasley", handle: "@weasley"}
	]

	// person who first saved this space
	$scope.founder = {'id':123, 'name':'Samatha Dawes'};

	// people who have forked this space
	$scope.forks = [ 2, 3, 4, 6, 7, 8, 9]

	$scope.saveSpace = function(){
		profile.user.curates.push(4123)
	}

}]);
