angular.module('studionet')

.controller('NodeController', [ '$scope', 'attachments', '$stateParams', 'users', 'tags', 'contributions', '$mdDialog', '$state', '$mdToast', 'links',
                                function($scope, attachments, $stateParams, users, tags, contributions, $mdDialog, $state, $mdToast, links){ 


        // change this to resolve 
        $scope.node_id = $stateParams.address;
        if($scope.node_id == null)
          $state.go('home.homepage');

      	// details of the post displaying

        $scope.users = users.usersHash;
        $scope.tags = tags.tagsHash;

        $scope.linkNewParent = function(new_parent, post_id){

            // [post]->[parent]
          	var linkData = {
               source: post_id,
               target: new_parent.id,
               note: "drag and drop"
            }

            links.createLink(linkData).success(function(){
                var toast = $mdToast.simple()
                  .textContent('Successfully created new links!')
                  .position("bottom right")

                $mdToast.show(toast);

                $state.reload();

            });

        }

        $scope.linkNewChild = function(new_child, post_id){

            // [child | source]->[post | target]
            var linkData = {
               source: new_child.id,
               target: post_id,
               note: "drag and drop"
            }

            links.createLink(linkData).success(function(){
                var toast = $mdToast.simple()
                  .textContent('Successfully created new links!')
                  .position("bottom right")

                $mdToast.show(toast);

                $state.reload();

            });

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
            contributions.viewContribution(post.id);
        	}


        }
        $scope.setMainPost = setMainPost;

        // initial;
        setMainPost($scope.$resolve.postDetails.data, undefined);

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

        $scope.comment = function(post_id){
            // Appending dialog to document.body to cover sidenav in docs app
            var confirm = $mdDialog.prompt()
              .title('Chit Chat')
              .textContent('Comments are short! If you want to write more, please reply to this post.')
              .placeholder('Lorem ipsum ..')
              .ariaLabel('Comment')
              //.targetEvent(ev)
              .ok('Comment')
              .cancel('Cancel');

            $mdDialog.show(confirm).then(function(result) {
                  
                  var new_comment = { 
                                  attachments: [], 
                                  tags: [],
                                  refType: "COMMENT_FOR", 
                                  ref:  post_id,
                                  contentType: "comment",
                                  body: result,
                                  title: "Re: " + post_id
                                };

                  contributions.createContribution( new_comment ).then(function(res){
                        var toast = $mdToast.simple()
                          .textContent('Hurrah! Keep the conversation going!')
                          .position("bottom right")

                        $mdToast.show(toast);

                        $state.reload();


                  }, function(error){

                      // display error
                  
                  }); 

            }, function() {
              $scope.status = 'You didn\'t name your dog.';
            });
        }

        $scope.reply = function(post){
          $state.go('home.node', {type: "note", tags: [], ref: post });
        }

        $scope.like = function(post_id){
            contributions.likeContribution(post_id).success(function(){
                  var toast = $mdToast.simple()
                          .textContent('You liked this post!')
                          .position("top centre")

                  $mdToast.show(toast);
            });
        }

        // ------------------Function: - Delete
        $scope.delete = function(contributionId, comment){
            
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

                if(comment == true){
                  $state.reload();
                }
                else{
                    history.back();
                }
            });

        };



}]);

app.filter('post_icon', [function() {
    return function(string) {

      switch(string){

        case "note":
          return "speaker_notes";

        case "question":
          return "question_answer"

        case "assignment":
          return "assignment"

        default: 
          return "speaker_notes";
      }

    };
}])