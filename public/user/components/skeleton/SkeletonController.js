angular.module('studionet')
.controller('SkeletonController', ['$scope', 'profile', '$stateParams', '$rootScope', '$timeout', '$mdBottomSheet', '$mdToast', '$mdSidenav', 'tags', '$mdDialog', '$mdMedia', '$state',
                               function($scope, profile, $stateParams, $rootScope, $timeout, $mdBottomSheet, $mdToast, $mdSidenav, tags, $mdDialog, $mdMedia, $state){

          $scope.showBench = true;
          $scope.searchActive = false;

          $scope.$on('hideBench', function(){ $scope.showBench = false });
          $scope.$on('hideSearch', function(){ $scope.searchActive = false });
          $scope.$on('showBench', function(){ $scope.showBench = true });
          $scope.$on('showSearch', function(){ $scope.searchActive = true });

          $scope.user = {
            "name": profile.user.name,
            "level": "... Level ...",
            "subscribed_to": [2, 5, 4, 21, 45],
            "posts": [334, 2123, 3435, 666, 223]
          };

          $scope.spaces = [];
          $scope.spaces[2] = {  name: "assignment-1_ar2521", query: "ar2521+assignments+assignment1&d=[123213, 232143]", posts: [2, 3, 4, 1, 45] }
          $scope.spaces[5] = {  name: "design-ideas", query: "ar2521+assignments+assignment1+design-ideas", posts: [1, 2, 3, 5, 6, 21, 45, 12, 65, 87, 3, 111, 221] }
          $scope.spaces[4] = {  name: "modeling-software", query: "rhino+grasshopper", posts: [1, 2] }
          $scope.spaces[21] = {  name: "ping-pong", query: "games+ping-pong+trivia", posts: [] }
          $scope.spaces[45] = {  name: "architecture", query: "design+buildings+modern", posts: [21, 34, 45, 56, 244, 2221]}

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

