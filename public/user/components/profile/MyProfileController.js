/*
 * User's Profile - view and edit
 */
angular.module('studionet')
.controller('MyProfileController', ['$scope', 'profile', 'Upload', '$http', '$stateParams', function($scope, profile, Upload, $http, $stateParams){

	$scope.profile = profile.user.name;

	$scope.$emit('hideBench');
	$scope.$emit('hideSearch');

	$scope.init = function(){
		$scope.userData = { 'id': profile.user.id, 'name': profile.user.name, 'nusOpenId': profile.user.nusOpenId, 'avatar': profile.user.avatar, 'nickname' : profile.user.nickname };
	}

	$scope.uplodateFiles = function (profile_picture){

	  //$scope.userData.profilePic = profile_picture;

	  //console.log(profile_picture);
	  profile_picture = profile_picture[0];
	  $scope.profilePic = profile_picture;


	  var reader  = new FileReader();
	  reader.addEventListener("load", function () {
	    $scope.userData.avatar = reader.result;
	  }, false);

	  if(profile_picture){
	  	reader.readAsDataURL(profile_picture);
	  }

  	}

	$scope.uploadPic = function(avatar) {

		var formData = new FormData();
		formData.append('avatar', avatar, avatar.name);

	    $http({
				method  : 'POST',
				url     : '/uploads/avatar',
				headers : { 'Content-Type': undefined, 'enctype':'multipart/form-data; charset=utf-8' },
				processData: false,
				data: formData
	    })
	    .success(function(res) {

			profile.getUser().then(function(){
			  $scope.user.avatar = $scope.user.avatar + "?cb=" + Math.random(0,1)*123124;
			  $scope.init();
			});

	    });

   	}

   	$scope.updateProfile = function(){

   		// check if profile changed
   		if($scope.profilePic !== undefined){
   			// call function to update picture
	   		$scope.uploadPic($scope.profilePic);
   		}
   		else{
   			console.log("Avatar unchanged");
   		}

   		// check if name changed
   		if($scope.userData.nickname == profile.user.nickname){
   			console.log("Same nickname - no need to update");
   		}
 		else{

 			if($scope.userData.nickname.replace(/\s/g, '').length || $scope.userData.nickname == ""){
	 			profile.changeName( {'id' : $scope.userData.id, 'nickname': $scope.userData.nickname } ).success(function(data){
	 				profile.getUser().then(function(){
	 					$scope.init();
	 				});
	 			});
 			}
 			else{
 				alert("Nickname can't contain only spaces.")
 			}

 		}

   	}

}]);

