/*
 * This is the angular app bootstrapping file with the configurations, settings and routings.
 * 
 */

var app = angular.module('studionet', ['ngMaterial', 'ngAnimate', 'ngSanitize','ui.router',
										'ngTagsInput', 'ngFileUpload', 'angularModalService', 'multiselect-searchtree', 
										'angular-ranger','textAngular', 'angularMoment', 'mentio', 'ui.tree', 'ngMdIcons']);

// angular routing
app.config(['$stateProvider', '$urlRouterProvider', 'tagsInputConfigProvider', function($stateProvider, $urlRouterProvider, tagsInputConfigProvider){

	$stateProvider.state("Modal", {
		views:{
		  "modal": {
		    template: "<div class='Modal-backdrop'></div>\
						<div class='Modal-holder' ui-view='modal' autoscroll='false'></div>"
		  }
		},
	    onEnter: ["$state", function($state) {
	      $(document).on("keyup", function(e) {
	        if(e.keyCode == 27) {
	          $(document).off("keyup");
	          $state.go("Default");
	        }
	      });

	      $(document).on("click", ".Modal-backdrop, .Modal-holder", function() {
	        $state.go("Default");
	      });

	      $(document).on("click", ".Modal-box, .Modal-box *", function(e) {
	        e.stopPropagation();
	      });
	    }],
		abstract: true
	});

	$stateProvider.state("Modal.confirmAddToCart", {
		url: '/confirm',
	    views:{
	      "modal": {
	        template: "<div class='Modal-box'>\
  							Are you sure you want to do that?\
  							<button>Yes</button>\
						</div>"
	      }
	    }
	  });

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
				userProfile: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
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
			url: 'home',
			templateUrl: '/user/components/homepage/homepage.html',
			controller: 'HomepageController'/*,
		    resolve: {
				//TODO: Resolve system data and user specific call-to-actions
			}*/
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
		.state('home.search', {
			url: 'search',
			templateUrl: '/user/components/search/search-mode.html',
			/*controller: 'SearchmodeController',
		    resolve: {

				TODO: 
				tags: ['tags', function(tags){
					return tags.getAll();
				}]
			}*/
		})
		//	Homepage - Search (http://studionet.nus.edu.sg/user/#/search?tags=["helloworld"])
		//	Nested in the Skeleton, this route gets activated when the user presses the search button and is in process of typing a query
		//	Needs to resolve the tag spaces and any additional data required to guide the user to a query
		//	
		.state('home.search-results', {
			url: 'search/:tags',
			templateUrl: '/user/components/search/search-results.html'
			/*controller: 'AppController',
			params: {
		        tags: null
		    },
		    resolve: {
				userProfile: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
				}], 
				tags: ['tags', function(tags){
					return tags.getAll();
				}]
			}*/
		})
		//	New Note - Note (http://studionet.nus.edu.sg/user/#/note)
		//	This state is when the user is creating a new note
		//	
		.state('home.note', {
			url: 'note',
			templateUrl: '/user/components/nodes/newnode.html',
			controller: 'NewNodeController',
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
		.state('home.note-details', {
			url: 'note/:address',
			templateUrl: '/user/components/nodes/view.html',
			controller: 'NodeController'
			/*resolve: {
				userProfile: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
				}]
			}*/
		})
		//	Profile - Abstract state
		.state('home.profile', {
			url: 'profile',
			template: "your own profile"
		})
		.state('home.profile-edit', {
			url: 'profile/edit',
			template: "edit your profile here"
		})
		//	Profile Details - Note (http://studionet.nus.edu.sg/user/#/profile/:user_id)
		//	Displays all the user information, badges, posts of a particular user
		//	Should resolve profile details before loading
		//	
		.state('home.profile-details', {
			url: 'profile/:address',
			templateUrl: '/user/components/profile/profile.html',
			controller: 'ProfileController'/*,
			resolve: {
				userProfile: ['profile', function(profile){
					return profile.getUser() && profile.getActivity();
				}]
			}*/
		})
		.state('home.profile-progress', {
			url: 'profile/:address/progress',
			template: "displays your profile progress here"
		})
		.state('home.leaderboard', {
			url: 'leaderboard',
			template: "displays a popup leaderboard for users"
		})

	$urlRouterProvider.otherwise('home');

}]);


// Configuration options for Angular Material and Plugins
app.config(['$mdThemingProvider', function($mdThemingProvider){
	$mdThemingProvider.theme('default')
			.primaryPalette('blue-grey');
	}])
	.config(['$mdIconProvider', function($mdIconProvider) {
	        $mdIconProvider.icon('md-close', 'img/icons/ic_close_24px.svg', 24);
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


// Directive - remove later (only for testing)
app.directive('userAvatar', function() {
  return {
    replace: true,
    template: '<svg class="user-avatar" viewBox="0 0 128 128" height="64" width="64" pointer-events="none" display="block" > <path fill="#FF8A80" d="M0 0h128v128H0z"/> <path fill="#FFE0B2" d="M36.3 94.8c6.4 7.3 16.2 12.1 27.3 12.4 10.7-.3 20.3-4.7 26.7-11.6l.2.1c-17-13.3-12.9-23.4-8.5-28.6 1.3-1.2 2.8-2.5 4.4-3.9l13.1-11c1.5-1.2 2.6-3 2.9-5.1.6-4.4-2.5-8.4-6.9-9.1-1.5-.2-3 0-4.3.6-.3-1.3-.4-2.7-1.6-3.5-1.4-.9-2.8-1.7-4.2-2.5-7.1-3.9-14.9-6.6-23-7.9-5.4-.9-11-1.2-16.1.7-3.3 1.2-6.1 3.2-8.7 5.6-1.3 1.2-2.5 2.4-3.7 3.7l-1.8 1.9c-.3.3-.5.6-.8.8-.1.1-.2 0-.4.2.1.2.1.5.1.6-1-.3-2.1-.4-3.2-.2-4.4.6-7.5 4.7-6.9 9.1.3 2.1 1.3 3.8 2.8 5.1l11 9.3c1.8 1.5 3.3 3.8 4.6 5.7 1.5 2.3 2.8 4.9 3.5 7.6 1.7 6.8-.8 13.4-5.4 18.4-.5.6-1.1 1-1.4 1.7-.2.6-.4 1.3-.6 2-.4 1.5-.5 3.1-.3 4.6.4 3.1 1.8 6.1 4.1 8.2 3.3 3 8 4 12.4 4.5 5.2.6 10.5.7 15.7.2 4.5-.4 9.1-1.2 13-3.4 5.6-3.1 9.6-8.9 10.5-15.2M76.4 46c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6zm-25.7 0c.9 0 1.6.7 1.6 1.6 0 .9-.7 1.6-1.6 1.6-.9 0-1.6-.7-1.6-1.6-.1-.9.7-1.6 1.6-1.6z"/> <path fill="#E0F7FA" d="M105.3 106.1c-.9-1.3-1.3-1.9-1.3-1.9l-.2-.3c-.6-.9-1.2-1.7-1.9-2.4-3.2-3.5-7.3-5.4-11.4-5.7 0 0 .1 0 .1.1l-.2-.1c-6.4 6.9-16 11.3-26.7 11.6-11.2-.3-21.1-5.1-27.5-12.6-.1.2-.2.4-.2.5-3.1.9-6 2.7-8.4 5.4l-.2.2s-.5.6-1.5 1.7c-.9 1.1-2.2 2.6-3.7 4.5-3.1 3.9-7.2 9.5-11.7 16.6-.9 1.4-1.7 2.8-2.6 4.3h109.6c-3.4-7.1-6.5-12.8-8.9-16.9-1.5-2.2-2.6-3.8-3.3-5z"/> <circle fill="#444" cx="76.3" cy="47.5" r="2"/> <circle fill="#444" cx="50.7" cy="47.6" r="2"/> <path fill="#444" d="M48.1 27.4c4.5 5.9 15.5 12.1 42.4 8.4-2.2-6.9-6.8-12.6-12.6-16.4C95.1 20.9 92 10 92 10c-1.4 5.5-11.1 4.4-11.1 4.4H62.1c-1.7-.1-3.4 0-5.2.3-12.8 1.8-22.6 11.1-25.7 22.9 10.6-1.9 15.3-7.6 16.9-10.2z"/> </svg>'
  };
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