angular.module('studionet')
.controller('SearchResultsController', ['$scope', 'tags', '$mdToast', '$state', 'users', 'profile', 'routerUtils', 'spaces',
										function($scope, tags, $mdToast, $state, users, profile, routerUtils, spaces){


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
		

		//navigate to previous page
		history.back();
		
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
	var space_tags = $scope.$resolve.location.tags;
	var space_dates = $scope.$resolve.location.dates;
	$scope._tags = space_tags;
	$scope._dates = space_dates;

	$scope.status = $scope.$resolve.location.status;
	$scope.space_name = $scope.$resolve.location.name;
	$scope.about_space = $scope.$resolve.location.about;
	$scope.expired = false;

	var space = $scope.$resolve.location.details;

	// map these only if a space exists 
	if($scope.status > 1){
		// person who first saved this space
		$scope.founder = $scope.$resolve.location.details.by;

		// people who have forked this space
		$scope.followers = $scope.$resolve.location.details.followers;
		$scope.curators = $scope.$resolve.location.details.curators;

		//http://localhost:3000/user/#/space?tags=407,426,4402&dates=1498273886030,1499273886030

		$scope.expired = ( space.timed.length == 2 && ( space.timed[1] < (new Date()) ) ) ? true : false;

	}

	$scope.saveSpace = function(){
		spaces.createSpace(space_tags, space_dates);
	}

	$scope.makeFork = function(){
		
		profile.bookmarkPost()
	

	}


	// Dealing with search results
	// 
	// 
	// 
	
	if( $scope.$resolve.search_results.length == 0 ){

		// todo: display a no results message

	}	

	$scope.posts = $scope.$resolve.search_results.data; 

	// compute the suggested tags
	// 
	// 
	// 

	// compute leaders based on the posts 
	// 
	// 
	// 
	$scope.leaders = [
		{name: "Harry Potter", handle: "@harry"},
		{name: "Draco Malfoy", handle: "@malfoy"},
		{name: "Ron Weasley", handle: "@weasley"}
	]

	$scope.addNodeToSpace = function(item){

		// todo: check if this item was created by the user
		if( item.created_by !== profile.user.id ){

			// todo: show dialog

			alert("You can only add your own nodes to spaces");
			
		}

		// check if the item is already present in the results 
		// return if it does
		for(var i=0; i < $scope.posts.length; i++){
			if( $scope.posts[i].id == item.id ){
					var toast = $mdToast.simple()
						      .textContent('Oops... This post already exists here!')
						      .position("bottom right")

					$mdToast.show(toast);	
					return;
			}

		}

		// tag the node with the tags of the space
		profile.tagContribution(item.id, space_tags)
				.success(function(data){

	   					item.tags = data; 

	   					// refresh the post results
						$scope.posts.push(item);
				
						// if item isn't in the time frame, show failure alert
						var toast = $mdToast.simple()
						      .textContent('Successfully added to this space')
						      .position("bottom right")

						$mdToast.show(toast);
				})
				.error(function(){

						var toast = $mdToast.simple()
						      .textContent('Hmm.... Something went wrong')
						      .position("bottom right")

						$mdToast.show(toast);
				
				}) 

	}

}]);
