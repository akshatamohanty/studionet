// ------------- Services
angular.module('studionet')

	//-------------------- Supernodes
	// This service returns the group and contribution super node IDs
	.factory('supernode', ['$http', function($http){
		var o ={
			group: -1, 
			contribution: -1
		};

		o.getSupernodes = function(){
			return $http.get('/api/supernode').success(function(data){
				o.group = data.groupId; 
				o.contribution = data.contributionId; 
			});
		};

		return o;
	}])

	.factory('contributions', ['$http', '$filter', function($http, $filter){

		var o = {
			contributions: [],
			contributionsHash: []
		};

		// Fetches the array of contributions
		o.getAll = function(){
			return $http.get('/api/contributions').success(function(data){

				// remove root node
				if(data[0].dateCreated == null)
					data.shift();

				// orderby date
				var ordered = $filter('orderBy')(data, 'dateCreated');

				angular.copy(ordered, o.contributions);
				o.contributionsHash = o.contributions.hash();

			});
		};

		return o;
	}])


	// --------------- User List
	.factory('users', ['$http', function($http){

		var o = {
			users: [],
			usersHash: []
		};

		// Fetches the array of users
		// { "name":"user name","isAdmin":true,"avatar":"/assets/images/avatar.png","activityArr":[51,13,8],"id":0,"lastLoggedIn":1486715262183,"level":7.8500000000000005,"nickname":null }
		// activityArr - Viewed, Rated, Created
		o.getAll = function(){
			return $http.get('/api/users').success(function(data){

				angular.copy(data, o.users);
				o.usersHash = o.users.hash();

				// convert all names to title case
				o.people = [];
				for(var i=0; i < o.users.length; i++){
					var u = o.users[i];
					u.name = u.name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
					o.people.push({'label' : u.name});
				}

			});
		};

		// Takes in two arguments - userID anf from DB
		// Fetches details about a particular user from the database 
		// get user from the hash and trigger data request for additional info about the user from the server
		o.getUser = function(user_id, fromDB){
			
			var user = o.usersHash[user_id];

			// trigger for user data
			if(fromDB){

				var url = '/api/users/' + user_id;
				
				return $http.get(url).then(function(res){
					if(res.status == 200){
						var data = res.data;
						var user = o.usersHash[data.id];

						for(prop in data){
							if(data.hasOwnProperty(prop)){
								user[prop] = data[prop];
							}
						}		
						return res;
					}
					else{
						console.log("Error fetching user data");
					}
				});
			
			}
			else
				return user;
		}

		// ---- Sets updated user-information
		o.setUser = function(user_data){
			o.usersHash[user_data.id] = user_data;
			console.warn("set user used in services.js");
			return true;		
		}

		// ----- Creates a new user 
		// Admin Only Function
		o.createNewUser = function(user){
			return $http.post('/api/users', user).success(function(data){
				o.users.push(data);
				o.usersHash[data.id] = data;
			});
		}

		o.showProfile = function(user_id){

		}

		return o;
	}])


	// --------------- Tag List
	.factory('tags', ['$http', '$filter', function($http, $filter){

		var o = {
			tags: [], 
			tagsHash: undefined
		};

		// --------- Observers
		var observerCallbacks = [];

		// register an observer
		o.registerObserverCallback = function(callback){
		   observerCallbacks.push(callback);
		};

		// call this when you know graph has been changed
		var notifyObservers = function(){
			angular.forEach(observerCallbacks, function(callback){
		    	 callback();
		    });
		};

		// {"name":"@newgroup","id":4401,"contributionCount":0,"createdBy":8,"restricted":"true","group":4400}
		o.getAll = function(){
			return $http.get('/api/tags').success(function(data){
				angular.copy($filter('orderBy')(data, 'contributionCount', true) , o.tags);
				o.tagsHash = data.hash();
				notifyObservers();
			});
		};

		return o;
	}])


	//----------------  Groups List
	.factory('groups', ['$http', 'supernode', 'profile', function($http, supernode, profile){
		
		var o = {
			groups: [],
		};

		// --------- Observers
		var observerCallbacks = [];

		// register an observer
		o.registerObserverCallback = function(callback){
		   observerCallbacks.push(callback);
		};

		// call this when you know graph has been changed
		var notifyObservers = function(){
			angular.forEach(observerCallbacks, function(callback){
		    	 callback();
		    });
		};

		o.getAll = function(){
			return $http.get('/api/groups').success(function(data){
				angular.copy(data, o.groups);
				notifyObservers();
			});
		};

		o.getGroupActivity = function(group_id){
			return $http.get('/api/groups/' + group_id ).success(function(data){
				return data;
			});
		};

		o.createGroup = function(groupData){
			
			var params = {
			      name: groupData.name,
			      description: groupData.description,
			      restricted: false,
			      groupParentId: supernode.group
			};

			return $http.post('/api/groups', params).success(function(data){

				return $http.post('/api/groups/' + data.id + '/users', {users: groupData.users}).success(function(data){

					// todo : fix this to a socket connection
					o.getAll();

				}).error(function(err){
					console.log(err);
				});

				
			}).error(function(err) {
				console.log(err);
			});;

		};

		o.deleteGroup = function(group_id){

			return $http.delete('/api/groups/' + group_id)
				.success(function(res) {
					console.log(res);
					o.getAll();
					return;  
			    })
			    .error(function(error){
			    	//alert(error);
					throw error;
			    })
		
		}

		return o;

	}])


	.factory('spaces', ['$http', function($http){

		var o = {
			spaces : [],
			spacesHash: []
		}

		// gets all the spaces linked to user
		o.getAll = function(){

          	o.spaces = [
          				{ id: 1, name: "ar2521-assignments", time: [132321432, 123214324], tags: [407, 426], posts: [1571, 1572, 1576, 1634, 1582] },
          				{ id: 2, name: "design-ideas", time: null, tags: [4223, 1864, , 2569], posts: [2031, 2032, 2036, 2041, 2042, 2143, 2175, 1958, 1980, 1982] },
          				{ id: 3, name: "modeling-software", time: null, tags: [417, 440], posts: [2530, 2566] },
          				{ id: 4, name: "ping-pong", time: null, tags: [2303], posts: [] },
          				{ id: 5, name: "technique", time: [12312312432, 12312432412], tags: [413], posts: [451, 469, 409, 409, 759, 759]}
          			];
          	o.spacesHash = o.spaces.hash();
		}

		return o;

	}])


	//--------------------- Profile
	.factory('profile', ['$http', 'users', function($http, users){
		
		var o ={
			user: {},
			activity: [],
		};

		// ----------------- Observers of this service which re-run when this data is refreshed
		var observerCallbacks = [];

		// register an observer
		o.registerObserverCallback = function(callback){
		   observerCallbacks.push(callback);
		};

		// call this when you know 'foo' has been changed
		var notifyObservers = function(){
			angular.forEach(observerCallbacks, function(callback){
		    	 callback();
		    });
		};


		// ----------------- Refreshes User 
		// profile.user: Basic details about the user - 
		// 				canEdit, avatar, name, id, addedOn, filterNames, filters, joinedOn, lastLogged In, nickname
		// 				contributions(with id, rating, rateCount, views, title), 
		// 				groups(id, role, joinedOn)
		// 				tags, 
		// 				
		// profile.getUser() : This service refreshes the above data 
		// 
		o.getUser = function(){
			return $http.get('/api/profile/').success(function(data){
				angular.copy(data, o.user);

				// TODO: rewire
				o.user.newactivity = "You are all caught up!";
				o.user.forked = [1, 2];// tag space ids
				o.user.subscribed_to = [1, 2, 3, 4, 5]; // tag space ids
				o.user.posts = o.user.contributions;

				notifyObservers();
			});
		};


		// ----------------- Fetches all activity for the user
		// End refers to the contribution (later, link) Id 
		// [ [ {"start":8,"end":4623,"type":"CREATED","properties":{},"id":5224},{"start":8,"end":4622,"type":"CREATED","properties":{},"id":5220} ] ]
		// CREATED : 
		// VIEWED : "properties":{"lastViewed":1487044949737,"views":1}
		// RATED : "properties":{"rating":3,"lastRated":1486385685468}
		o.getActivity = function(){
			return $http.get('/api/profile/activity').success(function(data){
				angular.copy(data[0], o.activity);
			});
		};

		// Todo
		o.changeName = function(user){
		  	return $http({
				  method  : 'PUT',
				  url     : '/api/profile/',
				  data    : user,  // pass in data as strings
				  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
				 })
				.success(function(data) {
					
					o.user = data;
					users.setUser(o.user);

				})
		};

		// Todo
		o.changePicture = function(){
			
		};


		o.showProfile = function(){

		}

		return o;
	}])

	// ------------------- Links
	.factory('links', ['$http', function($http){

		var o = {
			links : [],
			linksHash : []
		}

		o.getAll = function(){
			return $http({
					  method  : 'GET',
					  url     : '/api/relationships/',
					  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
					 })
					.success(function(data) {
						angular.copy(data, o.links);
						data.map(function(l){
							if( o.linksHash[l.ref] == undefined)
								o.linksHash[l.ref] = l;
							else
								console.error("Multiple link nodes found for same edge");
						})
					});		
		}

		o.getLink = function(relationshipId){
			return $http({
					  method  : 'GET',
					  url     : '/api/relationships/' + relationshipId,
					  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
					 })
					.success(function(data) {
						//console.log("data", data);
					});		
		}

		o.createLink = function(linkData){

			linkData.relationshipName = "RELATED_TO";

			return $http({
						  method  : 'POST',
						  url     : '/api/relationships/',
						  data    : linkData,  
						  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
						 })
						.success(function(data) {

						});
		}

		o.deleteLink = function(id){
			return $http.delete('/api/relationships/' + id)
				.success(function(res) {
					//alert(res);
					return;  
			    })
			    .error(function(error){
			    	alert(error);
					throw error;
			    })
		}

		return o;

	}])


	// ----------------- Deals with attachments (deleting)
	.factory('attachments', ['$http', function($http){
		
		var o = {
			attachments: []
		}

		o.deleteAttachmentbyId = function(attachmentId, contributionId){
			
			return $http.delete('/api/contributions/'+contributionId+'/attachments/'+attachmentId)
				.success(function(res) {
					return;  
			    })
			    .error(function(error){
					throw error;
			    })
		}

		return o;
	}])





