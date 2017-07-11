angular.module('studionet')
.controller('SkeletonController', ['$scope', 'profile', 'contributions', 'spaces', '$state',
                               function($scope, profile, contributions, spaces, $state){

          $scope.showBench = true;
          $scope.searchActive = false;

          // to control show and hide of search bar and work bench
          $scope.$on('hideBench', function(){ $scope.showBench = false });
          $scope.$on('hideSearch', function(){ $scope.searchActive = false });
          $scope.$on('showBench', function(){ $scope.showBench = true });
          $scope.$on('showSearch', function(){ $scope.searchActive = true });

          $scope.posts = contributions.contributionsHash; 
          $scope.spaces = spaces.spacesHash;

          $scope.user = profile.user;

          $scope.goTo = function(url){
            $state.go('home.search-results', { 'referer':'home.homepage', 'tags': url});
          }

          $scope.goToProfile = function(url){
            $state.go('home.profile-details', { 'referer':'home.homepage', 'address': 1});
          }

          $scope.goToNode = function(node){
            $state.go('home.node-details', { 'referer':'home.homepage', 'address': node })
          };

}]);


// Controls for the new node
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
      { name: "Note", icon: "note", direction: "bottom" },
      { name: "Question", icon: "comment", direction: "top" },
      { name: "Assignment", icon: "assignment", direction: "bottom" }
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

