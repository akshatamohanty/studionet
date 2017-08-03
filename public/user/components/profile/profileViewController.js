angular.module('studionet')
.controller('profileViewController', function($q, $scope, $interval, profile) {

  $scope.user = profile.user;
  $scope.user.role = 1;

  $scope.curVal= 0;

  $scope.maxVal = 100;

  $scope.levels = [ 
            { name: "NOVICE", id: 1}, { name: "COFFEE BOY", id: 2},  { name: "ARCHI INTERN", id: 3},  { name: "JR. ARCHITECT", id: 4},
            { name: "ARCHITECT", id: 5}, { name: "LEAD ARCHITECT", id: 6}      ];

    $scope.Badge = [
              {"Name" : "Badge1"},
        ];

    $scope.data = [
          {text: "Lorem", weight: 15, link: "https://google.com"},
          {text: "Ipsum", weight: 9},
          {text: "Dolor", weight: 6},
          {text: "Sit", weight: 7},
          {text: "Amet", weight: 5}

      ];



})
.directive('progressBar', [function () {

    return {
      restrict: 'E',
      scope: {
        curVal: '@',
        maxVal: '@'
      },
      template: "<div class='progress-bar'>"+
                  "<div class='progress-bar-bar'></div>"+
                "</div>",

      link: function ($scope, element, attrs) {

        function updateProgress() {
          var progress = 0;

          if ($scope.maxVal) {
            progress = Math.min($scope.curVal, $scope.maxVal) / $scope.maxVal * element.find('.progress-bar').width();
          }

          element.find('.progress-bar-bar').css('width', progress);
        }

        $scope.$watch('curVal', updateProgress);
        $scope.$watch('maxVal', updateProgress);
      }
    };
 }]);