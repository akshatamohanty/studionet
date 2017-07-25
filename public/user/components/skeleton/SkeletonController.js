angular.module('studionet')
.controller('SkeletonController', ['$scope', '$mdToast', 'profile', 'contributions', 'spaces', 'routerUtils', 'tags',
                               function($scope, $mdToast, profile, contributions, spaces, routerUtils, tags){

          $scope.showBench = true;
          $scope.searchActive = false;

          // to control show and hide of search bar and work bench
          $scope.$on('hideBench', function(){ $scope.showBench = false });
          $scope.$on('hideSearch', function(){ $scope.searchActive = false });
          $scope.$on('showBench', function(){ $scope.showBench = true });
          $scope.$on('showSearch', function(){ $scope.searchActive = true });

          // global references -- good practice???
          $scope.posts = contributions.contributionsHash; 
          $scope.spaces = spaces.spacesHash;

          // user profile
          $scope.user = profile.user;

          // subscribe to changes in user profile
          profile.registerObserverCallback(function(){ console.log("updating user profile"); $scope.user = profile.user; });

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

          // search functionality
          $scope.query = {tags: [], dates: []};

          $scope.createTag = tags.createTag;

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

}]);

// search bar
angular.module('studionet')
      .controller('CustomInputDemoCtrl', function DemoCtrl ($timeout, $q, tags) {

          var self = this;

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

          /**
           * Return the proper object when the append is called.
           */
          function transformChip(chip) {
            // If it is an object, it's already a known chip
            if (angular.isObject(chip)) {
              return chip;
            }

            // Otherwise, create a new one
            return { name: chip, type: 'new' }
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
});


// Controls for the new node button
angular.module('studionet')
  .controller('FabCtrl', function($scope, $mdDialog, $timeout) {
    var self = this;

    self.hidden = false;
    self.isOpen = false;
    self.hover = false;

    // On opening, add a delayed property which shows tooltips after the speed dial has opened
    // so that they have the proper position; if closing, immediately hide the tooltips
    $scope.$watch('demo.isOpen', function(isOpen) {
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
  });

