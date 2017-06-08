var app = angular.module('studionet', ['ngAnimate', 'ngSanitize','ui.router','ui.bootstrap', 'nvd3',
										'ngTagsInput', 'ngFileUpload', 'angularModalService', 'multiselect-searchtree', 
										'angular-ranger','textAngular', 'angularMoment', 'mentio', 'ui.tree']);

// angular routing
app.config(['$stateProvider', '$urlRouterProvider', 'tagsInputConfigProvider', function($stateProvider, $urlRouterProvider, tagsInputConfigProvider){

	// user 'routes'
	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/user/templates/dashboard.html',
			resolve: {
				userProfile: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
				}]
			}
		})
		.state('tag', {
			url: '/tag/:tags',
			templateUrl: '/user/templates/space.html',
			params: {
		        tags: null
		    },
		    resolve: {
				userProfile: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
				}]
			}
		})

	$urlRouterProvider.otherwise('/home');

}]);


// textAngular toolbar customisation
app.config(function($provide) {
    $provide.decorator('taOptions', ['$delegate', function(taOptions) {
    	taOptions.toolbar = [
      	['clear', 'h1', 'h2', 'h3', 'p', 'ul', 'ol',
      	'justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent', 'html','insertLink', 'insertVideo']];
  		return taOptions;
    }]);
});

app.config(function(treeConfig) {
  treeConfig.defaultCollapsed = true; // collapse nodes by default
});

