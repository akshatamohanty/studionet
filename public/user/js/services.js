// ------------- Services
angular.module('studionet')
	//-------------------- Supernodes
	// This service returns the group and contribution super node IDs
	.factory('supernode', ['$http', function($http){
		var o ={
			group: -1, 
			contribution: -1,
			tag: -1
		};

		o.getSupernodes = function(){
			return $http.get('/api/supernode').success(function(data){
				o.group = data.groupId; 
				o.contribution = data.contributionId; 
				o.tag = data.tagId
			});
		};

		return o;
	}])

	//
	//	functions to help with the navigation
	//
	.factory('routerUtils', ['$state', 'spaces', function($state, spaces){

		var fn = {};

		fn.goToSpace = function(space_id){
			var space = spaces.spacesHash[space_id];
			$state.go('home.search-results', {tags: space.tags.join(","), dates: space.timed.join(",") });
		}

		fn.goToSpaceWithArgs = function(tags, dates){

			if(tags[0] == undefined){
				$state.go('home.homepage');
			}
			else{
				dates = dates.map(function(dateString){ return new Date(dateString).getTime() });
				$state.go('home.search-results', {tags: tags.join(","), dates: dates.join(",") });
			}
		}

		fn.goToProfile = function(url){
			$state.go('home.profile-details', { 'referer':'home.homepage', 'address': 1});
		}

		fn.goToNode = function(node_id){
			if(node_id == null)
				return;

			$state.go('home.node-details', { 'referer':'home.homepage', 'address': node_id })
		};

		fn.goToSearch = function(){
			$state.go('home.search');
		};


 		fn.getThumb = function(contributionId, attachment){

            if(attachment.thumb){
              return "/api/contributions/" + contributionId + /attachments/+ attachment.id + "/thumbnail";
            }
            else{
              if(attachment.name.indexOf(".pdf") > -1)
                return "./img/file_pdf.png"
              else if(attachment.name.indexOf(".doc") > -1)
                return "./img/file_doc.jpg"
              else
                return "./img/file_default.jpg"; // replace with image for particular extension
            }
        }

		return fn;
	}])

	.factory('contributions', ['$http', '$filter', 'profile', 'tags', 'supernode', function($http, $filter, profile, tags, supernode){

		var o = {
			contributions: [],
			contributionsHash: [], 
			recentCount: 0, 
			recentPosts: [],
			onlyposts: []
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

				notifyObservers();

			});
		};

		o.getRecent = function(number){

			if(number == undefined)
				number = 10;

			var i=0;
			while( i < number ){

				var k =  o.contributions.length - o.recentCount - 1;
				if( k < 0 )
					break;

				var c = o.contributions[k]; 
				if(c.type !== "comment" && c.tags.length > 0){
					o.recentPosts.push(c);
					i++;
				}

				o.recentCount++;

			}

			return o.recentPosts;
		}

		o.getFirstDate = function(){
			return o.contributions[0].dateCreated;
		}

		o.getLastDate = function(){
			return (new Date()).getTime();
			// return o.contributions[ o.contributions.length - 1 ].dateCreated;
		}

		o.getContribution = function(contribution_id){

			if(contribution_id == null){
				console.log("Contribution Id is null");
			}

			return $http.get('/api/contributions/' + contribution_id).success(function(res){

				// ------------- replace tag IDs with the actual tag
				/*res.tags = res.tags.map(function(t){
					return tags.tagsHash[t];
				});*/
				
				// ------------- extract the images
				var inlineImagePattern = new RegExp('src="studionet-inline-img-', "g");
				res.body = res.body.replace(inlineImagePattern, 'src="../api/contributions/' + contribution_id + '/attachments?name=studionet-inline-img-');

				// add status if present
				res.status = o.contributionsHash[res.id].status ? o.contributionsHash[res.id].status : [];

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

			// add default parameters
			if(new_contribution.ref == null)
				new_contribution.ref = supernode.contribution;

			if(new_contribution.tags.length == 0)
				new_contribution.tags = [supernode.tag]


			// extract inline images
			var inlineImages = extractImages(new_contribution); 
			new_contribution.attachments = new_contribution.attachments.concat(inlineImages);

			var formData = new FormData();
			formData.append('title', new_contribution.title);
			formData.append('body', new_contribution.body);
			formData.append('tags', new_contribution.tags.join(","));
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

			// add default parameters
			if(update_contribution.ref == null)
				update_contribution.ref = supernode.contribution;

			if(update_contribution.tags.length == 0){
				update_contribution.tags = [supernode.tag]
			}


			var inlineImages = extractImages(update_contribution);
			update_contribution.attachments = update_contribution.attachments.concat(inlineImages);

			var formData = new FormData();
			formData.append('title', update_contribution.title);
			formData.append('body', update_contribution.body);
			formData.append('tags', update_contribution.tags.join(","));
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

					// update the user posts
					profile.getUser();

					// send success
					return res;  
				})	
		}

		// ---- Deletes a contribution
		// Confirmation Testing happens here
		o.deleteContribution = function(contribution_id){

			var r = confirm("Are you sure you want to delete your node? This action cannot be undone.");
	        if (r == true) {

		        return $http({
						method  : 'delete',
						url     : '/api/contributions/' + contribution_id,
						data    : {},  // pass in data as strings
						headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
						})
			    .success(function(res) {

					// refresh profile
					profile.getUser();

					o.getAll();

			    })
			    .error(function(error){
					throw error;
			    })	
			}
			else
				console.log("Error Deleting");
		}

		o.likeContribution = function(id){
			return $http.post('/api/contributions/' + id + '/rate', {'rating': 5} ).success(function(data){
			
				o.contributionsHash[id].status.push("liked");

			});
		};

		o.viewContribution = function(id){
			return $http.post('/api/contributions/' + id + '/view').success(function(data){

			});
		};

		o.bookmarkContribution = function(contribution_id){
			return $http.post('/api/contributions/' + contribution_id + '/bookmark').success(function(data){
				profile.getUser();
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
		o.getUser = function($stateParams){
			
			var user_id = $stateParams.address; 

			if(user_id == undefined)
				return;

			console.log(user_id);
			var url = '/api/users/' + user_id;
			
			return $http.get(url).then(function(res){
				if(res.status == 200){
					return res.data;
				}
				else{
					console.log("Error fetching user data");
				}
			});

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

		o.getTagName = function(tag){
			if(Number.isInteger(tag))
				return o.tagsHash[tag].name;
			else
				return o.tagsHash[tag.tag_id].name;
		}

		o.createTag = function(new_tag){
			
			// post request to create the tag
			return $http.post('/api/tags', {tags: new_tag}).success(function(data){
				
				o.getAll();
				
			}).error(function(err) {
				console.log(err);
			});;
			
		}

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


	.factory('spaces', ['$http', 'tags', 'profile', 'contributions', function($http, tags, profile, contributions){

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

		o.getSpaceById = function(space_id){
			return o.spacesHash[space_id];
		}

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


			var location = { status: -1, tags: tArray, dates: dArray };

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
			location.name =  "...";
			location.about = "This space hasn't been saved by anyone yet."

			// check if such a space exists
			for (var i=0; i < o.spaces.length; i++){

				var space = o.spaces[i]; 

				if ( (JSON.stringify(space.tags.sort()) === JSON.stringify(tArray.sort())) && (JSON.stringify(space.timed.sort()) === JSON.stringify(dArray.sort())) ){
						

					// space exists
					location.status = 1;

					// assign the id of the space
					location.id = space.id;

					// assign a name to the location
					location.name = "...";

					// assign a status
					location.about = "You have not saved or followed this space.";
					// the user's status with the space
					var follows = false, forked = false;
					if( space.forkers.indexOf(profile.user.id) > -1){
						location.name = profile.user.forked.filter(function(t){ return t.id == space.id; })[0].name;
						location.status = 3;
						forked = true;
						location.about = "You've forked this space";
					}

					if( space.followers.indexOf(profile.user.id) > -1){					
						location.status = 2;
						follows = true;
						location.about = "You follow this space";
					}

					if( follows == true && forked == true){
						location.status = 4;
						location.about = "Bravo! You follow and forked this space!"
					}

					location.details = space;
					return location; 
				}


			}

			// no such space exists
			return location;

		}

		o.getResults = function($stateParams){

			// get the tags and the dates from the route params
			var tArray = $stateParams.tags ? $stateParams.tags.split(",").map(function(t){return parseInt(t)}) : [];
			var dArray = $stateParams.dates ? $stateParams.dates.split(",").map(function(t){return parseInt(t)}) : [];

			// get all the posts for this query
			return $http({
						  method  : 'POST',
						  url     : '/api/contributions/query',
						  data    : { tags: tArray, dates: dArray },  
						  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
						 })
						.success(function(data) {
								return data;
						});

		}

		o.createSpace = function(tags, dates){

			return $http.post('/api/spaces', { tags: tags, dates: dates } ).success(function(data){ 

							console.log("Results", data);

							// refresh the spaces
							o.getAll();

							return data;
					});
		}

		o.forkSpace = function(data){
			return $http.post('/api/spaces/' + data.space + '/fork', { name: data.name } ).success(function(data){ 

							// refresh the spaces
							profile.getUser();
							o.getAll();

							return data;
					});
		}

		o.deleteFork = function(space_id){
			return $http.delete('/api/spaces/' + space_id + '/fork').success(function(data){ 

							// refresh the user profile
							profile.getUser();

							// refresh the spaces
							o.getAll();

							return data;
					});
		}

		o.addToFork = function(space_id, contribution_id){
			return $http({
						  method  : 'POST',
						  url     : '/api/spaces/' + space_id + '/add',
						  data    : { contribution: contribution_id },  
						  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
						 })
						.success(function(data) {
								// also bookmark the contribution
								contributions.bookmarkContribution(contribution_id);
								return data;
						});

		}

		return o;


	}])


	//--------------------- Profile
	.factory('profile', ['$http', 'users', function($http, users){
		
		var o ={
			user: {},
			created: [],
			viewed: [],
			liked: [],
			bookmarked: []
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
				o.getActivity();
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
				
				var activity = data[0];
				for(var i=0; i < activity.length; i++){

					var action =  activity[i];

					if(action.type == "VIEWED")
						o.viewed.push(action.end);
					else if(action.type == "CREATED")
						o.created.push(action.end);
					else if(action.type == "RATED")
						o.liked.push(action.end)
					else if(action.type == "BOOKMARKED")
						o.bookmarked.push(action.end);

				}

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

		// 
		// 
		// 	Get the relationship of the user to the post
		// 	
		// 
		o.getPostStatus = function(post){

			var post_id = post.id;
			var status = [];

			var options = ["created", "bookmarked", "liked", "viewed"];

			options.map(function(opt){
				if(o[opt].indexOf(post_id) > -1)
					status.push(opt);
			})

			post.status = status;

			return status;

		}	


		//
		//
		//	Allow user to tag a contribution
		//
		o.tagContribution = function(contribution_id, tag_array){

			// get all the posts for this query
			return $http({
						  method  : 'POST',
						  url     : '/api/contributions/' + contribution_id + '/tag',
						  data    : { tags: tag_array },  
						  headers : { 'Content-Type': 'application/json' }  // set the headers so angular passing info as form data (not request payload)
						 })
						.success(function(data) {

							//refresh user profile
							o.getUser();

							return data;
						});
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


// --- extraction of images 
function dataURItoBlob(dataURI) {
  
  // convert base64 to raw binary data held in a string
  // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
  var byteString = atob(dataURI.split(',')[1]);

  // separate out the mime component
  var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var ia = new Uint8Array(ab);
  for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
  }

  return new Blob([ab], {type: mimeString});


}

function extractImages(data){

  var patt1 = new RegExp('data:image(\\S*)"', "g");
  var result = data.body.match(patt1);

  if(result == null)
    return [];
  
  var attachments = [];
  for(var i=0; i < result.length; i++){
      var src = result[i].substr(0, result[i].length-1);
      var fileType = src.match("data:image/(.*);")[1];
      var theBlob = dataURItoBlob( src );
      theBlob.lastModifiedDate = new Date();
      theBlob.name = "studionet-inline-img-" + (new Date()).getTime() + (fileType ? "." + fileType : "");

      data.body = data.body.replace(src, theBlob.name);

      attachments.push(theBlob);
  }

  return attachments; 

}


