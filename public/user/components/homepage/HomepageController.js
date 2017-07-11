angular.module('studionet')
.controller('HomepageController', ['$scope', 'profile', 'spaces', 'contributions', 'tags',
                            function($scope, profile, spaces, contributions, tags){

          $scope.$emit('showBench');
          $scope.$emit('hideSearch');

          $scope.user = profile.user;
          $scope.spaces = spaces.spacesHash;
          $scope.tags = tags.tagsHash;

          $scope.recentPosts = [];
          var latestCount = 20;
          var postcount = contributions.contributions.length;
          for(var i=1; i <= latestCount; i++){
            $scope.recentPosts.push(contributions.contributions[postcount - i])
          }

          $scope.usersOnline = [
              {"name" : "John", "profile": "http://placehold.it/150x150" },
              {"name" : "Jane", "profile": "http://placehold.it/150x150" },
              {"name" : "Ivan", "profile": "http://placehold.it/150x150" },
              {"name" : "Laura", "profile": "http://placehold.it/150x150" },
              {"name" : "Shi", "profile": "http://placehold.it/150x150" },
              {"name" : "Petunia", "profile": "http://placehold.it/150x150" },
              {"name" : "Heidi", "profile": "http://placehold.it/150x150" }
          ];



}]);
