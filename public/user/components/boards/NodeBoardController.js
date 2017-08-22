angular.module('studionet')

.controller('NodeBoardController', ['$scope',  '$filter', 'GraphService', 'users', function($scope, $filter, GraphService, users){

	$scope.sortType     = 'dateCreated'; // set the default sort type
	$scope.sortReverse  = true;  // set the default sort order
	$scope.searchContribution   = '';     // set the default search/filter term

	$scope.contributions = []; 

	$scope.users = users.usersHash;

	// Observe the Graph Service for Changes and register observer
	var updateBoard = function(){
		$scope.contributions = []; 

		GraphService.graph.nodes().map(function(node){

			var d = node.data();
			d.auth = $scope.users[d.createdBy].nickname ? $scope.users[d.createdBy].nickname  : $scope.users[d.createdBy].name;

			$scope.contributions.push(d);
		})

	  	$scope.latest = $filter('orderBy')($scope.contributions, '-dateCreated')[0];
		$scope.highestRating = $filter('orderBy')($scope.contributions, '-totalRatings')[0];
		$scope.mostViewed = $filter('orderBy')($scope.contributions, '-views')[0];
	};
	GraphService.registerObserverCallback(updateBoard);



	//----- Pagination
	$scope.itemsPerPage = 15;
	$scope.maxSize = 5; 
	$scope.currentPage = 1; 

	// ---- graph selections
	$scope.goToNode = function(node_id){
		GraphService.selectNode(node_id, true);
	}

	$scope.processName = function(name){

		if(name && name.length > 23)
			return name.substr(0, 23) + "..."
		else 
			return name;
	}


	//  This close function doesn't need to use jQuery or bootstrap, because
	//  the button has the 'data-dismiss' attribute.
	$scope.close = function() {
	  $('body').removeClass('modal-open');
	  $('.modal-backdrop').remove();
	};

 
 function $stateDecorator($delegate, $injector, $rootScope, appSettings) {
        function decorated$State() {
            var $state = $delegate;
            $state.previous = undefined;
            $rootScope.$on("$stateChangeSuccess", function (ev, to, toParams, from, fromParams) {
                $state.previous = { route: from, routeParams: fromParams }
            });

            $rootScope.$on("$stateChangeStart", function (event, toState/*, toParams, fromState, fromParams*/) {
                var authenticationFactory = $injector.get("authenticationFactory");
                if ((toState.name === appSettings.states.login || toState.name === appSettings.states.register) && authenticationFactory.isUserLoggedIn()) {
                    event.preventDefault();
                    $state.go(appSettings.states.index);
                }
            });

            return $state;
        }

        return decorated$State();
    }

    $stateDecorator.$inject = ["$delegate", "$injector", "$rootScope", "appSettings"];

 
}]);