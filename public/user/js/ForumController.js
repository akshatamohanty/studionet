angular.module('studionet')

.controller('forumController', ['$scope', 'GraphService', 'users', function($scope, GraphService, users){

									$scope.list = [];
									$scope.nodeHash = [];
									$scope.usersHash = users.usersHash;

									$scope.$watch('forumActive', function(newValue, oldValue) {

										if(GraphService.graph == undefined)
											return;


										var nodes_list = GraphService.graph.nodes();
										for(var i=0; i < nodes_list.length; i++){

											var node = nodes_list[i];
											$scope.nodeHash[ node.id ] = node;

											node.data('nodes', node.incomers().map(function(c){ return c.data(); }));

											if(node.outgoers().length == 0)
												$scope.list.push( node.data() );

										}


								    });


									/*$scope.list = [
									  {
									    "id": 1,
									    "title": "node1",
									    "collapsed": false,
									    "nodes": [
									      {
									        "id": 11,
									        "title": "node1.1",
									        "nodes": [
									          {
									            "id": 111,
									            "title": "node1.1.1",
									            "nodes": []
									          }
									        ]
									      },
									      {
									        "id": 12,
									        "title": "node1.2",
									        "nodes": []
									      }
									    ]
									  },
									  {
									    "id": 2,
									    "title": "node2",
									    "nodrop": true,
									    "nodes": [
									      {
									        "id": 21,
									        "title": "node2.1",
									        "nodes": []
									      },
									      {
									        "id": 22,
									        "title": "node2.2",
									        "nodes": []
									      }
									    ]
									  },
									  {
									    "id": 3,
									    "title": "node3",
									    "nodes": [
									      {
									        "id": 31,
									        "title": "node3.1",
									        "nodes": []
									      }
									    ]
									  }
									]*/




}]);
