angular.module('studionet')
.controller('AppController', ['$scope', 'profile', 
                               function($scope, profile){

         $scope.user = profile.user;
         

}]);