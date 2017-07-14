angular.module('studionet')
.controller('BadgeprogressController', ['$scope', 'profile', 'spaces', 'contributions', 'tags',
                            function($scope, profile, spaces, contributions, tags){


          $scope.user = profile.user;
          $scope.spaces = spaces.spacesHash;
          $scope.tags = tags.tagsHash;

         

          $scope.badges = [
              {"title" : "Up and Up votes ", "subtitle": "25 and up votes " },
              {"title" : "Up and up votes II", "subtitle": "50 and more votes" },
              {"title" : "Answering master", "subtitle": "Answer 5 questions" },
              {"title" : "Up and up votes III", "subtitle": "75 and more votes " },
              {"title" : "Man of a kind ", "subtitle": "Create 5 posts" },
              {"title" : "Man of a kind II", "subtitle": "Create 10 posts " },
              {"title" : "Answering machine II", "subtitle": "Answer 10 questions" }
          ];



}]);