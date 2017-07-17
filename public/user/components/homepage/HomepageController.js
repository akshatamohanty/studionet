angular.module('studionet')
.controller('HomepageController', ['$scope', 'profile', 'spaces', 'contributions',
                            function($scope, profile, spaces, contributions){

          $scope.$emit('showBench');
          $scope.$emit('hideSearch');

          // get user
          // user.follows - will give all the user subscriptions along with the personally assigned names
          // user.curates - will give all the user forks/folders along with the personally assigned names
          $scope.spaces = spaces.spacesHash;
          $scope.user = profile.user;


          // compute the recent posts
          $scope.recentPosts = [];
          var latestCount = 20;
          var postcount = contributions.contributions.length;
          for(var i=1; i <= latestCount; i++){
            $scope.recentPosts.push(contributions.contributions[postcount - i])
          }

          // show the users currently online
          $scope.usersOnline = [
              {"name" : "John", "profile": "http://placehold.it/150x150" },
              {"name" : "Jane", "profile": "http://placehold.it/150x150" },
              {"name" : "Ivan", "profile": "http://placehold.it/150x150" },
              {"name" : "Laura", "profile": "http://placehold.it/150x150" },
              {"name" : "Shi", "profile": "http://placehold.it/150x150" },
              {"name" : "Petunia", "profile": "http://placehold.it/150x150" },
              {"name" : "Heidi", "profile": "http://placehold.it/150x150" }
          ];

          $scope.getStatus = function(times){

              if(times == null)
                return {style: {"background-color": "#98F398"}};

              // improve later
              var expiry = times[1];
              var today = new Date();
              var difference = expiry - today; 

              var days = Math.floor(difference/86400000);

              var status = {msg: "days till expiry", "time_left": 4, style: {"background-color": "#77BB77"}}
              status.time_left = days;

              if(days<=0){
                status.msg = "days since expired";
                status.time_left = days;
                status.style = {"background-color": "#B8B0B0"};
              }
              else if(days < 4){
                status.msg = "Expiring soon!";
                status.time_left = days;
                status.style = {"background-color": "#F18D8D"};
              }


              return status;

          }



}]);
