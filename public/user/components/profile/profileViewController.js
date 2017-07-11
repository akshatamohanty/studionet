angular.module('studionet')

.controller('profileViewController', function($q, $scope) {

  $scope.curVal= 0;

  $scope.maxVal = 100;

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