angular.module('studionet')

.controller('forumController', ['$scope', 'GraphService', 'users', function($scope, GraphService, users){

									$scope.list = [];
									$scope.nodeHash = [];
									$scope.usersHash = users.usersHash;

									$scope.$watch('forumActive', function(newValue, oldValue) {

										if(GraphService.graph == undefined)
											return;

										$scope.list = GraphService.forumList;

								    });






}]);
