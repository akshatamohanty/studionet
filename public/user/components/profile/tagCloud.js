var app = angular.module("tagcloud",["ngTagCloud"]);

app.controller("tagCloudController",function($scope){


    $scope.data = [
          {text: "Lorem", weight: 15, link: "https://google.com"},
          {text: "Ipsum", weight: 9},
          {text: "Dolor", weight: 6},
          {text: "Sit", weight: 7},
          {text: "Amet", weight: 5}
          // ...as many words as you want
      ];
});