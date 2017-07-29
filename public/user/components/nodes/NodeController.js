angular.module('studionet')

.controller('NodeController', [ '$scope', 'attachments', '$stateParams', 'users', 'tags', 'contributions', '$mdDialog',
                                function($scope, attachments, $stateParams, users, tags, contributions, $mdDialog){ 


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

        //Uploaded files
        $scope.uplodateFiles = function (files, contributionData){
            console.log(files.length + " file(s) have been choosen.");
            if(files){
                files.forEach(function(file){
                      contributionData.attachments.push(file);
                });
            }
        }

        //remove files
        $scope.removeFiles = function (attachment, contributionData) {
              var index = contributionData.attachments.indexOf(attachment);
              if(index > -1){
                    contributionData.attachments.splice(index, 1);
              }
        }

        $scope.removeFilesAndfromDB = function (attachment, contributionData){

            // if attachment is an inline image, delete the corresponding img src in the contribution body
            var result = null;
            if(attachment.attachment.name.startsWith("studionet-inline-img-")){
              result = contributionData.body.match('<img(.*)' + attachment.attachment.name + '(.*)\/>')
            }

            if(result == null){
              attachments.deleteAttachmentbyId(attachment.id, $scope.contribution.id)
                .then(function(res){
                  var index = contributionData._attachments.indexOf(attachment);
                  if(index > -1){
                        contributionData._attachments.splice(index, 1);
                        $scope.contribution.body = contributionData.body;
                        alert("Attachment was successfully deleted");
                  }
                }, function(error){
                  alert('[WARNING]: Deleting attachment is unsuccessful');
                })
            }
            else{
              alert("Cannot delete inline attachment. Please remove the image in the content first.")
            }

        }


        // ------------------Function: - Delete
        $scope.delete = function(contributionId){
            
            contributions.deleteContribution(contributionId).success(function(data){
              var msg = 'Your contribution was deleted';
                  // display success message
                  // navigate after 3 seconds
                  $mdDialog.show(
                    $mdDialog.alert()
                      .parent(angular.element(document.querySelector('body')))
                      .clickOutsideToClose(false)
                      .title('Success!')
                      .textContent(msg)
                      .ariaLabel('Action Successful')
                      .ok('Got it!')
                      //.targetEvent(ev)
                  );

                history.back();
            });

        };



}]);