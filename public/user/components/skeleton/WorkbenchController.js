
// Custom filter
app.filter('level', [function() {
    return function(level) {
        if(level == undefined)
          return "Newbie";
    };
}])



// Controls for the new node button
angular.module('studionet')
  .controller('WorkbenchCtrl', function($mdDialog, $timeout, profile, spaces, $mdToast) {

        var self = this;

        self.my_nodes = true;
        self.show = undefined; // fork that is open

        self.toggleMyNodes = function(){
          self.my_nodes = !self.my_nodes;
        }

        self.isRecent = function(node){
          var date = new Date(node.created_on);
          var now = new Date();

          var diff = ((now.getTime() - date.getTime())/1000)/60; // number of minutes

          if( diff < 0.5)
            return true; 
          else 
            return false;
        }

        self.openFork = function(fork_id){
          if(fork_id == self.show)
            self.show = undefined;
          else
            self.show = fork_id;
        }

        self.editProfile = function(){
                  
                  var confirm = {
                     parent: angular.element(document.body),
                     template:
                           '<md-dialog aria-label="new tag dialog">' +
                           '  <md-dialog-content layout="row" layout-margin style="min-width: 300px;">\
                                <div flex="50" class="profile-img-container" style="position: relative; background: url({{profilePic}}); background-size: contain;">\
                                    <a type="button" ngf-select="uplodateFiles($files)" ngf-multiple="false" style="width:100%; height: 100%;">\
                                    <div style="position: absolute; top: 10px; right: 10px;"><ng-md-icon icon="mode_edit" size="15" style="fill: #341BED"></ng-md-icon></div>\
                                    </a>\
                                </div> ' +
                                '<md-input-container flex="50" style="margin-top: 30px;">\
                                      <label>Enter a nickname</label>\
                                      <input type="text" ng-model="nick" name="nickname" ng-pattern="/^[a-zA-Z0-9]*$/" ng-trim="false">\
                                </md-input-container>' +
                           '  </md-dialog-content>' +
                             '<md-dialog-actions>' +
                               '   <md-button ng-click="updateProfile()" aria-label="description" md-no-ink="true" md-ripple-size="auto">\
                                      Save</md-button>' +
                               '    <md-button ng-click="closeDialog()" class="md-primary">' +
                               '      Cancel' +
                               '    </md-button>' +
                             '</md-dialog-actions>' +
                           '</md-dialog>',
                      controller: DialogController
                  }

                  function DialogController($scope, $mdDialog) {
                      $scope.user = profile.user;
                      $scope.nick = profile.user.nickname;
                      $scope.profilePic = profile.user.avatar;
                      $scope.profileChanged = false;

                      var profilePicFile = undefined;

                      $scope.uplodateFiles = function(profile_picture){
                          profilePicFile = profile_picture[0];
                          $scope.profilePic = profilePicFile;

                          var reader  = new FileReader();

                          if(profilePicFile)
                            reader.readAsDataURL(profilePicFile);

                          reader.addEventListener("load", function () {
                            $scope.profilePic = reader.result;
                            $scope.profileChanged = true;
                          }, false);

                      }

                      $scope.closeDialog = function(data) {
                          $mdDialog.hide();
                      }

                      $scope.updateProfile = function(){

                          // check if profile changed
                          if($scope.profileChanged == true ){
                            profile.changePicture(profilePicFile).success(function(){

                               var toast = $mdToast.simple()
                                        .textContent('Your profile was successfully updated')
                                        .position("bottom left")

                                  $mdToast.show(toast);

                                  profile.getUser();

                            });
                          }
                          else{
                            console.log("Avatar unchanged");
                          }

                          // check if name changed
                          if($scope.nick == profile.user.nickname){
                            console.log("Same nickname - no need to update");
                          }
                          else{
                            profile.changeName( {'id' : $scope.user.id, 'nickname': $scope.nick } ).then(function(){
                                  var toast = $mdToast.simple()
                                        .textContent('Your profile was successfully updated')
                                        .position("bottom left")

                                  $mdToast.show(toast);

                            }, function(){
                                  var toast = $mdToast.simple()
                                        .textContent('Oops.. an error occurred while updating')
                                        .position("bottom left")

                                  $mdToast.show(toast);
                            });
                          }

                          $scope.closeDialog();

                          

                      }
                  }

                  $mdDialog.show(confirm);

        }


        self.deleteFork = function(space_id){
                    
            var confirm = $mdDialog.confirm()
              .title('Delete your folder?')
              .textContent('You will lose your collection of these awesome posts!')
              .ok('Delete')
              .cancel('Get me out of here!');

            $mdDialog.show(confirm).then(function(result) {

                spaces.deleteFork(space_id).success(function(){
                    var toast = $mdToast.simple()
                          .textContent('Successfully deleted your folder')
                          .position("bottom left")

                    $mdToast.show(toast);
                }); 


            }, function(error){

                // display error
            
            }); 

        }

        self.addNodeToFork = function(item, space){

            var _tags = spaces.getSpaceById(space.id).tags;

            profile.tagContribution(item.id, _tags)
                    .success(function(data){

                        // add the contribution to the users fork
                        spaces.addToFork(space.id, item.id).then(function(){
                            
                            // if item isn't in the time frame, show failure alert
                            var toast = $mdToast.simple()
                                  .textContent('Successfully added to your folder')
                                  .position("bottom left")

                            $mdToast.show(toast);

                        }, function(){

                              var toast = $mdToast.simple()
                                    .textContent('Hmm.... Something went wrong')
                                    .position("bottom left")

                              $mdToast.show(toast);
                        });
                    })
                    .error(function(){

                        var toast = $mdToast.simple()
                              .textContent('Hmm.... Something went wrong')
                              .position("bottom left")

                        $mdToast.show(toast);
                    
                    }) 

        }

        self.getTimeTillExpiry = function(fork){

            var time = fork.timed;

            var now = new Date();
            var daysLeft = Math.round( (time[1] - now.getTime())/86400000, 0 ); 
            fork.daysLeft = daysLeft;

            if(daysLeft < 0){
              fork.priority = 4; 
              return { msg: "The deadline for this space has passed", status: 'inactive'};
            }
            else if(daysLeft < 5){
              var msg = "";
              if(daysLeft < 1){
                fork.priority = 1; 
                msg = "Expires today!";
              }
              else if (daysLeft == 1){
                fork.priority = 1; 
                msg = "Expires in 1 day";
              }
              else{
                fork.priority = 2; 
                msg = "Expires in "  + daysLeft + " days";
              }

              return { msg: msg , status: 'warn'}
            }
            else {
              fork.priority = 3; 
              return { msg: "Expires in " + daysLeft + " days" , status: 'ok'}
            }

        }

  });



