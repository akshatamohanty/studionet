angular.module('studionet')
.controller('SearchResultsController', ['$scope', '$mdToast', '$mdDialog', 'routerUtils', 'tags', 'users', 'profile', 'spaces',
										function($scope, $mdToast, $mdDialog, routerUtils, tags, users, profile, spaces ){

	
	// error handling - if URL is not valid, return to search page
	if( $scope.$resolve.location.status == -1 ){

		//todo: display an error message
		

		//navigate to previous page
		history.back();
		
	}


	// -------------- 
	// ui-actions - This state shows the workbench as well as the search bar
	$scope.$emit('showBench');
	$scope.$emit('showSearch');

	
	// --------------- general functions
	$scope.getTagString = function(id){ return tags.tagsHash[id] };
	$scope.getAvatar = function(user_id){ return users.usersHash[user_id].avatar };


	// ----------------- location data mapping

	//	$scope.$resolve.location - contains data about the current space
	//	location.status - Gives the status based on the following cases
	//  Case: URL is invalid  | -1
	//	Case: URL is valid but there is no space associated with it | 0
	// 	Case: URL is valid and there is a space associated with it, but the user has not followed / curated it | 1
	//  Case: URL is valid and there is a space associated with it, the user has followed it | 2
	// 	Case: URL is valid and there is a space associated with it, the user has curated it | 3
	//  Case: URL is valid and there is a space associated with it, the user has curated as well as followed it | 4 
	//
	// 	map the data to the page components 
	
	$scope._tags = $scope.$resolve.location.tags;
	$scope._dates = $scope.$resolve.location.dates;
	$scope.status = $scope.$resolve.location.status;
	$scope.space_name = $scope.$resolve.location.name;
	$scope.about_space = $scope.$resolve.location.about;
	$scope.expired = false;

	var space = $scope.$resolve.location.details;
	
	// map these only if a space exists 
	if($scope.status > 0){
		// person who first saved this space
		$scope.founder = $scope.$resolve.location.details.by; 

		// people who have forked this space
		$scope.followers = $scope.$resolve.location.details.followers;
		$scope.curators = $scope.$resolve.location.details.curators;

		//http://localhost:3000/user/#/space?tags=407,426,4402&dates=1498273886030,1499273886030

		$scope.expired = ( space.timed.length == 2 && ( space.timed[1] < (new Date()) ) ) ? true : false;

	}

	// ------------- Dealing with search results

	if( $scope.$resolve.search_results.length == 0 ){

		// todo: display a no results message

	}	

	$scope.posts = $scope.$resolve.search_results.data; 

	// compute the suggested tags
	// 
	// 

	// compute leaders based on the posts 
	// 
	// 



	// ------------- location based functions

	//
	//	tags a contribution with the tags of the space
	//
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
		profile.tagContribution(item.id, $scope._tags)
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

	$scope.fork = function(){

	    // Appending dialog to document.body to cover sidenav in docs app
	    var confirm = $mdDialog.prompt()
	      .title('What do you want to name your collection?')
	      //.textContent('Bowser is a common name.')
	      .placeholder('text')
	      .ariaLabel('text')
	      .initialValue( $scope._tags.map(function(t){ return $scope.getTagString(t).name }).join("_").replace(" ", "-") )
	      .ok('Create')
	      .cancel('Cancel');

	    $mdDialog.show(confirm).then(function(result) {

	    	// there is an existing space
	    	if ($scope.status > 0){
	    		// creating fork to existing space
	    		spaces.forkSpace({name: result, space: space.id})
	    	}
	    	else{
	    			// create the space if space doesn't exist
			      	spaces.createSpace($scope._tags, $scope._dates).then(function(data){

			      		var space_id = data.data[0].id;

			      		// fork the space
			      		spaces.forkSpace({name: result, space: data}).success(function(){
			      			var toast = $mdToast.simple()
						      .textContent('Successfully forked this space!')
						      .position("bottom left")

							$mdToast.show(toast);
			      		})

				      }, function(){

				      		// todo: show error alert

				      })

			    


	    	}
	    }, function() {
			
	    	// canceled fork creation
			//$scope.status = 'You didn\'t name your dog.';
				    
		});

	      


	}

	$scope.addNodeToFork = function(){
		 
	}

	$scope.subscribe = function(){
		alert("subscription doens't work yet")
	}

}]);
