angular.module('studionet')
.controller('NewNodeController', ['$scope', '$stateParams', '$state', 'tags', 'users', 'contributions', '$mdDialog', 
                                  function($scope, $stateParams, $state, tags, users, contributions, $mdDialog){


      $scope.$emit('hideBench');
      $scope.$emit('hideSearch');

      // error handling
      if( $stateParams.type !== "note" && $stateParams.type !== "question" && $stateParams.type !== "assignment" && $stateParams.data == null){
        //todo: show an error message
        $state.go('home.homepage');
      }
      else{
  
        $scope.getTagName = tags.getTagName;

        $scope.ref = $stateParams.ref;

        if( $stateParams.data == null ){

            $scope.editMode = false;

            // for the new contribution
            $scope.contributionData = { 
                                        attachments: [], 
                                        tags: $stateParams.tags.length > 0 ? $stateParams.tags : [],
                                        refType: "RELATED_TO", 
                                        contentType: $stateParams.type, 
                                        ref:  $stateParams.ref  ? $stateParams.ref.id : null
                                      };
        }
        else{

            $scope.editMode = true;

            $scope.contributionData = $stateParams.data;
            $scope.contributionData.contentType = $scope.contributionData.type;

            if($scope.contributionData.tags[0].id == null)
              $scope.contributionData.tags = [];
            else
              $scope.contributionData.tags = $scope.contributionData.tags.length == 0 ? [] : $scope.contributionData.tags.map(function(t){return t.tag_id;});
            
            if($scope.contributionData.attachments[0].id == null)
              $scope.contributionData.attachments = [];
            else{
              $scope.contributionData.attachments = $scope.contributionData.attachments.map(function(a){ return a.attachment; });
            }

        }


        
        // mentio
        // todo
        $scope.simplePeople = users.users.map(function(u){
          return {label: u.name};
        });

        //  This close function doesn't need to use jQuery or bootstrap, because
        //  the button has the 'data-dismiss' attribute.
        $scope.close = function() {

              // todo: show confirmation dialog
              
              // navigate to previous page
              history.back();

        };

        //Uploaded files
        $scope.uplodateFiles = function (files){
              if(files){
                    files.forEach(function(file){
                          $scope.contributionData.attachments.push(file);
                    });
              }   
        }

        //remove files
        $scope.removeFiles = function (attachment) {

              var inlineImagePattern = new RegExp('src="studionet-inline-img-', "g");
              var predictedImagePath = 'src="../api/contributions/' + $scope.contributionData.id + '/attachments?name=' + attachment.name;
              if($scope.contributionData.body.indexOf(predictedImagePath) > -1){
                // todo: show alert
                return;
              }

              var index = $scope.contributionData.attachments.indexOf(attachment);
              if(index > -1){
                    $scope.contributionData.attachments.splice(index, 1);
              }

        }

        $scope.createContribution = function(){

            contributions.createContribution( $scope.contributionData ).then(function(res){

                var msg = 'Yay! You just created a new post!';

                if($scope.contributionData.tags.length > 0 && $scope.getTagName($scope.contributionData.tags[0])!=""){
                  msg = 'Yay! You just created a new post tagged with ' + $scope.contributionData.tags.map(function(t){  return $scope.getTagName(t); }).join(", ");
                }
                  
                // display success message
                // navigate after 3 seconds
                $mdDialog.show(
                  $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#new_node')))
                    .clickOutsideToClose(false)
                    .title('Success!')
                    .textContent(msg)
                    .ariaLabel('Successful Post')
                    .ok('Got it!')
                    //.targetEvent(ev)
                );

                history.back();

            }, function(error){

                // display error
            
            }); 

        };

        $scope.editContribution = function(){

              contributions.updateContribution( $scope.contributionData ).then(function(res){

                  var msg = 'Yay! You updated your post!';

                  // display success message
                  // navigate after 3 seconds
                  $mdDialog.show(
                    $mdDialog.alert()
                      .parent(angular.element(document.querySelector('#new_node')))
                      .clickOutsideToClose(false)
                      .title('Success!')
                      .textContent(msg)
                      .ariaLabel('Successful Post')
                      .ok('Got it!')
                      //.targetEvent(ev)
                  );

                  history.back();

              }, function(error){

                  // display error
              
              });

        }

      }

   
}]);

