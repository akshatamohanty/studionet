/*
 * This is the angular app bootstrapping file with the configurations, settings and routings.
 *
 */

var app = angular.module('studionet', ['ngMaterial', 'ngAnimate', 'ngSanitize','ui.router',
										'ngTagsInput', 'ngFileUpload', 'angularModalService', 'multiselect-searchtree',
										'angular-ranger','textAngular', 'angularMoment', 'mentio', 'ui.tree', 'ngMdIcons', 'dndLists' , 'ngTagCloud']);

// angular routing
app.config(['$stateProvider', '$urlRouterProvider', 'tagsInputConfigProvider', function($stateProvider, $urlRouterProvider, tagsInputConfigProvider){

	//
	//	Home State - Abstract State
	//	Contains the App Skeleton with the top navigation bar and the sidebar (workbench)
	//	Needs to resolve the user identity and properties before loading
	//
	$stateProvider
		.state('home', {
			abstract: true,
			url: '/',
			templateUrl: '/user/components/skeleton/skeleton.html',
			controller: 'SkeletonController',
		    resolve: {
				spProfile: ['supernode', function(supernode){
					return supernode.getSupernodes();
				}],
				profilePromise: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
				}],								//TODO: Resolve system data and user specific call-to-actions
		    	postsPromise: ['contributions', function(contributions){
					return contributions.getAll();
				}],
				spacesPromise: ['spaces', function(spaces){
					return spaces.getAll();
				}],
				tagsPromise: ['tags', function(tags){
					return tags.getAll();
				}],
				usersPromise: ['users', function(users){
					return users.getAll();
				}]
			}
		})
		//
		//	Homepage - Nested  (http://studionet.nus.edu.sg/user/#/home)
		//	Nested in the Skeleton, contains shortcuts and call-to-actions for the user
		//	Needs to resolve the additional user and system data before loading (like latest posts, mentions etc)
		//	Check if any notifications for the user and navigate to notifications page, if yes
		//
		.state('home.homepage', {
			cache: false,
			url: 'home',
			templateUrl: '/user/components/homepage/homepage.html',
			controller: 'HomepageController'
		})
		//
		//	Notifications - Popup  (http://studionet.nus.edu.sg/user/#/home/notifications)
		//	Type: Popup
		//	Resolve any notifications for the user
		//
		.state('home.notifications', {
			url: 'notifications',
			templateUrl: '/user/components/notifications/notifications.html',
			controller: 'NotificationsController'
		})
		//	Homepage - Search  (http://studionet.nus.edu.sg/user/#/search/:usertags)
		//	Nested in the Skeleton, this route gets activated when the user presses the search button and is in process of typing a query
		//	Needs to resolve the tag spaces and any additional data required to guide the user to a query
		//
		/*.state('home.search', {
			url: 'search',
			templateUrl: '/user/components/search/search-mode.html',
			controller: 'SearchModeController'/*,
		})*/
		//	Homepage - Search (http://studionet.nus.edu.sg/user/#/search?tags=["helloworld"])
		//	Nested in the Skeleton, this route gets activated when the user presses the search button and is in process of typing a query
		//	Needs to resolve the tag spaces and any additional data required to guide the user to a query
		//
		.state('home.search-results', {
			cache: false,
			url: 'space?tags&dates',
			templateUrl: '/user/components/search/search-results.html',
			params: {
		        tags: null,
		        dates: null,
		        users: null
		    },
			controller: 'SearchResultsController',
			resolve: {
				location: ['spaces', '$stateParams', 'tagsPromise', function(spaces, $stateParams, tagsPromise){
					// get information about the space based on the route params
					return spaces.getSpace($stateParams);  
				}],
				search_results: ['spaces', '$stateParams', function(spaces, $stateParams){
					// get search results for the space
					return spaces.getResults($stateParams);
				}]
			}
		})
		//	New Note - Note (http://studionet.nus.edu.sg/user/#/note)
		//	This state is when the user is creating a new note
		//
		.state('home.node', {
			url: 'new',
			templateUrl: '/user/components/nodes/newnode.html',
			controller: 'NewNodeController',
			params:{
				type: "note",
				tags: [],
				ref: null
			}
			/*resolve: {
				userProfile: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
				}]
			}*/
		})

		//	Note Details - Note (http://studionet.nus.edu.sg/user/#/note/:id)
		//	This state is when the user is viewing a note with a given ID.
		//	The state should resolve the contents of the note, the children and the parents of the note.
		//	The controller should allow for navigating to the next or the previous note based on the users' clicks without jumps. The location in the URL should change automatically.
		//	If the user chooses to reply, the view should navigate to home.note, while preserving the back/forward states for easy navigation. After saving the user, should navigate back to the original note.
		//
		.state('home.node-details', {
			cache: false,
			url: 'node/:address',
			templateUrl: '/user/components/nodes/view.html',
			controller: 'NodeController',
			resolve: {
				postDetails: ['contributions', '$stateParams', function(contributions, $stateParams){
					return contributions.getContribution($stateParams.address);
				}]
			}
		})
		
		.state('home.edit', {
			url: 'node/:address/edit',
			templateUrl: '/user/components/nodes/newnode.html',
			controller: 'NewNodeController',
			params:{
				address: null,
				data: null
			}
		})

		//	Profile - Abstract state
		.state('home.profile', {
			url: 'profile',
			templateUrl: "/user/components/profile/profile.html",
			controller: 'profileViewController'
		})

		/*.state('home.profile-edit', {
			url: 'profile/edit',
			template: "/user/components/profile/profile.html",
			controller: 'profileViewController'
		})*/
		//	Profile Details - Note (http://studionet.nus.edu.sg/user/#/profile/:user_id)
		//	Displays all the user information, badges, posts of a particular user
		//	Should resolve profile details before loading
		//
		.state('home.profile-details', {
			cache: false,
			url: 'profile/:address',
			templateUrl: '/user/components/profile/profile.html',
			controller: 'profileViewController',
			resolve: {
				userProfile: ['users', '$stateParams', function(users, $stateParams){
					return users.getUser($stateParams);
				}]
			}
		})

		.state('home.progress', {
           url: 'profile/:address/progress',
           templateUrl: "/user/components/profile/progressbatch.html",
           controller: 'BadgeprogressController'
      	})

      	.state('home.history', {
           url: 'profile/:address/history',
           templateUrl: "/user/components/profile/history.html",
           controller: 'HistoryController'
      	})


		.state('home.leaderboard', {
			url: 'leaderboard',
			template: "displays a leaderboard for users"
		})

	$urlRouterProvider.otherwise('home');

}]);

