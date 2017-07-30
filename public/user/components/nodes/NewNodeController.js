angular.module('studionet')
.controller('NewNodeController', ['$scope', '$stateParams', '$state', 'supernode', 'tags', 'users', 'contributions', '$mdDialog', 
                                  function($scope, $stateParams, $state, supernode, tags, users, contributions, $mdDialog){


      $scope.$emit('hideBench');
      $scope.$emit('hideSearch');

      // error handling
      if($stateParams.type !== "note" && $stateParams.type !== "question" && $stateParams.type !== "assignment"){

        //todo: show an error message
        $state.go('home.hompage');
      }

      $scope.getTagName = function(tag_id){ return tags.tagsHash[tag_id].name };
      $scope.ref = $stateParams.ref;

      // for the new contribution
      $scope.contributionData = { 
                                  attachments: [], 
                                  tags: $stateParams.tags ? $stateParams.tags : [],
                                  refType: "RELATED_TO", 
                                  contentType: $stateParams.type, 
                                  ref:  $stateParams.ref == null ? supernode.contribution : $stateParams.ref.id
                                };

      
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
            var index = $scope.contributionData.attachments.indexOf(attachment);
            if(index > -1){
                  $scope.contributionData.attachments.splice(index, 1);
            }
      }

      $scope.createContribution = function(){

          contributions.createContribution( $scope.contributionData ).then(function(res){

              var msg = 'Yay! You just created a new post! Go to your shelf to view it.';

              if($scope.contributionData.tags.length > 0 ){
                msg = 'Yay! You just created a new post tagged with ' + $scope.contributionData.tags.join(", ");
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
   
}]);

