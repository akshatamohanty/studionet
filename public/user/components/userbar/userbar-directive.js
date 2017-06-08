angular.module('studionet')
.controller('shelfController', ['$scope', 'profile', function($scope, profile) {
 
  $scope.user = undefined;
  $scope.posts = undefined;

  function updateUserProfile(){
    $scope.user = profile.user;
    $scope.posts = $scope.user.contributions;

    $scope.folders = [ 'mine', '#tag1', '#tag2', '#tag3' ];

    // change the width of the post container based on how many posts
    $('#post-container').css('width', $scope.posts.length*120 + 'px');
    
  }

  profile.registerObserverCallback(updateUserProfile);
  updateUserProfile();

  $('.timeline').on('mousewheel DOMMouseScroll', function(event){
        var delta = Math.max(-1, Math.min(1, (event.originalEvent.wheelDelta || -event.originalEvent.detail)));
        $(this).scrollLeft( $(this).scrollLeft() - ( delta * 40 ) );
        event.preventDefault();
  });

  $scope.goToNode = function(id){
    alert("going to node " + id);
  }

  $scope.addNode = function(){
    alert("creating new node");
  }

}])
.directive('userBar', function() {
  return {
    restrict: 'E',
    transclude: true,
    scope: {},
    templateUrl: './components/userbar/userbar.html'
  };
});