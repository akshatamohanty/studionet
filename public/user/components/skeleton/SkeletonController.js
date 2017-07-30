angular.module('studionet')
.controller('SkeletonController', ['$scope', '$mdToast', 'profile', 'contributions', 'spaces', 'routerUtils', 'tags', '$stateParams', 'users', '$state',
                               function($scope, $mdToast, profile, contributions, spaces, routerUtils, tags, $stateParams, users, $state){

          $scope.showBench = true;
          $scope.searchActive = false;

          // to control show and hide of search bar and work bench
          $scope.$on('hideBench', function(){ if($scope.showBench == true ) $scope.showBench = false });
          $scope.$on('hideSearch', function(){ if($scope.searchActive == true) $scope.searchActive = false });
          $scope.$on('showBench', function(){ if($scope.showBench == false) $scope.showBench = true });
          $scope.$on('showSearch', function(){ if($scope.searchActive == false) $scope.searchActive = true });

          $scope.$on('clearQuery', function(){ $scope.query = {tags: [], dates: []}; $scope.showDates = false;  });

          // global references -- good practice???
          $scope.posts = contributions.contributionsHash; 
          contributions.registerObserverCallback(function(){ $scope.posts = contributions.contributionsHash;  });

          $scope.spaces = spaces.spacesHash;
          spaces.registerObserverCallback(function(){ console.log("updating spaces"); $scope.spaces = spaces.spacesHash; });

          // user profile
          $scope.user = profile.user;

          // subscribe to changes in user profile
          profile.registerObserverCallback(function(){ $scope.user = profile.user; });

          $scope.goToSpace = routerUtils.goToSpace;
          $scope.goToProfile = routerUtils.goToProfile;
          $scope.goToNode = routerUtils.goToNode;
          $scope.goToSearch = routerUtils.goToSearch;
          $scope.getSpaceURL = spaces.getSpaceURL;

          $scope.goToSpaceWithArgs = function(query){
            console.log(query);

            // send only the tag ids 
            routerUtils.goToSpaceWithArgs( query.tags.map(function(t){ return t.id }), query.dates );
          } 

          $scope.getTagString = function(id){ return tags.tagsHash[id]; };
          $scope.getUserName = function(user_id){return users.usersHash[user_id].name };
          $scope.getAvatar = function(user_id){ return users.usersHash[user_id].avatar };



          // background of the cards 
          $scope.getPostBackground = function(post){

            if(post.attachments == undefined)
              return {};

            if(post.attachments[0].id == null)
              return {};

            var path = undefined;
            for(var i=0; i < post.attachments.length; i++){
              path = routerUtils.getThumb(post.id, post.attachments[i]);
              if(path.startsWith("./img/") == false)
                break;
            }

            return {"background-image": "url(" + path + ")" };

          }


          // search functionality
          $scope.$watchCollection(function(){
              return $state.params;
          }, function(data){
              
              if(data.tags !== undefined && data.type == undefined){
                $scope.query.tags = data.tags.split(",").map(function(t){return $scope.getTagString(parseInt(t)); } ); 
                $scope.query.dates = data.dates ? data.dates.split(",").map(function(t){return parseInt(t)}) : [];
              }

          });
          
          $scope.query = {tags: [], dates: []};
          $scope.createTag = tags.createTag;


}]);

