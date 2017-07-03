angular.module('studionet')
.controller('HomepageController', ['$scope', 'profile', '$stateParams', '$rootScope', '$timeout', '$mdBottomSheet', '$mdToast', '$mdSidenav', 'tags', '$mdDialog', '$mdMedia',
                               function($scope, profile, $stateParams, $rootScope, $timeout, $mdBottomSheet, $mdToast, $mdSidenav, tags, $mdDialog, $mdMedia){

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


}]);
