angular.module('studionet')
.controller('SkeletonController', ['$scope', 'profile', '$stateParams', '$rootScope', '$timeout', '$mdBottomSheet', '$mdToast', '$mdSidenav', 'tags', '$mdDialog', '$mdMedia',
                               function($scope, profile, $stateParams, $rootScope, $timeout, $mdBottomSheet, $mdToast, $mdSidenav, tags, $mdDialog, $mdMedia){

          if($mdMedia("gt-sm"))
            $scope.showBench = true;
          else
            $scope.showBench = false;
          
          $scope.showInfo = true;

          $scope.user = {
            "name": "Akshata Mohanty",
            "level": "Junior Architect",
            "subscribed_to": [2, 5]
          }//profile.user;

          $scope.tagSpaces = [
            { id: 1, tags: [1, 2, 3], people: [], time: [] },
            { id: 2, tags: [3, 4, 5], people: [], time: [new Date(), new Date() + 10] },
            { id: 3, tags: [3, 1], people: [], time: [] },
            { id: 4, tags: [2, 6], people: [], time: [] },
            { id: 5, tags: [3, 0], people: [], time: [] },
          ]


          $scope.location = $stateParams.tags;

          $scope.usersOnline = [
              {"name" : "John", "profile": "http://placehold.it/150x150" },
              {"name" : "Jane", "profile": "http://placehold.it/150x150" },
              {"name" : "Ivan", "profile": "http://placehold.it/150x150" },
              {"name" : "Laura", "profile": "http://placehold.it/150x150" },
              {"name" : "Shi", "profile": "http://placehold.it/150x150" },
              {"name" : "Petunia", "profile": "http://placehold.it/150x150" },
              {"name" : "Heidi", "profile": "http://placehold.it/150x150" }
          ]

          $scope.recentPosts = [
              {"title" : "Something", "img": "http://placehold.it/150x150" },
              {"title" : "Something", "img": "http://placehold.it/150x150" },
              {"title" : "Something", "img": "http://placehold.it/150x150" },
              {"title" : "Something", "img": "http://placehold.it/150x150" },
              {"title" : "Something", "img": "http://placehold.it/150x150" },
              {"title" : "Something", "img": "http://placehold.it/150x150" },
              {"title" : "Something", "img": "http://placehold.it/150x150" }
          ]


          $scope.isTagSpace = false;

          if($scope.location == null)
            console.log("welcome to your homepage");
          else{
            $scope.isTagSpace = true;
          }


          $scope.searchedTags = [];

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

(function() {
  'use strict';

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
        { name: "Note", icon: "img/icons/twitter.svg", direction: "bottom" },
        { name: "Question", icon: "img/icons/facebook.svg", direction: "top" },
        { name: "Assignment", icon: "img/icons/hangout.svg", direction: "bottom" }
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
})();

