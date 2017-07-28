angular.module('studionet')

.controller('NodeController', [ '$scope', 'attachments', '$stateParams', 'users', 'tags', 'contributions',
                                function($scope, attachments, $stateParams, users, tags, contributions){ 


        // change this to resolve 
        $scope.node_id = $stateParams.address;
        if($scope.node_id == null)
          $state.go('home.homepage');

      	// details of the post displaying

        $scope.users = users.usersHash;
        $scope.tags = tags.tagsHash;

        $scope.linkNewParent = function(new_parent){
        	alert("new parent added");
        }

        $scope.ancestors = [];
        $scope.parent = 0;
        $scope.child = 0;
        var setMainPost = function(post, direction){

        	if( post.body == undefined ){

        		contributions.getContribution(post.id).then(function(response){

        			var post = response.data;

        			var previous_post = $scope.post_details;
        			console.log($scope.post_details);

        			if(direction > 0){

        					console.log(previous_post);

        				$scope.ancestors.push($scope.post_details.parents[$scope.parent]);

        				// set parentId as the original post
        				for(var i=0; i < post.parents.length; i++){
        					if(post.parents[i].id == $scope.post_details.id){
        						$scope.parent = i;
        						break;
        					}
        				}

        				$scope.post_details = post;

        			}

        			$scope.post_details = post;

        		}, function(){
        			alert("Error");
        		})

        	}
        	else{
        		$scope.post_details = post;
        	}


        }

        setMainPost($scope.$resolve.postDetails.data, undefined);

        $scope.setMainPost = setMainPost;


}]);