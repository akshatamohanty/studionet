angular.module('studionet')
  .directive('objdirective', function () {
    return {
      restrict: 'A',
      scope: {
        'width': '=',
        'height': '=',
        'fillcontainer': '=',
        'scale': '=',
        'materialType': '='
        'filename' : '='
      },
      link: function postLink(scope, element, attrs) {

        var camera, scene, renderer, controls,
          shadowMesh, icosahedron, light,

          mouseX = 0, mouseY = 0,
          contW = (scope.fillcontainer) ?
            element[0].clientWidth : scope.width,
          contH = scope.height,
          windowHalfX = contW / 2,
          windowHalfY = contH / 2,
          materials = {};

        var SCREEN_WIDTH = 320,
        SCREEN_HEIGHT = 240;

        scope.init = function () {

          // create main scene
          scene = new THREE.Scene();

          // Camera
          var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 2000;
          camera = new THREE.PerspectiveCamera( 20, contW / contH, 1, 10000 );
          camera.position.set(0, 320, 240);

          // Ligthing
          light = new THREE.DirectionalLight( 0xffffff );
          light.position.set( 0, 0, 1 );
          scene.add( light );

          // Shadow
          var canvas = document.createElement( 'canvas' );
          canvas.width = 128;
          canvas.height = 128;

         // prepare renderer
          renderer = new THREE.WebGLRenderer( { antialias: true } );
          renderer.setClearColor( 0xffffff );
          renderer.setSize( contW, contH );


          // element is provided by the angular directive
          element[0].appendChild( renderer.domElement );

          document.addEventListener( 'mousemove', scope.onDocumentMouseMove, false );

          window.addEventListener( 'resize', scope.onWindowResize, false );

          this.loadModel();
        };


        scope.loadModel = function() {

       // prepare loader and load the model
        var oLoader = new THREE.OBJLoader();
        oLoader.load('filename', function(object, materials) {

        // var material = new THREE.MeshFaceMaterial(materials);
        var material2 = new THREE.MeshLambertMaterial({ color: 0xa65e00 });

        object.traverse( function(child) {
          if (child instanceof THREE.Mesh) {

          // apply custom material
          child.material = material2;

          // enable casting shadows
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      object.position.x = 0;
      object.position.y = 0;
      object.position.z = 0;
      object.scale.set(5, 5, 5);
      scene.add(object);
    });
  };
        // -----------------------------------
        // Event listeners
        // -----------------------------------
        scope.onWindowResize = function () {

          scope.resizeCanvas();

        };

        scope.onDocumentMouseMove = function ( event ) {

          mouseX = ( event.clientX - windowHalfX );
          mouseY = ( event.clientY - windowHalfY );

        };

        // -----------------------------------
        // Updates
        // -----------------------------------
        scope.resizeCanvas = function () {

          contW = (scope.fillcontainer) ?
            element[0].clientWidth : scope.width;
          contH = scope.height;

          windowHalfX = contW / 2;
          windowHalfY = contH / 2;

          camera.aspect = contW / contH;
          camera.updateProjectionMatrix();

          renderer.setSize( contW, contH );

        };

        scope.resizeObject = function () {

          icosahedron.scale.set(scope.scale, scope.scale, scope.scale);
          shadowMesh.scale.set(scope.scale, scope.scale, scope.scale);

        };

        scope.changeMaterial = function () {

          icosahedron.material = materials[scope.materialType];

        };


        // -----------------------------------
        // Draw and Animate
        // -----------------------------------
        scope.animate = function () {

          requestAnimationFrame( scope.animate );

          scope.render();

        };

        scope.render = function () {

          camera.position.x += ( mouseX - camera.position.x ) * 0.05;
          camera.position.y += ( - mouseY - camera.position.y ) * 0.05;

          camera.lookAt( scene.position );

          renderer.render( scene, camera );

        };

        // Begin
        scope.init();
        scope.animate();

      }
    };
  });
