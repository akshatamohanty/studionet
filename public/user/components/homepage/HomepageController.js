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
          console.log($scope.ratingPosts[0].tags);
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
  
 
  $scope.suggested_tags.push(num,counts[num]);


}

//$scope.suggested_tags.sort(function(a, b){return b.count-a.count});

console.log($scope.suggested_tags);
console.log(counts[num])//for(var i =0; i<counts.length;i++)


 /*
  var rating=0; 
  var views=0;  
  //var user_rating = [];
  var likes=0;
  $scope.rat = [];
  var bookmarks=0;
  for(var i =0 ;i < $scope.ratingPosts.length;i++){
  
    if(!$scope.ratingPosts[i].views)
  {
    views=0;

  }
  else{
    views=$scope.ratingPosts[i].views;
    console.log($scope.ratingPosts[i].views);
  
  }

  if(!$scope.ratingPosts[i].bookmarks)
  {
    bookmarks=0;
  }
  else{
    bookmarks=$scope.ratingPosts[i].bookmarks;
  
  } 
    if(!$scope.ratingPosts[i].likes)
  {
    likes=0;
  }
  else{
    likes=$scope.ratingPosts[i].likes;
  
  }



  $scope.ratingPosts[i].rating = views/10 + likes/5 + bookmarks/2

}

console.log($scope.ratingPosts);

*/

}]);
