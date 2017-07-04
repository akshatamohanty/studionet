angular.module('studionet')

// for other people's profile
.controller('ProfileController', ['$scope', '$rootScope', 'profile', 'tags', 'groups', 'users', 'GraphService', '$rootScope', '$stateParams', function($scope, $rootScope, profile, tags, groups, users, GraphService, $rootScope, $stateParams){

	$scope.profile = "hello";

	$scope.$emit('hideBench');
	$scope.$emit('hideSearch');


	if ($stateParams.address.length !== 0)
		$scope.profile = $stateParams.address

	/*
	 *	Functionality for User Profile Page
	 */
	$scope.standalone = false;

	$scope.tags = tags.tags;
	$scope.groups = groups.groups;

	$scope.tagline = "Beginner";

	// Observe the Graph Service for Changes and register observer
	var updateProfile;

	var computeStats = function(){

		$scope.views = 0; 
		$scope.rating = 0;
		// compute the rating based on rating of the contributions the user has made
		var rateCount = 0;
		var totalRating = 0;

		if($scope.user.contributions.length == 1 && $scope.user.contributions[0].title == null){
			$scope.user.contributions = [];
		}
		else{
			for(var i=0; i < $scope.user.contributions.length; i++){
				var contribution = $scope.user.contributions[i]; 
				$scope.views += contribution.views; 
				totalRating += contribution.rateCount*contribution.rating;
				rateCount += contribution.rateCount;  
			}
		}

		if($scope.user.tags.length == 1 && $scope.user.tags[0].name == null){
			$scope.user.tags = [];
		}

		$scope.rating = (totalRating / rateCount).toFixed(1);
		$scope.level = Math.floor($scope.user.level + 1)
	}

	$scope.goToNode = function(node_id){

		// select the node
		GraphService.selectNode(node_id, true);

		//$scope.close();
	}

	$scope.$on( "PROFILE_MODE", function(event, args) {
		setUser(args.id);
  	});


	var setUser = function(user_id){

	    if(window["ga"] == undefined){
	      console.log("ga is not defined");
	    }
	    else{
	      ga("send", "event", "pop up", "profile-view", "/user");
	    }

		if(user_id == profile.user.id || user_id == undefined){


			
			$scope.user = profile.user;
			$scope.own = true;

			if($scope.user.isGuest== true)
				return;

			updateProfile = function(){
			  $scope.user = profile.user;
			};
			profile.registerObserverCallback(updateProfile);
			
			computeStats();
		}
		else{

			$scope.user = users.getUser(user_id);
			$scope.own = false;

			users.getUser(user_id, true).then(function(res){

				if(res.status == 200){
					computeStats();
				}
				else{
					console.err("Error fetching user data");
				}


			});
		
		}
	
	}

	$scope.close = function() {
	    $('body').removeClass('modal-open');
	    $('.modal-backdrop').remove();
  	};
  

}])