// Configuration options for Angular Material and Plugins
app.config(['$mdThemingProvider', function($mdThemingProvider){
		

		$mdThemingProvider.theme('default').primaryPalette('studionet', {
		      'default': '400', // by default use shade 400 from the pink palette for primary intentions
		      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
		      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
		      'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
		    })
		    // If you specify less than all of the keys, it will inherit from the
		    // default shades
		    .accentPalette('studionet', {
		      'default': '200', // use shade 200 for default, and keep all other shades the same
		    });

		$mdThemingProvider.definePalette('studionet', {
		    '50': 'FFFFFF',
		    '100': 'FFFFFF',
		    '200': '727272',
		    '300': 'FFFFFF',
		    '400': '#575555',
		    '500': 'FFFFFF',
		    '600': '#E5E5E5',
		    '700': 'FFFFFF',
		    '800': 'FFFFFF',
		    '900': '#444242',
		    'A100': '7A7A7A',
		    'A200': 'FFFFFF',
		    'A400': 'FFFFFF',
		    'A700': 'FFFFFF',
		    'contrastDefaultColor': 'dark',    // whether, by default, text (contrast)
		                                        // on this palette should be dark or light

		    'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
		     '200', '300', '400', 'A100'],
		    'contrastLightColors': undefined    // could also specify this if default was 'dark'
		  });



	}])
	.config(function($provide) {
	    $provide.decorator('taOptions', ['$delegate', function(taOptions) {
	    	taOptions.toolbar = [
	      	['clear', 'h1', 'h2', 'h3', 'p', 'ul', 'ol',
	      	'justifyLeft', 'justifyCenter', 'justifyRight', 'indent', 'outdent', 'html','insertLink', 'insertVideo']];
	  		return taOptions;
	    }]);
	})
	.config(function(treeConfig) {
  		treeConfig.defaultCollapsed = true; // collapse nodes by default
	});

// Custom filter
app.filter('removeSpaces', [function() {
    return function(string) {
        if (!angular.isString(string)) {
            return string;
        }
        return string.replace(/[\s]/g, '');
    };
}])

// Custom filter
app.filter('shorten', [function() {
    return function(string) {
        if (!angular.isString(string)) {
            return string;
        }

        if(string.length < 10)
        	return string;
        else
        	return string.substr(0, 7) + "..."
    };
}])


// back button directive
app.directive('backButton', function() {
  return {
    template: 	"<a onclick='history.back()'>\
			        <u>Back</u>\
			    </a>"
  };
});

