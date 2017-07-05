angular.module('studionet')
.controller('SkeletonController', ['$scope', 'profile', 'contributions', '$stateParams', '$mdToast', 'tags', '$mdDialog', '$mdMedia', '$state',
                               function($scope, profile, contributions, $stateParams, $mdToast, tags, $mdDialog, $mdMedia, $state){

          $scope.showBench = true;
          $scope.searchActive = false;

          // to control show and hide of search bar and work bench
          $scope.$on('hideBench', function(){ $scope.showBench = false });
          $scope.$on('hideSearch', function(){ $scope.searchActive = false });
          $scope.$on('showBench', function(){ $scope.showBench = true });
          $scope.$on('showSearch', function(){ $scope.searchActive = true });

          $scope.posts = contributions.contributionsHash; 

          $scope.user = profile.user;

          $scope.spaces = [];
          $scope.spaces[2] = { id: 1, name: "assignment-1_ar2521", query: "ar2521+assignments+assignment1&d=[123213, 232143]", posts: [1571, 1572, 1576, 1634, 1582] }
          $scope.spaces[5] = { id: 2, name: "design-ideas", query: "ar2521+assignments+assignment1+design-ideas", posts: [2031, 2032, 2036, 2041, 2042, 2143, 2175, 1958, 1980, 1982] }
          $scope.spaces[4] = { id: 3, name: "modeling-software", query: "rhino+grasshopper", posts: [2530, 2566] }
          $scope.spaces[21] = { id: 4, name: "ping-pong", query: "games+ping-pong+trivia", posts: [] }
          $scope.spaces[45] = { id: 5, name: "architecture", query: "design+buildings+modern", posts: [451, 469, 409, 409, 759, 759]}


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

