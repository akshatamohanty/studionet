angular.module('studionet')
.controller('HomepageController', ['$scope', 'profile', 'spaces', 'contributions', 'tags', '$filter',
                            function($scope, profile, spaces, contributions, tags, $filter){

          $scope.$emit('showBench');
          $scope.$emit('hideSearch');

          $scope.$emit('clearQuery');

          $scope.tags = tags.tagsHash;
          $scope.getPostStatus = profile.getPostStatus;
          
          // get user
          // user.follows - will give all the user subscriptions along with the personally assigned names
          // user.curates - will give all the user forks/folders along with the personally assigned names
          $scope.spaces = spaces.spacesHash;
          $scope.user = profile.user;

          function getRecent(number){
            $scope.recentPosts = contributions.getRecent(number);
          }

          $scope.getRecent = getRecent;
          contributions.registerObserverCallback(function(){ getRecent(); });


}]);
