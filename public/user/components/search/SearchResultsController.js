angular.module('studionet')
.controller('SearchResultsController', ['$scope', 'tags', '$mdToast', '$state', 'users',
										function($scope, tags, $mdToast, $state, users){
											console.log("im here")

	// ui-actions
	// This state shows the workbench as well as the search bar
	$scope.$emit('showBench');
	$scope.$emit('showSearch');

	// do i need these?
	var allTags = tags.tagsHash;
	$scope.users = users.usersHash;

	// error handling - if URL is not valid, return to search page
	if( $scope.$resolve.location.status == -1 ){

		//todo: display an error message
		

		//navigate away to the search page
		$state.go('home.search');
	}


	/*
	 *		$scope.$resolve.location - contains data about the current space
	 *		location.status - Gives the status based on the following cases
	 *		Case: URL is invalid  | -1
	 *		Case: URL is valid but there is no space associated with it | 0
	 * 		Case: URL is valid and there is a space associated with it, but the user has not followed / curated it | 1
	 * 		Case: URL is valid and there is a space associated with it, the user has followed it | 2
	 * 		Case: URL is valid and there is a space associated with it, the user has curated it | 3
	 *   	Case: URL is valid and there is a space associated with it, the user has curated as well as followed it | 4 
	 * 			
	 */

	// map the data to the page components 
	$scope.status = $scope.$resolve.location.status;
	$scope.space_name = $scope.$resolve.location.name;
	$scope.about_space = $scope.$resolve.location.about;

	// map these only if a space exists 
	if($scope.status > 1){
		// person who first saved this space
		$scope.founder = $scope.$resolve.location.details.by;

		// people who have forked this space
		$scope.followers = $scope.$resolve.location.details.followers;
		$scope.curators = $scope.$resolve.location.details.curators;
	}


	$scope.saveSpaceToDrawer = function(){
		profile.user.curates.push(4123)
	}

	/*
	 *  Dealing with the space results
	 *
	 *
	 *
	 *
	 * 
	 */
	
	if( $scope.$resolve.search_results.length == 0 ){

		// todo: display a no results message

	}	

	$scope.posts = $scope.$resolve.search_results; 
	console.log($scope.posts);

	// compute the suggested tags

	// compute leaders based on the posts 
	$scope.leaders = [
		{name: "Harry Potter", handle: "@harry"},
		{name: "Draco Malfoy", handle: "@malfoy"},
		{name: "Ron Weasley", handle: "@weasley"}
	]

	$scope.addNodeToSpace = function(item){

		$scope.posts.push(item);

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
