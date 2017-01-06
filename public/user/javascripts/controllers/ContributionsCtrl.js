angular.module('studionet')

/*
 *  Main Contribution Graph Page
 * 
 */
.controller('ContributionsCtrl', ['$scope', '$stateParams', 'graph', 'users', 'supernode', 'ModalService', 'contribution', function($scope, $stateParams, graph, users, supernode, ModalService, contribution){

  // Initializations
  $scope.filterStatus = false; 

  // ----------------- Graphs
  // First Initialization of the graph on page-refresh
  $scope.graphInit = function(){  graph.getGraph(angular.element('#cy')[0]);  }

  // Highlight any state params
  var highlightStateParams = function(){
      // highlight node, if any in route params
      if($stateParams.contributionId && $scope.graph.getElementById( $stateParams.contributionId ) )
         graph.selectNode( $scope.graph.getElementById( $stateParams.contributionId) );
  }

  // Interaction on Single Click
  var onNodeSingleClick = function(evt){

        var node = evt.cyTarget;
        graph.selectNode(node);
        // select the node
        // preview
        if(node.data('qtip') == undefined){
          
          //console.log("Constructing new qtip");

          var qtipFormat = STUDIONET.GRAPH.qtipFormat(evt);
          var data = node.data();

          contribution.getContribution(data.id).then(function(res){

                var extra_data = res.data;

                qtipFormat.content.title =  extra_data.title;
                qtipFormat.content.text = generateQtipContent(extra_data);

                node.data('qtip', qtipFormat);
                node.data('db_data', extra_data);

                node.qtip(qtipFormat, evt);   
          });

        }
        else{
          //console.log("qtip already defined");
          node.qtip(node.data('qtip'), evt);
        }        
  }

  // Graph Interaction for Double Click
  var onNodeDoubleClick = function(evt){

        var node = evt.cyTarget;

        $scope.graph.elements().removeClass('highlighted');
        
        var data = node.data();

        var nodeTree = [];
        nodeTree.push(data);

        // if data is already defined, donot load again - directly show modal
        // db_data stores additional-data from the server
        if(node.data('db_data')){
          showDetailsModal( nodeTree, node.id() );
        }
        else{
          console.warn("Data not defined for selected node;");
          onNodeSingleClick(evt);
        }
  }

  // Function to generate the QTip content
  var generateQtipContent = function(extra_data){

      var profile = "<b>" +  users.getUser( extra_data.createdBy ).name  + "</b>";
      var date = "<br><em>" + (new Date(extra_data.dateCreated)).toString().substr(0, 10) + "</em>" ;
      var attachments = "<br><br><b><em>" + extra_data.attachments.length + " attachments</em></b>";
      var tags = "<br>" + JSON.stringify(extra_data.tags) + "<br>";
      var textSnippet = "<hr/>" + extra_data.body.substr(0,300);

      return profile + date + tags +( (extra_data.attachments[0].id == null) ? " " : attachments )  + textSnippet;                      
  }

  // Add graph interactions
  var addGraphInteractions = function(){

      // ---- Reattach interactions to the graph

      // remove supernode
      $scope.graph.getElementById(supernode.contribution).remove();

      // Display the entire node name
      $scope.graph.on('mouseover','node', function(evt){
        $scope.graph.elements().removeClass('fullname');
        evt.cyTarget.addClass('fullname');
      });

      // Shorten the node name
      $scope.graph.on('mouseout','node', function(evt){
        $scope.graph.elements().removeClass('fullname');
      });


      $scope.graph.on('tap', function(evt){
        if( !( evt.cyTarget.isNode && evt.cyTarget.isNode() ) )
            graph.removeAdditionalStyles();
        else if( evt.cyTarget.isNode && evt.cyTarget.id() == graph.activeNode )
            onNodeDoubleClick(evt);
        else if( evt.cyTarget.isNode() )
            onNodeSingleClick(evt);
        else
          console.warn("Undefined Interaction");
      });

  }

  // Observe the Graph Service for Changes and register observer
  var updateGraph = function(){
      $scope.graph = graph.graph;
      highlightStateParams();
      addGraphInteractions();

      console.log("Graph Updated");
  };
  graph.registerObserverCallback(updateGraph);


  // ------------- Zooming
  $scope.zoomLevel = "Calibrating...";
  var updateZoom = function(){
    if($scope.graph){
      $scope.zoomLevel = (100*$scope.graph.zoom()).toPrecision(4);
      $scope.$apply();
    }
  }
  setTimeout(updateZoom, 1000);
  document.getElementById("cy").addEventListener("wheel", updateZoom);


  /*
   * Deprecated - After filter changed to Dialog
   * Filter Visibilitiy Options controlled in this parent container for filter;
   */
  $scope.filterVisible = false;
  $scope.filterToggle = function(){
    $scope.filterVisible = !$scope.filterVisible;
  }



  //  ------------- Modals
  $scope.openNewContributionModal = function(){
      ModalService.showModal({

        templateUrl: "/user/templates/createContributionModal.html",
        controller: "CreateContributionCtrl",
        scope: $scope

      }).then(function(modal) {
          // activate modal
          modal.element.modal({ backdrop: 'static' });
      });
  } 

  var showDetailsModal = function(data, clickedContributionId) {
      ModalService.showModal({
        templateUrl: "/user/templates/home.graphView.modal.html",
        controller: "DetailsModalCtrl",
        scope: $scope
      }).then(function(modal) {
        modal.element.modal({
          backdrop: 'static'
        });
        modal.scope.setData(data, clickedContributionId);
      });
  };

    /*
   * Filter Visibilitiy Options controlled in this parent container for filter;
  $scope.filterVisible = false;
  $scope.filterToggle = function(){
    $scope.filterVisible = !$scope.filterVisible;
  }
   */
  $scope.filterToggle = function(){

      ModalService.showModal({

        templateUrl: "/user/templates/filterModal.html",
        controller: "FilterCtrl", 
        scope: $scope

      }).then(function(modal) {

          // activate modal
          modal.element.modal({ backdrop: 'static' });

          /// set data
          //modal.scope.setData(data,clickedContributionId);
      });
  }

}])

