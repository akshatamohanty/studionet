angular.module('studionet')
.controller('SearchModeController', ['$scope', '$rootScope', function($scope, $rootScope){

	$scope.$emit('hideBench');
	$scope.$emit('showSearch');


	// TODO: Functionality to help the user write a query


}]);
