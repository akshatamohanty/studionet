angular.module('studionet')
.controller('profileViewController', function($q, $scope, $interval, tags, userProfile, profile, routerUtils) {

      $scope.getTagName = tags.getTagName;
      $scope.user = userProfile;
      $scope.getPostStatus = profile.getPostStatus;
      $scope.goToSpace = routerUtils.goToSpace;

      $scope.levels = [ { name: "Novice", id: 1, points: 10}, { name: "Coffee Boy", id: 2, points: 50},  { name: "Intern", id: 3, points: 150},  { name: "Junior Architect", id: 4, points: 500},
                        { name: "Architect", id: 5, points: 1000}, { name: "Lead Architect", id: 6, points: 5000}        ];

      $scope.Badge = [
                {"Name" : "Badge1"},
          ];

      // todo: compute most popular contribution of the user
      $scope.topcontribution = $scope.user.contributions[0];
      function getScore(contribution){
        return contribution.views/10 + contribution.likes/5 + contribution.bookmarks/2;
      }

      var hashmap = {};
      $scope.user.contributions.forEach(function(element) {

          if(element.type == "comment")
            return;

          // compute tags
          var tags = element.tags; 
          tags.forEach(function(tag){

              if(hashmap[tag] != undefined)
                hashmap[tag].weight++;
              else
                hashmap[tag] = {text: $scope.getTagName(tag), weight: 1, id: tag};

          })

          // compare for top contribution
          if( getScore($scope.topcontribution) <  getScore(element) )
            $scope.topcontribution = element;

      });

      // data conversion for tag clound
      $scope.data = [];
      for( tagId in hashmap)
        $scope.data.push(hashmap[tagId]);


      // functions for levels
      var currentLevel = 0;
      $scope.getLevelStatus = function(level_idx){    

        var status = "pending";

          if( $scope.user.points > $scope.levels[level_idx].points )
            status = "achieved";
          else if( $scope.user.points <= $scope.levels[level_idx].points && (level_idx - 1 > -1 ? $scope.user.points > $scope.levels[level_idx - 1].points : true) ){
            currentLevel = level_idx;
            status = "current";
          }

          return "'" + status + "'";

      }

      // function for progress bar
      $scope.getLevelPercent = function(){
          return 100*($scope.user.points / $scope.levels[currentLevel].points)
      }

});