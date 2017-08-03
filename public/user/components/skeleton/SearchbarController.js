// search bar
angular.module('studionet')
      .controller('searchbarCtrl', function DemoCtrl ($timeout, $q, tags, $mdDialog, $scope, $mdToast, routerUtils) {

          var self = this;

          function init(){
            self.readonly = false;
            self.selectedItem = null;
            self.searchText = null;
            self.querySearch = querySearch;
            self.vegetables = loadVegetables();
            self.selectedVegetables = [];
            self.autocompleteDemoRequireMatch = true;
            self.transformChip = transformChip;
            self.runSearch = runSearch;
          } 

          init();
          tags.registerObserverCallback(function(){ init(); } );

          function runSearch(){
            console.log("running search");
            $scope.goToSpaceWithArgs($scope.query);
          }

          /**
           * Return the proper object when the append is called.
           */
          function transformChip(chip) {
            // If it is an object, it's already a known chip
            if (angular.isObject(chip) && chip.function == undefined) {
              chip.selected = true;
              return chip;
            }
            else{
              var flag = false;

              for(var i=0; i < tags.tags.length; i++){

                  var t = tags.tags[i];

                  if (t.name == chip){
                    var toast = $mdToast.simple()
                      .textContent('Oops.. this tag already exists!')
                      .position("bottom left")

                    $mdToast.show(toast);
                    return t;
                  }
                
              }

              var new_tag = {name: (chip.query ? chip.query: chip)};


              // create a new tag
              if(flag == false){

                  var confirm = {
                     parent: angular.element(document.body),
                     template:
                           '<md-dialog aria-label="new tag dialog" style="height: 200px; width: 350px;">' +
                           '  <md-dialog-content style="padding: 30px;">\
                                <md-input-container style="margin: 0 auto; width: 100%;">\
                                  <form name="myForm" ng-submit="createTag(myForm.new_tag.$modelValue)">\
                                    <label>Create a new tag..</label>\
                                    <input type="text" ng-model="new_tag" name="new_tag" ng-pattern="/^[a-zA-Z0-9]*$/" ng-trim="false" required>\
                                      <span ng-show="myForm.new_tag.$error.pattern">Spaces and special characters are not allowed in tags</span>\
                                  </form>    \
                                </md-input-container>' +
                           '  </md-dialog-content>' +
                           '  <md-dialog-actions>' +
                           '   <md-button type="submit" value="submit" ng-click="createTag(myForm.new_tag.$modelValue)" ng-disabled="newtag.length==0 || myForm.new_tag.$error.pattern" aria-label="description" md-no-ink="true" md-ripple-size="auto">\
                                  Create</md-button>' +
                           '    <md-button ng-click="closeDialog()" class="md-primary">' +
                           '      Cancel' +
                           '    </md-button>' +
                           '  </md-dialog-actions>' +
                           '</md-dialog>',
                      controller: DialogController
                  }

                  function DialogController($scope, $mdDialog, tags) {
                    $scope.new_tag = new_tag.name;
                    $scope.closeDialog = function(data) {
                        $mdDialog.hide();
                    }
                    $scope.createTag = function(input){
                      tags.createTag(input).success(function(data){
                          new_tag = data[0];
                          $scope.closeDialog(data[0]);
                          var toast = $mdToast.simple()
                            .textContent('Tag was successfully created!')
                            .position("bottom left")

                          $mdToast.show(toast);
                      }, function(){
                          var toast = $mdToast.simple()
                            .textContent('Error occured while creating the tag.')
                            .position("bottom left")

                          $mdToast.show(toast);
                      })

                    }
                  }

                  $mdDialog.show(confirm).then(function(){
                        
                        $scope.query.tags.pop();
                        
                        if(new_tag.id)
                          $scope.query.tags.push(new_tag);

                  });

              }

              return new_tag;

            }

          }

          /**
           * Search for vegetables.
           */
          function querySearch (query) {


            var results = query ? self.vegetables.filter(createFilterFor(query)) : [];
            
            var selected = false;
            for(var i=0;  i < $scope.query.tags.length; i++){
                if($scope.query.tags[i].name == query){
                  selected = true; 
                  break;
                }
            }


            // push the add new tag chip
            if(results.length == 0 && selected == false) results.push({ name: 'Add a tag: ' + query, function: true, query: query });

            return results;

          }

          /**
           * Create filter function for a query string
           */
          function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);

            return function filterFn(vegetable) {
              var selected = false;
              for(var i=0;  i < $scope.query.tags.length; i++){
                  if($scope.query.tags[i].id == vegetable.id){
                    selected = true; 
                    break;
                  }
              }

              return (vegetable._lowername.indexOf(lowercaseQuery) === 0 && selected == false);

            };

          }

          function loadVegetables() {

            var veggies = tags.tags;


            return veggies.map(function (veg) {
              veg._lowername = veg.name.toLowerCase();
              return veg;
            });
          }


});
