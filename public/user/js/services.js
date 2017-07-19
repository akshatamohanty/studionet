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

	.factory('contributions', ['$http', '$filter', 'profile', function($http, $filter, profile){

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

		o.getContribution = function(contribution_id){

			return $http.get('/api/contributions/' + contribution_id).success(function(res){

				var res = res.data;

				// ------------- replace tag IDs with the actual tag
				/*res.tags = res.tags.map(function(t){
					return tags.tagsHash[t];
				});*/
				
				// ------------- extract the images
				var inlineImagePattern = new RegExp('src="studionet-inline-img-', "g");
				res.body = res.body.replace(inlineImagePattern, 'src="../api/contributions/' + contribution_id + '/attachments?name=studionet-inline-img-');

				return res;
				// ------------- compute the reading time
				/*function strip(html)
				{
				   var tmp = document.createElement("DIV");
				   tmp.innerHTML = html;
				   return tmp.textContent || tmp.innerText || "";
				}
				var t = ((res.body).split(" ").length / 200).toFixed(0); // number of words

	            //var t =  parseInt((res.body.length / 300).toFixed(0)); 
	            if(t == 0)
	            	res.readingTime = "Very short read!";
	            else if(t == 1)
	            	res.readingTime = "1 minute read";
	            else 
	            	res.readingTime =  t + " minute read";*/


			});	
		}

		// Data needs to be sent in FormData format
		o.createContribution = function(new_contribution){

			var inlineImages = extractImages(new_contribution);
			new_contribution.attachments = new_contribution.attachments.concat(inlineImages);

			var formData = new FormData();
			formData.append('title', new_contribution.title);
			formData.append('body', new_contribution.body);
			formData.append('tags', new_contribution.tags);
			formData.append('refType', new_contribution.refType);
			formData.append('contentType', new_contribution.contentType);
			formData.append('ref', new_contribution.ref);

			new_contribution.attachments.map(function(file){	formData.append('attachments', file, file.name); 	})

		    return $http({
					method  : 'POST',
					url     : '/api/contributions',
					headers : { 'Content-Type': undefined, 'enctype':'multipart/form-data; charset=utf-8' },
					processData: false,
					data: formData
		    })
		    .success(function(res) {

		    	// refresh profile
		    	profile.getUser();

		    	return res;

		    })
		    .error(function(error){
				throw error;
		    }) 
		}


		// ---- Updates a contribution
		o.updateContribution = function(update_contribution){

			var inlineImages = extractImages(update_contribution);
			update_contribution.attachments = update_contribution.attachments.concat(inlineImages);

			var formData = new FormData();
			formData.append('title', update_contribution.title);
			formData.append('body', update_contribution.body);
			formData.append('tags', update_contribution.tags);
			formData.append('contentType', update_contribution.contentType);
			formData.append('ref', update_contribution.ref);

			update_contribution.attachments.map(function(file){
				formData.append('attachments', file, file.name);
			})

			return $http({
				  method  : 'PUT',
				  url     : '/api/contributions/'+ update_contribution.id,
				  headers : { 'Content-Type': undefined, 'enctype':'multipart/form-data; charset=utf-8' },
	      	      processData: false,
	              data: formData
				 })
				.then(function(res) {

					o.selectNode(update_contribution.id);

					// send success
					return res;  
				})	
		}

		// ---- Deletes a contribution
		// Confirmation Testing happens here
		o.deleteContribition = function(contribution_id){

			var r = confirm("Are you sure you want to delete your node? This action cannot be undone.");
	        if (r == true) {

	        	o.spinner.spin(document.getElementById('cy'));

	        	o.removeAdditionalStyles();

		        return $http({
						method  : 'delete',
						url     : '/api/contributions/' + contribution_id,
						data    : {},  // pass in data as strings
						headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
						})
			    .success(function(res) {

					// remove node from graph
					o.removeNode(contribution_id);
					
					// refresh profile
					profile.getUser();


			    })
			    .error(function(error){
			    	o.spinner.stop();
					throw error;
			    })	
			}
			else
				console.log("Error Deleting");
		}


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


	.factory('spaces', ['$http', 'tags', 'profile', function($http, tags, profile){

		var o ={
			spaces: [],
			spacesHash: [],
		};

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


		// ----------------- This service refreshes the above data 
		o.getAll = function(){
			return $http.get('/api/spaces/').success(function(data){

				angular.copy(data, o.spaces);

				if(data != undefined)	o.spacesHash = data.hash();

				notifyObservers();
			});
		};

		// ----------------- Utility function that returns the ui-sref path for a particular space ID
		o.getSpaceURL = function(space_id){

			var sp = o.spacesHash[space_id];
			var tags = sp.tags; 
			var dates = sp.timed;

			var params = {};

            var tagString =  tags.join(",");
            params.tags = tagString;

            if (dates.length > 0)
              params.dates = dates.join(",");

          	var final_path = 'home.search-results(' + JSON.stringify(params) + ')';

            return final_path;
        }

        // ----------------- returns an object with information about the space based on the state params
		o.getSpace = function($stateParams){


			// get the tags and the dates from the route params
			var tArray = $stateParams.tags ? $stateParams.tags.split(",").map(function(t){return parseInt(t)}) : [];
			var dArray = $stateParams.dates ? $stateParams.dates.split(",").map(function(t){return parseInt(t)}) : [];

			var location = { status: -1 };

			if( tArray.length == 0 && dArray.length == 0){
				console.log("No parameters found; Return null location");
				return location; 
			}

			// check if all tags are valid
			var tagsMap = tags.tagsHash;
			for(var i=0; i < tArray.length; i++){
				if (tagsMap[tArray[i]] == undefined){
					console.log("Invalid Paramaters")
					return location;
				}

			}

			// URL is not invalid
			location.status = 0;
			location.id = undefined;
			location.name = "<un-curated>";
			location.about = "This space is not curated with anyone yet."

			// check if such a space exists
			for (var i=0; i < o.spaces.length; i++){

				var space = o.spaces[i];

				if ( (JSON.stringify(space.tags.sort()) === JSON.stringify(tArray.sort())) && (JSON.stringify(space.timed.sort()) === JSON.stringify(dArray.sort())) ){
						

					// space exists
					location.status = 1;

					// assign the id of the space
					location.id = space.id;

					// assign a name to the location
					location.name = "<un-named>";

					// assign a status
					location.about = "You have not saved or followed this space.";
		
					// the user's status with the space
					var follows = false, curates = false;
					if( space.curators.indexOf(profile.user.id) > -1){
						location.name = profile.user.curates.filter(function(t){ return t.id == space.id; })[0].name;
						location.status += 1;
						curates = true;
						location.about = "You curate this space";
					}

					if( space.followers.indexOf(profile.user.id) > -1){					
						location.status += 1;
						follows = true;
						location.about = "You follow this space";
					}

					if( follows == true && curates == true){
						location.status += 4;
						location.about = "Bravo! You follow and curate this space!"
					}

					location.details = space;

					return location; 
				}


			}

			// no such space exists
			return location;

		}

		o.getResults = function(){

			// get all the posts for this query
			/*return $http({
						  method  : 'POST',
						  url     : '/api/contributions/query',
						  data    : { tags: [23, 4, 343], dates: [34, 23, 3]},  
						  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
						 })
						.success(function(data) {

						});*/

			return [
					{"id": "1", "title": "Hello World 1", "author": 2, "rating": "gold", "size": "xl"},
					{"id": "2", "title": "Hello World 2", "author": 2, "rating": "silver", "size": "md"},
					{"id": "3", "title": "Hello World 3", "author": 2, "rating": "gold", "size": "xl"},
					{"id": "4", "title": "Hello World 4", "author": 2, "rating": "plastic", "size": "xl"},
					{"id": "5", "title": "Hello World 5", "author": 2, "rating": "bronze", "size": "sm"},
					{"id": "6", "title": "Hello World 6", "author": 2, "rating": "silver", "size": "md"},
					{"id": "7", "title": "Hello World 7", "author": 2, "rating": "plastic", "size": "xs"},
					{"id": "8", "title": "Hello World 8", "author": 2, "rating": "bronze", "size": "md"},
					{"id": "1", "title": "Hello World 1", "author": 2, "rating": "gold", "size": "xl"},
					{"id": "2", "title": "Hello World 2", "author": 2, "rating": "silver", "size": "md"},
					{"id": "3", "title": "Hello World 3", "author": 2, "rating": "gold", "size": "xl"},
					{"id": "4", "title": "Hello World 4", "author": 2, "rating": "plastic", "size": "xl"},
					{"id": "5", "title": "Hello World 5", "author": 2, "rating": "bronze", "size": "sm"},
					{"id": "6", "title": "Hello World 6", "author": 2, "rating": "silver", "size": "md"},
					{"id": "7", "title": "Hello World 7", "author": 2, "rating": "plastic", "size": "xs"},
					{"id": "8", "title": "Hello World 8", "author": 2, "rating": "bronze", "size": "md"}
				]
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