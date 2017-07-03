angular.module('studionet')
.controller('profileController', ['$scope', 'profile', function($scope, profile) {
 
  $scope.user = undefined;
  $scope.posts = undefined;

  function updateUserProfile(){
    $scope.user = profile.user;
  }

  profile.registerObserverCallback(updateUserProfile);


}])
.directive('topBar', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope:{},
    templateUrl: './components/topbar/topbar.html'
  };
});