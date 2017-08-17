angular.module('studionet')
.controller('NodeController', [ '$scope', 'attachments', 'users', 'tags', 'contributions', '$mdDialog', '$state', '$mdToast', 'links', 'routerUtils', '$anchorScroll', '$location', 'routerUtils',
                                function($scope, attachments, users, tags, contributions, $mdDialog, $state, $mdToast, links, routerUtils, $anchorScroll, $location, routerUtils){ 


        $scope.goToTagSpace = function(tag){
          routerUtils.goToSpaceWithArgs([tag],[]);
        } 

        $scope.$emit('showBench');

        // change this to resolve 
        var post = $scope.$resolve.postDetails.data;

        $scope.node_id = post.id;

        $scope.getUser = users.getUserShort; // gets a short description of the user 
        $scope.getTagName = tags.getTagName;

        $scope.getThumb = routerUtils.getThumb;

        $scope.backToTop = function(){
              /*$location.hash('top');
              $anchorScroll();*/
            $("#view_container").animate({ scrollTop: 0 }, "slow");
        }

        $scope.goToEnd = function(){
            $('#view_container').animate({ scrollTop: $('#view_container')[0].scrollHeight }, "slow");
        }

        var reload = function(){
          $state.go( $state.current, {address: post.id}, {reload: "home.node-details"});
        }
 
        $scope.linkNewParent = function(new_parent, post_id){

            if(new_parent.id == post_id){
              var toast = $mdToast.simple()
                  .textContent('Oops... you can\'t link the post to itself!')
                  .position("bottom right")

                $mdToast.show(toast);
                return;
            }

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

                reload();

            });

        }

        $scope.linkNewChild = function(new_child, post_id){
            if(new_child.id == post_id){
              var toast = $mdToast.simple()
                  .textContent('Oops... you can\'t link the post to itself!')
                  .position("bottom right")

                $mdToast.show(toast);
                return;
            }


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

                reload();

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

        			if(direction > 0){

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
        setMainPost(post, undefined);

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

        $scope.comment = function(post){

            var post_id = post.id;
            var post_title = post.title;

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

                  if(result == undefined || result.length == 0){
                    var toast = $mdToast.simple()
                          .textContent('Oops.. Can\'t post a blank comment!')
                          .position("bottom right")

                    $mdToast.show(toast);
                    return;
                  }
                  
                  var new_comment = { 
                                  users: [],
                                  attachments: [], 
                                  tags: [],
                                  refType: "COMMENT_FOR", 
                                  ref:  post_id,
                                  contentType: "comment",
                                  body: result,
                                  title: "Re: " + post_title
                                };

                  contributions.createContribution( new_comment ).then(function(res){
                        
                        var toast = $mdToast.simple()
                          .textContent('Hurrah! Keep the conversation going!')
                          .position("bottom right")

                        $mdToast.show(toast);
                      
                        reload();


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


        $scope.edit = function(post){
          $state.go('home.edit', {data: post, address: post.id});
        }

        $scope.like = function(post_id){

            contributions.likeContribution(post_id).success(function(){
                  var toast = $mdToast.simple()
                          .textContent('You liked this post!')
                          .position("bottom left")

                  $mdToast.show(toast);

                  $scope.post_details.status.push("liked");
                  $scope.post_details.likes.push({id: -1});
            });
        }

        $scope.unlike = function(post_id){

            contributions.unlikeContribution(post_id).success(function(){
                  var toast = $mdToast.simple()
                          .textContent('You unliked this post!')
                          .position("bottom left")

                  $mdToast.show(toast);

                  if($scope.post_details.status.indexOf("liked") > -1)
                    $scope.post_details.status.splice($scope.post_details.status.indexOf("liked"));

                  $scope.post_details.likes.pop();
            });

        }

        // ------------------Function: - Delete
        $scope.delete = function(contributionId, comment){
            
            contributions.deleteContribution(contributionId).then(function(data){
              var msg = 'Your contribution was deleted';
                  // display success message
                  // navigate after 3 seconds
                  var toast = $mdToast.simple()
                          .textContent(msg)
                          .position("bottom right")

                        $mdToast.show(toast);

                if(comment == true){
                    // reload view if contribution was comment
                    reload();
                }
                else{
                    // navigate back to homepage
                    history.back();
                }
            }, function(){

                  var toast = $mdToast.simple()
                          .textContent('Oops.. something went wrong!')
                          .position("bottom left")

                  $mdToast.show(toast);

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