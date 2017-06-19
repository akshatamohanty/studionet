angular.module('studionet')
.controller('AppController', ['$scope', 'profile', '$stateParams',
                               function($scope, profile, $stateParams){

         $scope.user = profile.user;

         console.log(profile, $stateParams);
         

}]);