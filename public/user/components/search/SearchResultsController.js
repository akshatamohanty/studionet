angular.module('studionet')
.controller('SearchResultsController', ['$scope', '$state', '$stateParams', 'profile', 'tags', 'spaces', '$mdToast', function($scope, $state, $stateParams, profile, tags, spaces, $mdToast){

	var allTags = tags.tagsHash;

	$scope.$emit('showBench');
	$scope.$emit('showSearch');

	var tagParams = $stateParams.tags.split(",").map(function(t){return parseInt(t)});
	var dates = $stateParams.dates ? $stateParams.dates.map(function(d){return parseInt(d) }) : [];
	var users = $stateParams.users;


	if( tagParams || dates || users )
		console.log("all ok")
		// console.log(tags, dates, users);
		//$scope.location = "/space/tags=" + tags.join(",") + (dates || users ? "?" : "") + (dates ? "dates=" + dates.join(",") + "&" : "") + (users ? "&users=" + users.join(",") : "");
	else
		$state.go('home.search');

	// check if all tags are valid
	for(var i=0; i < tagParams.length; i++){
		var t = tagParams[i];
		if(allTags[t] == undefined){
			$state.go('home.search');
			alert("Oops... looks like you've entered a wrong URL.");
			return;
		}
	}

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
		$scope.location += " and have been posted between " + (new Date( parseInt(dates[0]) )).toString().substr(0,10) + " and " + (new Date( parseInt(dates[1]) )).toString().substr(0,10)
	}

	// compute if the space exists 
	var result = spaces.checkSpace(tagParams, dates);

	if (result !== null){
		// compute if user has subscribed to this space
		var interested_spaces = profile.user.curates; 
		interested_spaces = interested_spaces.concat(profile.user.follows);
		for(var i=0; i < interested_spaces.length; i++){
			if(interested_spaces[i].id == result.id)
				$scope.spaceName = interested_spaces[i].name;
		}

		if ($scope.spaceName == undefined)	$scope.spaceName = "<not-saved>";
	}
	else{
		if ($scope.spaceName == undefined)	$scope.spaceName = "<un-discovered>";
	}

	

	// compute leaders based on the posts 
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

	$scope.addNodeToSpace = function(item){

		// check item creation date


		// if item created is not within the dates, show an alert
		

		// if item is legally created in the time, show success modal


		// if item isn't in the time frame, show failure alert
		var toast = $mdToast.simple()
		      .textContent('Successfully added to this space')
		      .position("bottom right")

		$mdToast.show(toast).then(function(response) {
	      if ( response == 'ok' ) {
	        alert('You clicked the \'UNDO\' action.');
	      }
	    });

	}

}]);
