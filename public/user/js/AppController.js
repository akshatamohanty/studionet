angular.module('studionet')
.controller('AppController', ['$scope', 'profile', '$stateParams', '$rootScope', '$timeout', '$mdBottomSheet', '$mdToast', '$mdSidenav', 'tags', '$mdDialog', '$mdMedia',
                               function($scope, profile, $stateParams, $rootScope, $timeout, $mdBottomSheet, $mdToast, $mdSidenav, tags, $mdDialog, $mdMedia){

          $scope.showBench = true;

          $scope.user = {
            "name": "Akshata Mohanty",
            "level": "Junior Architect",
            "subscribed_to": [
              { "name": "assignment1", "id": 12, "type" : "tagspace" },
              { "name": "rhino", "id": 22, "type" : "tag"  },
              { "name": "design_ideas", "id": 1,  "type" : "tagspace"  },
              { "name": "trivia", "id": 43,  "type" : "tag"  }
            ]
          }//profile.user;
          $scope.location = $stateParams.tags;

          $scope.isTagSpace = false;

          if($scope.location == null)
            console.log("welcome to your homepage");
          else{
            $scope.isTagSpace = true;
          }


          $scope.searchedTags = [];

          // think about how to get this right?
          $scope.popularTags = [
          	{ name: ["fall-17", "ar2311", "assignment1"], subscribers: 120, post_count: 200 },
          	{ name: ["archicad"], subscribers: 243, post_count: 2 },
          	{ name: ["archicon", "rhino"], subscribers: 34, post_count: 12 }
          ]

          // think about how to get this right?
          $scope.timedTags = [
          	{ name: ["fall-17", "ar2311", "assignment1"], expire_time: 123, post_count: 200 },
          	{ name: ["ar2321", "assignment4"], expire_time: 243, post_count: 2 },
          ]

          // use this to animate properly
          $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
          //assign the "from" parameter to something
          if(toParams.tags == null)		   
           	setTimeout(function(){
           		$scope.home = true;
           		$scope.$apply();
           	}, 1000)
            else{
                $scope.searchedTags = $scope.location.split("+");
            }
          });
          $scope.home = true;

          $scope.toggleLeft = buildToggler('left');
          $scope.toggleRight = buildToggler('right');

          function buildToggler(componentId) {
          return function() {
            $mdSidenav(componentId).toggle();
          };
          }

          $scope.imagePath = 'img/washedout.png';

          $scope.items = ["popularity", "likes", "bookmarks", "date", "links"];
          $scope.selectedItem = $scope.items[0];
          $scope.getSelectedText = function() {
          if ($scope.selectedItem !== undefined) {
            return "You have selected: Item " + $scope.selectedItem;
          } else {
            return "Please select an item";
          }
          };

          $scope.vegetables = {

          }

          $scope.customFullscreen = true;
          $scope.showAdvanced = function(ev) {
              $mdDialog.show({
                controller: DialogController,
                templateUrl: '../user/templates/dialog1.tmpl.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
              })
              .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
              }, function() {
                $scope.status = 'You cancelled the dialog.';
              });
          };

          $scope.showProfile = function(ev) {
              $mdDialog.show({
                controller: DialogController,
                templateUrl: '../user/templates/profile.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
              })
              .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
              }, function() {
                $scope.status = 'You cancelled the dialog.';
              });
            };

          $scope.showNewNode = function(ev) {
              $mdDialog.show({
                controller: DialogController,
                templateUrl: '../user/templates/newnode.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true,
                fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
              })
              .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
              }, function() {
                $scope.status = 'You cancelled the dialog.';
              });
            };

          function DialogController($scope, $mdDialog) {
            $scope.hide = function() {
              $mdDialog.hide();
            };

            $scope.cancel = function() {
              $mdDialog.cancel();
            };

            $scope.answer = function(answer) {
              $mdDialog.hide(answer);
            };
          }


}]);


(function () {
  'use strict';
  angular
      .module('studionet')
      .controller('DemoCtrl', DemoCtrl);

  function DemoCtrl ($timeout, $q, $log) {
    var self = this;

    self.simulateQuery = false;
    self.isDisabled    = false;

    // list of `state` value/display objects
    self.states        = loadAll();
    self.querySearch   = querySearch;
    self.selectedItemChange = selectedItemChange;
    self.searchTextChange   = searchTextChange;

    self.newState = newState;

    function newState(state) {
      alert("Sorry! You'll need to create a Constitution for " + state + " first!");
    }

    // ******************************
    // Internal methods
    // ******************************

    /**
     * Search for states... use $timeout to simulate
     * remote dataservice call.
     */
    function querySearch (query) {
      var results = query ? self.states.filter( createFilterFor(query) ) : self.states,
          deferred;
      if (self.simulateQuery) {
        deferred = $q.defer();
        $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
        return deferred.promise;
      } else {
        return results;
      }
    }

    function searchTextChange(text) {
      $log.info('Text changed to ' + text);
    }

    function selectedItemChange(item) {
      $log.info('Item changed to ' + JSON.stringify(item));
    }

    /**
     * Build `states` list of key/value pairs
     */
    function loadAll() {
      var allStates = 'Alabama, Alaska, Arizona, Arkansas, California, Colorado, Connecticut, Delaware,\
              Florida, Georgia, Hawaii, Idaho, Illinois, Indiana, Iowa, Kansas, Kentucky, Louisiana,\
              Maine, Maryland, Massachusetts, Michigan, Minnesota, Mississippi, Missouri, Montana,\
              Nebraska, Nevada, New Hampshire, New Jersey, New Mexico, New York, North Carolina,\
              North Dakota, Ohio, Oklahoma, Oregon, Pennsylvania, Rhode Island, South Carolina,\
              South Dakota, Tennessee, Texas, Utah, Vermont, Virginia, Washington, West Virginia,\
              Wisconsin, Wyoming';

      return allStates.split(/, +/g).map( function (state) {
        return {
          value: state.toLowerCase(),
          display: state
        };
      });
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(state) {
        return (state.value.indexOf(lowercaseQuery) === 0);
      };

    }
  }
})();