// -------------- Experimental directive
// http://embed.plnkr.co/aWBXtk4a5mCNWZFEebiP/ 
angular.module('studionet').directive('myAwns', ['users', function(users) {
    var directiveDefinitionObject = {
      restrict: 'E',
      templateUrl: "./templates/textAngularWithMentio.html",
      require: '^ngModel',
      scope: {
        ngModel: '=',
      },
      controller: function($scope, $q, $http) {
        $scope.setup = function(element) {
          element.attr('mentio', 'mentio');
          element.attr('mentio-typed-term', 'typedTerm');
          element.attr('mentio-require-leading-space', 'true');
          element.attr('mentio-id', "'htmlContent'");
        };

        $scope.searchPeople = function(term) {
          	var peopleList = [];
            
            if(users.users.length == 0)
            	users.getAll().then(function(){ return populatePeopleList(); });
            else
            	return populatePeopleList();


            function populatePeopleList(){
	            angular.forEach(users.users, function(item) {
	              if (item.name.toUpperCase().indexOf(term.toUpperCase()) >= 0) {
	                peopleList.push(item);
	              }
	            });
	            $scope.people = peopleList;
            	return $q.when(peopleList);
            }
        
        };

        $scope.getPeopleText = function(item) {
          return '@[<strong>' + item.name + '</strong>]';
        };

        $scope.getPeopleTextRaw = function(item) {
          return '[@' + item.name + '~' + item.id + ']';
        };
      }
    };

    return directiveDefinitionObject;

  }]);