angular.module('studionet')
.controller('profileViewController', function($q, $scope, $interval, tags, userProfile) {

      $scope.getTagName = tags.getTagName;

      $scope.user = userProfile;
      $scope.user.role = 1;
      $scope.user.points = 40;57

      $scope.levels = [ { name: "NOVICE", id: 1}, { name: "COFFEE BOY", id: 2},  { name: "ARCHI INTERN", id: 3},  { name: "JR. ARCHITECT", id: 4},
                        { name: "ARCHITECT", id: 5}, { name: "LEAD ARCHITECT", id: 6}        ];

      $scope.Badge = [
                {"Name" : "Badge1"},
          ];

      // todo: compute most popular contribution of the user
     /* $scope.topcontribution = $scope.user.contributions[0];*/

        $scope.topcontribution = function(){

            for(var i=0; i < $scope.user.contributions.length; i++){
              var topcontribution = $scope.user.contributions[i];
              if ($scope.topcontribution[i].likes >=4 && $scope.topcontribution[i].bookmarks >=3) {
                $scope.topcontribution = $scope.user.contributions[i];
              }
              else{
                 $scope.topcontribution = $scope.user.contributions[0];
              }
            }
          }

      // todo: compute the number of comments by the user
      var numberofcomments = [];
      var countofcomments = 0;
      for(var i=0; i< $scope.user.contributions.length; i++){
         numberofcomments = $scope.user.contributions[i];
        if(numberofcomments.type == "comments"){
            countofcomments++;
        }
      }


      // todo: compute the most popular tags used by the user using the user.contributions
      // count the number of times the user has used a particular tag and reassign $scope.data
      var all_posts = $scope.user.contributions;

      /*generate a hashmap from the array*/
      var hashmap = {};
      all_posts.forEach(function(element) {

          if(hashmap[element.id]!==null && hashmap[element.id]!=undefined){
             if(!Array.isArray(hashmap[element.id])){
                 var tempObj = hashmap[element.tags];

                 // json.stringify your object if you
                 // want to  serialise your hashmap for external use

                 hashmap[element.id] = [tempObj];
             }

             hashmap[element.id].push(element);

          }
          else{
              // if you want to serialise your hashmap for external use
              hashmap[element.id] = JSON.stringify(element);
              // if not, you could just do without JSON.stringify
              hashmap[element.id] = element;
          }

      });
      console.log(hashmap);

      /*     var tagCountArray = [];
      for(var i=0; i< $scope.user.contributions.length; i++){
          tagCountArray = $scope.user.contributions[i];
        for(var j=0; j< tagCountArray.tags.length; j++){
            var map = tagCountArray.tags.reduce(function(prev, cur) {
            prev[cur] = (prev[cur] || 0) + 1;
            return prev;
            }, {});
        }
      }
      console.log(map);*/

          $scope.data = [
            {text: "Ipsum", weight: 9},  // three properties - id (tag id), text (tag name), weight (count of tag in the users' posts)
            {text: "Dolor", weight: 6},
            {text: "Sit", weight: 7},
            {text: "Amet", weight: 5}
      ];


});