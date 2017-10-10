angular.module('studionet')
.controller('SearchResultsController', ['$scope', '$mdToast', '$mdDialog', 'routerUtils', 'tags', 'users', 'profile', 'spaces', 
										function($scope, $mdToast, $mdDialog, routerUtils, tags, users, profile, spaces){

	
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
  ;
	// --------------- general functionspush
	$scope.tagr =[];
	$scope.getTagString = function(id){ 
	  $scope.tagr.push(tags.tagsHash[id].name);
	  return tags.tagsHash[id]  
	};
	$scope.getUserName = function(user_id){return; users.usersHash[user_id].name };
	$scope.getAvatar = function(user_id){ return users.usersHash[user_id].avatar };
	$scope.getPostStatus = profile.getPostStatus;
   	//console.log(tags.tagsHash[415].name)
  	//console.log($scope.tagr);
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

		// compute leaders based on the posts 
	// 
	// 


	$scope.posts = $scope.$resolve.search_results.data; 
	$scope.tagrs =$scope.$resolve.location.tags;
    $scope.tagged ='';  
    //$scope.tagged = tags.tagsHash[$scope.tagrs].name;
    console.log($scope.tagged);
	console.log($scope.posts.length);
	console.log($scope.posts);



	var rating=0; 
	var views=0;  
	//var user_rating = [];
	var likes=0;
	$scope.rat = [];
	var bookmarks=0;
	for(var i =0 ;i < $scope.posts.length;i++){
	
    if(!$scope.posts[i].views)
	{
		views=0;
	}
	else{
		views=$scope.posts[i].views;
	
	}

	if(!$scope.posts[i].bookmarks)
	{
		bookmarks=0;
	}
	else{
		bookmarks=$scope.posts[i].bookmarks;
	
	} 
    if(!$scope.posts[i].likes)
	{
		likes=0;
	}
	else{
		likes=$scope.posts[i].likes;
	
	}



	$scope.posts[i].rating = views/10 + likes/5 + bookmarks/2

}







var ASC = 1;
var DESC = -1;

var sortOrder = DESC;
 $scope.posts.sort(function(a,b){
  return sortOrder * ( a.rating - b.rating );

})


 
$scope.users = [];

//$scope.ids =[];
 for(var i =0 ;i <3;i++){
	var id =$scope.posts[i].createdBy;
	$scope.users.push({"name": users.usersHash[id].name , "ids":id});
	}
//removeDuplicates($scope.users);

var uniq = new Set($scope.users.map(e => JSON.stringify(e)));

$scope.uniqueUsers = Array.from(uniq).map(e => JSON.parse(e));


 console.log($scope.uniqueUsers);


	// leaderboard over 
	var suggested_tags = [];
	for(var i=0; i < $scope.posts.length; i++){
		var post = $scope.posts[i];
		post.tags.forEach(function(t){

			if( suggested_tags[t.id] == undefined )
				suggested_tags[t.id] = t.tagged_by.length;
			else
				suggested_tags[t.id] += t.tagged_by.length;
			
		})
	}
	$scope.suggested_tags = [];
	for( key in suggested_tags ){
		if( suggested_tags.hasOwnProperty(key) && $scope._tags.indexOf(parseInt(key)) == -1 ){
			$scope.suggested_tags.push({ id: key, count: suggested_tags[key] })
		}
	}




	// background of the cards 
	$scope.getPostBackground = function(post){

		if(post.attachments == undefined)
			return {};

		if(post.attachments[0].id == null)
			return {};

		var path = undefined;
		for(var i=0; i < post.attachments.length; i++){
			path = routerUtils.getThumb(post.id, post.attachments[i]);
			
			// image found
			if(path.image == true)
				break;
		}

		return path.style;  

	}


	$scope.addTagToSearch = function(tag_id){
		$scope._tags.push(parseInt(tag_id));
		routerUtils.goToSpaceWithArgs($scope._tags, $scope._dates);
	}

	$scope.goToTagSpace = function(tag_id){
		routerUtils.goToSpaceWithArgs([tag_id], []);
	}


	// ------------- location based functions
	$scope.newnodepath =  {type: "note", tags: $scope._tags, ref: null};
	
	//
	//	tags a contribution with the tags of the space
	//
	$scope.addNodeToSpace = function(item){

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

						var data = data[0];

	   					item.tags = data.tags; 
	   					data.contribution.tags = data.tags

	   					// add the node to results
	   					$scope.posts.push(data.contribution);
						
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

		// check if the space is present in the users forks
		if($scope.status > 0){

			var user_forks = profile.user.forked;

			for(var i=0; i< user_forks.length; i++){
				if(user_forks[i].id == space.id){
	      			var toast = $mdToast.simple()
				      .textContent('Oops.. this space is already in your saved spaces')
				      .position("bottom left")

					$mdToast.show(toast);
					return;
				}	
			}
		}


		var suggested_fork_name = $scope._tags.map(function(t){ return $scope.getTagString(t).name }).join("_").replace(" ", "-");

		if( $scope._dates.length == 2){

			var d1 = new Date($scope._dates[0]);
			var d2 = new Date($scope._dates[1]);

			suggested_fork_name += "_" + d1.getDate() + "/" + (parseInt(d1.getMonth() + 1)) + "/" + d1.getFullYear(); // add first date
			suggested_fork_name += "-" + d2.getDate() + "/" + (parseInt(d2.getMonth() + 1)) + "/" + d2.getFullYear(); // add second date

		}													


	    // Appending dialog to document.body to cover sidenav in docs app
	    var confirm = $mdDialog.prompt()
	      .title('What do you want to name your collection?')
	      //.textContent('Bowser is a common name.')
	      .placeholder('text')
	      .ariaLabel('text')
	      .initialValue( suggested_fork_name )
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
			      		spaces.forkSpace({name: result, space: space_id}).success(function(){
			      			var toast = $mdToast.simple()
						      .textContent('Successfully forked this space!')
						      .position("bottom left")

							$mdToast.show(toast);
			      		})

				      }, function(){

				      		var toast = $mdToast.simple()
						      .textContent('Oops...something went wrong! Please try again.')
						      .position("bottom left")

							$mdToast.show(toast);

				      })

			    


	    	}
	    }, function() {
			
	    	// canceled fork creation
			//$scope.status = 'You didn\'t name your dog.';
				    
		});

	}

	$scope.subscribe = function(){
		alert("subscription doens't work yet")
	}



}]);
