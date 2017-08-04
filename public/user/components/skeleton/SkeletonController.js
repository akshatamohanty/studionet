angular.module('studionet')
.controller('SkeletonController', ['$scope', '$mdToast', 'profile', 'contributions', 'spaces', 'routerUtils', 'tags', '$stateParams', 'users', '$state', '$mdToast',
                               function($scope, $mdToast, profile, contributions, spaces, routerUtils, tags, $stateParams, users, $state, $mdToast){

          $scope.showBench = true;
          $scope.searchActive = false;

          // to control show and hide of search bar and work bench
          $scope.$on('hideBench', function(){ if($scope.showBench == true ) $scope.showBench = false });
          $scope.$on('hideSearch', function(){ if($scope.searchActive == true) $scope.searchActive = false });
          $scope.$on('showBench', function(){ if($scope.showBench == false) $scope.showBench = true });
          $scope.$on('showSearch', function(){ if($scope.searchActive == false) $scope.searchActive = true });

          $scope.$on('clearQuery', function(){ $scope.query = {tags: [], dates: []}; $scope.showDates = false;  });

          // global references -- good practice???
          $scope.posts = contributions.contributionsHash; 
          contributions.registerObserverCallback(function(){ $scope.posts = contributions.contributionsHash;  });

          $scope.spaces = spaces.spacesHash;
          spaces.registerObserverCallback(function(){ console.log("updating spaces"); $scope.spaces = spaces.spacesHash; });

          // user profile
          $scope.user = profile.user;

          // subscribe to changes in user profile
          profile.registerObserverCallback(function(){ $scope.user = profile.user; });

          $scope.goToSpace = routerUtils.goToSpace;
          $scope.goToProfile = routerUtils.goToProfile;
          $scope.goToNode = routerUtils.goToNode;
          $scope.goToSearch = routerUtils.goToSearch;
          $scope.getSpaceURL = spaces.getSpaceURL;

          $scope.goToSpaceWithArgs = function(query){
            // send only the tag ids 
            routerUtils.goToSpaceWithArgs( query.tags.map(function(t){ return t.id }), query.dates );
          } 

          $scope.getTagString = function(id){ return tags.tagsHash[id]; };
          $scope.getUserName = function(user_id){return users.usersHash[user_id].name };
          $scope.getAvatar = function(user_id){ return users.usersHash[user_id].avatar };


          // background of the cards 
          $scope.getPostBackground = function(post){

            if(post.attachments == undefined)
              return {};

            if(post.attachments[0].id == null)
              return {};

            var path = undefined;
            for(var i=0; i < post.attachments.length; i++){
              path = routerUtils.getThumb(post.id, post.attachments[i]);
              if(path.startsWith("./img/") == false)
                break;
            }

            return {"background-image": "url(" + path + ")" };

          }


          // search functionality
          $scope.$watchCollection(function(){
              return $state.params;
          }, function(data){

              if(data.tags !== undefined && data.type == undefined){
                $scope.query.tags = data.tags.split(",").map(function(t){return $scope.getTagString(parseInt(t)); } ); 
                $scope.query.dates = data.dates ? data.dates.split(",").map(function(t){return new Date(parseInt(t))}) : [ new Date(contributions.getFirstDate()), new Date(contributions.getLastDate()) ];
              }

          });
          
          $scope.query = {tags: [], dates: [ new Date(contributions.getFirstDate()), new Date(contributions.getLastDate()) ]};

          $scope.$watchCollection('query.tags', function(){

              if($scope.query.tags.length == 0)
                $state.go('home.homepage');

              // check if last tag added is  valid
              var last_tag = $scope.query.tags[$scope.query.tags.length-1];

              if(last_tag == undefined || last_tag.id == undefined)
                return; 
              else
                $scope.goToSpaceWithArgs($scope.query);
          
          })


          $scope.createTag = tags.createTag;

}]);
