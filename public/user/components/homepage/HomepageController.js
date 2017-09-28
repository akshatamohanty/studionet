angular.module('studionet')
.controller('HomepageController', ['$scope', 'profile', 'spaces', 'contributions', 'tags', '$filter',
                            function($scope, profile, spaces, contributions, tags, $filter){

          $scope.$emit('showBench');
          $scope.$emit('hideSearch');

          $scope.$emit('clearQuery');

          $scope.tags = tags.tagsHash;
          $scope.getPostStatus = profile.getPostStatus;
          
          // get user
          // user.follows - will give all the user subscriptions along with the personally assigned names
          // user.curates - will give all the user forks/folders along with the personally assigned names
          $scope.spaces = spaces.spacesHash;
          $scope.user = profile.user;

          function getRecent(number){
            $scope.recentPosts = contributions.getRecent(number);
          }

          $scope.getRecent = getRecent;
          contributions.registerObserverCallback(function(){ getRecent(); });
           
          $scope.ratingPosts= contributions.getRecent(20);
          //console.log($scope.ratingPosts[0].tags);
 var tagsarr = [];
 for(var i =0 ;i < $scope.ratingPosts.length;i++){
  for( var j =0 ; j < i;j++)
  {
 // console.log($scope.ratingPosts[i].tags[j]);
  tagsarr.push($scope.ratingPosts[i].tags[j]);

}
}
 //console.log(tagsarr);
$scope.suggested_tags = [];
//$scope.users.push({"name": users.usersHash[id].name , "ids":id});
var counts =[];
for (var i =0; i< tagsarr.length;i++){
  var num = tagsarr[i];
  counts[num] =counts[num]?counts[num]+1:1; 
 // $scope.suggested_tags.push({"index" :num, "freq":counts[num]});

$scope.suggested_tags.push([num,counts[num]]);
}

/*$scope.suggested_tags= $scope.suggested_tags.filter(function( obj ) {
    return obj.index !== 'undefined';
});


*/

$scope.suggested_tags.sort(function(a, b) {
    return b[1] - a[1];
});


//console.log($scope.suggested_tags);
$scope.finalTags=[];
for (var i =0; i<$scope.suggested_tags.length;i++){
if($scope.suggested_tags[i][0]!=undefined){
 $scope.finalTags.push([$scope.suggested_tags[i][0],$scope.suggested_tags[i][1]]); 


}
}

$scope.TrendingTags = [];

for(var i =0; $scope.TrendingTags.length<5;i++){
  var index =$scope.finalTags[i][0];
  if($scope.TrendingTags.indexOf(index)==-1)
    $scope.TrendingTags.push(index);
  //console.log(index);

}
//console.log($scope.TrendingTags);



}]);