// search bar
angular.module('studionet')
      .controller('searchbarCtrl', function DemoCtrl ($timeout, $q, tags, $mdDialog, $scope) {

          var self = this;

          function init(){
            self.readonly = false;
            self.selectedItem = null;
            self.searchText = null;
            self.querySearch = querySearch;
            self.vegetables = loadVegetables();
            self.selectedVegetables = [];
            self.numberChips = [];
            self.numberChips2 = [];
            self.numberBuffer = '';
            self.autocompleteDemoRequireMatch = true;
            self.transformChip = transformChip;
            
          }

          /**
           * Return the proper object when the append is called.
           */
          function transformChip(chip) {
            // If it is an object, it's already a known chip
            if (angular.isObject(chip)) {
              return chip;
            }
            else{
              var flag = false;

              for(var i=0; i < tags.tags.length; i++){

                  var t = tags.tags[i];

                  if (t.name == chip){
                    return t;
                  }
                
              }

              var new_tag = {name: chip};
              // create a new tag
              if(flag == false){

                  var confirm = {
                     parent: angular.element(document.body),
                     template:
                           '<md-dialog aria-label="new tag dialog" style="height: 200px; width: 350px;">' +
                           '  <md-dialog-content style="padding: 30px;">\
                                <md-input-container style="margin: 0 auto; width: 100%;">\
                                  <form name="myForm" ng-submit="createTag(myForm.new_tag.$modelValue)">\
                                    <label>Create a new tag..</label>\
                                    <input type="text" ng-model="new_tag" name="new_tag" ng-pattern="/^[a-zA-Z0-9]*$/" ng-trim="false" required>\
                                      <span ng-show="myForm.new_tag.$error.pattern">Spaces and special characters are not allowed in tags</span>\
                                  </form>    \
                                </md-input-container>' +
                           '  </md-dialog-content>' +
                           '  <md-dialog-actions>' +
                           '   <md-button type="submit" value="submit" ng-click="createTag(myForm.new_tag.$modelValue)" ng-disabled="newtag.length==0 || myForm.new_tag.$error.pattern" aria-label="description" md-no-ink="true" md-ripple-size="auto">\
                                  Create</md-button>' +
                           '    <md-button ng-click="closeDialog()" class="md-primary">' +
                           '      Cancel' +
                           '    </md-button>' +
                           '  </md-dialog-actions>' +
                           '</md-dialog>',
                      controller: DialogController
                  }

                  function DialogController($scope, $mdDialog, tags) {
                    $scope.new_tag = new_tag.name;
                    $scope.closeDialog = function() {
                      $mdDialog.hide();
                    }
                    $scope.createTag = function(input){
                      tags.createTag(input).success(function(data){
                          new_tag = data[0];
                          $scope.closeDialog(data[0]);
                      })

                    }
                  }

                  $mdDialog.show(confirm).then(function(){
                        $scope.query.tags.pop();
                        $scope.query.tags.push(new_tag);
                  });

              }

              return new_tag;

            }

          }

          /**
           * Search for vegetables.
           */
          function querySearch (query) {
            var results = query ? self.vegetables.filter(createFilterFor(query)) : [];
            return results;
          }

          /**
           * Create filter function for a query string
           */
          function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(vegetable) {
              return (vegetable._lowername.indexOf(lowercaseQuery) === 0);
            };

          }

          function loadVegetables() {

            var veggies = tags.tags;

            return veggies.map(function (veg) {
              veg._lowername = veg.name.toLowerCase();
              return veg;
            });
          }

          init();
          tags.registerObserverCallback(function(){ init(); } );


});


// Controls for the new node button
angular.module('studionet')
  .controller('WorkbenchCtrl', function($scope, $mdDialog, $timeout, profile, spaces, $mdToast) {
    
    var self = this;

    self.hidden = false;
    self.isOpen = false;
    self.hover = false;

    // On opening, add a delayed property which shows tooltips after the speed dial has opened
    // so that they have the proper position; if closing, immediately hide the tooltips
    $scope.$watch('bench.isOpen', function(isOpen) {
      if (isOpen) {
        $timeout(function() {
          $scope.tooltipVisible = self.isOpen;
        }, 600);
      } else {
        $scope.tooltipVisible = self.isOpen;
      }
    });

    self.items = [
      { name: "note", icon: "note", direction: "bottom" },
      { name: "question", icon: "comment", direction: "top" },
      { name: "assignment", icon: "assignment", direction: "bottom" }
    ];

    self.openDialog = function($event, item) {
      // Show the dialog
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: function($mdDialog) {
          // Save the clicked item
          this.item = item;

          // Setup some handlers
          this.close = function() {
            $mdDialog.cancel();
          };
          this.submit = function() {
            $mdDialog.hide();
          };
        },
        controllerAs: 'dialog',
        templateUrl: 'dialog.html',
        targetEvent: $event
      });
    };

    $scope.deleteFork = function(space_id){
                
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

    $scope.addNodeToFork = function(item, space){

        var _tags = $scope.spaces[space.id].tags;
        var spaceId = $scope.spaces[space.id].id;

        profile.tagContribution(item.id, _tags)
                .success(function(data){

                    // add the contribution to the users fork
                    spaces.addToFork(spaceId, item.id).then(function(){
                        
                        // if item isn't in the time frame, show failure alert
                        var toast = $mdToast.simple()
                              .textContent('Successfully added to your fork')
                              .position("bottom right")

                        $mdToast.show(toast);

                    }, function(){

                          var toast = $mdToast.simple()
                                .textContent('Hmm.... Something went wrong')
                                .position("bottom right")

                          $mdToast.show(toast);
                    });
                })
                .error(function(){

                    var toast = $mdToast.simple()
                          .textContent('Hmm.... Something went wrong')
                          .position("bottom right")

                    $mdToast.show(toast);
                
                }) 

    }


    // keep the bench scrolling down with the scroll
    /*$(window).scroll(function(){
      console.log("hello world");
      $("#workbench-container").css({"margin-top": ($(window).scrollTop()) + "px", "margin-left":($(window).scrollLeft()) + "px"});
    });*/

  });

// Custom filter
app.filter('level', [function() {
    return function(level) {
        if(level == undefined)
          return "Newbie";
    };
}])
