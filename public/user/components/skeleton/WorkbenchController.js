
// Custom filter
app.filter('level', [function() {
    return function(level) {
        if(level == undefined)
          return "Newbie";
    };
}])



// Controls for the new node button
angular.module('studionet')
  .controller('WorkbenchCtrl', function($mdDialog, $timeout, profile, spaces, $mdToast) {

        var self = this;

        self.my_nodes = true;
        self.show = undefined; // fork that is open

        self.toggleMyNodes = function(){
          self.my_nodes = !self.my_nodes;
        }

        self.isRecent = function(node){
          var date = new Date(node.created_on);
          var now = new Date();

          var diff = ((now.getTime() - date.getTime())/1000)/60; // number of minutes

          if( diff < 0.5)
            return true; 
          else 
            return false;
        }

        self.openFork = function(fork_id){
          console.log(fork_id);
          self.show = fork_id;
        }

        self.deleteFork = function(space_id){
                    
            var confirm = $mdDialog.confirm()
              .title('Delete your folder?')
              .textContent('You will lose your collection of these awesome posts!')
              .ok('Delete')
              .cancel('Get me out of here!');

            $mdDialog.show(confirm).then(function(result) {

                spaces.deleteFork(space_id).success(function(){
                    var toast = $mdToast.simple()
                          .textContent('Successfully deleted your folder')
                          .position("bottom left")

                    $mdToast.show(toast);
                }); 


            }, function(error){

                // display error
            
            }); 

        }

        self.addNodeToFork = function(item, space){

            var _tags = spaces.getSpaceById(space.id).tags;

            profile.tagContribution(item.id, _tags)
                    .success(function(data){

                        // add the contribution to the users fork
                        spaces.addToFork(space.id, item.id).then(function(){
                            
                            // if item isn't in the time frame, show failure alert
                            var toast = $mdToast.simple()
                                  .textContent('Successfully added to your fork')
                                  .position("bottom left")

                            $mdToast.show(toast);

                        }, function(){

                              var toast = $mdToast.simple()
                                    .textContent('Hmm.... Something went wrong')
                                    .position("bottom left")

                              $mdToast.show(toast);
                        });
                    })
                    .error(function(){

                        var toast = $mdToast.simple()
                              .textContent('Hmm.... Something went wrong')
                              .position("bottom left")

                        $mdToast.show(toast);
                    
                    }) 

        }

        self.getTimeTillExpiry = function(fork){

            var time = fork.timed;

            var now = new Date();
            var daysLeft = Math.round( (time[1] - now.getTime())/86400000, 0 ); 
            fork.daysLeft = daysLeft;

            if(daysLeft < 0){
              fork.priority = 4; 
              return { msg: "The deadline for this space has passed", status: 'inactive'};
            }
            else if(daysLeft < 5){
              var msg = "";
              if(daysLeft < 1){
                fork.priority = 1; 
                msg = "Expires today!";
              }
              else if (daysLeft == 1){
                fork.priority = 1; 
                msg = "Expires in 1 day";
              }
              else{
                fork.priority = 2; 
                msg = "Expires in "  + daysLeft + " days";
              }

              return { msg: msg , status: 'warn'}
            }
            else {
              fork.priority = 3; 
              return { msg: "Expires in " + daysLeft + " days" , status: 'ok'}
            }

        }

  });



