MYAPP = {};

MYAPP.Creator = function () {
};
MYAPP.Creator.prototype = {
	createRenderer : function() {
		//var renderer = new THREE.CanvasRenderer( { antialias: false } );
		var renderer = new THREE.WebGLRenderer( { antialias: false } );
		renderer.setSize( window.innerWidth, window.innerHeight );
		return renderer;
	},	
	createCamera : function() {
		var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
		camera.position.z = 500;
		camera.position.x = 500;
		return camera;
	},
	createScene : function() {
		var scene = new THREE.Scene();
		return scene;
	},
	createControls : function( camera, render ) {
		var controls = new THREE.TrackballControls( camera );

		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;

		controls.noZoom = false;
		controls.noPan = false;

		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;

		controls.keys = [ 65, 83, 68 ];

		controls.addEventListener( 'change', render );
		
		return controls;
	},
	createStats : function() {
		var stats = new Stats();
		stats.domElement.style.position = 'absolute';
		stats.domElement.style.top = '0px';
		stats.domElement.style.zIndex = 100;
		return stats;
	},
	createAxes : function( axisLength, scene ) {
        //Shorten the vertex function
    	function v(x,y,z){ 
			return new THREE.Vertex(new THREE.Vector3(x,y,z)); 
    	}
    
    	//Create axis (point1, point2, colour)
    	function createAxis(p1, p2, color){
            var line, lineGeometry = new THREE.Geometry(),
            lineMat = new THREE.LineBasicMaterial({color: color, lineWidth: 1});
            lineGeometry.vertices.push(p1, p2);
            line = new THREE.Line(lineGeometry, lineMat);
            scene.add(line);
    	}
    
		createAxis(v(-axisLength, 0, 0), v(axisLength, 0, 0), 0xFF0000);
		createAxis(v(0, -axisLength, 0), v(0, axisLength, 0), 0x00FF00);
		createAxis(v(0, 0, -axisLength), v(0, 0, axisLength), 0x0000FF);
	}

};

MYAPP.Objects = {};
MYAPP.Objects.Sun = function(d,r) {
	this.r = r;
	var texture = THREE.ImageUtils.loadTexture('images/sun1.jpg');
	texture.needsUpdate = true;

    var material = new THREE.MeshLambertMaterial( { map: texture, color: 0xff0000 , shading: THREE.FlatShading  } );
    
	//var material = new THREE.MeshLambertMaterial( { color: 0xff0000 , shading: THREE.FlatShading});
	var geometry = new THREE.SphereGeometry( d, 20, 10  );
	this.mesh = new THREE.Mesh( geometry, material );
	this.mesh.dynamic = true;

	this.mesh.rotation.x = Math.PI/2;
	this.mesh.rotation.y = Math.PI/2;
		
	this.mesh.updateMatrix();
	this.mesh.matrixAutoUpdate = false;
};
MYAPP.Objects.Sun.prototype = {
	exec: function() {
		var phi = 0;
		return function () {
			this.mesh.rotation.y -= 0.01;

			phi += 0.01;
			if ( phi > Math.PI*2){
				phi = 0;
			}
		}
	}()
};
MYAPP.Objects.Triangle = function(r) {
	var geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
	var material =  new THREE.MeshLambertMaterial( { color:0xffffff, shading: THREE.FlatShading } );

	this.mesh = new THREE.Mesh( geometry, material );
	this.mesh.position.x = 0;
	this.mesh.position.y = 0;
	this.mesh.position.z = 0;
	
		
	this.mesh.updateMatrix();
	this.r = r;
};
MYAPP.Objects.Triangle.prototype = {
	exec: function() {
		var phi = 0;
		return function () {
			this.mesh.position.x = this.r * Math.cos(phi);
			this.mesh.position.y = this.r * Math.sin(phi);
			
			this.mesh.rotation.x += 0.01;
        	this.mesh.rotation.y += 0.02;
        
			phi += 0.01;
			if ( phi > Math.PI*2){
				phi = 0;
			}
		}
	}()
};

MYAPP.Objects.Earth = function(d,r,w,color,scene) {
	this.r = ( r !== undefined ) ? r : 10;
	this.d = ( d !== undefined ) ? d : 100;
	this.w = ( w !== undefined ) ? w : 0.1;
	this.phi = 0;
	this.scene = scene;
	
	this.isEnableTracking = true;
		
	var color = ( color !== undefined ) ? color : 0x000000;

	var material = new THREE.MeshLambertMaterial( { color: color, shading: THREE.FlatShading});
	var geometry = new THREE.SphereGeometry( d, 20, 10 );
	this.mesh = new THREE.Mesh( geometry, material );
	
	this.mesh.rotation.x = Math.PI/2;
	this.mesh.rotation.y = Math.PI/2;
	this.mesh.updateMatrix();
};
MYAPP.Objects.Earth.prototype = {
	exec: function() {
		return function () {
			this.mesh.position.x = this.r * Math.cos(this.phi);
			this.mesh.position.y = this.r * Math.sin(this.phi);

			this.mesh.rotation.y -= 0.02;

			this.phi += this.w;
			if (this.phi > Math.PI*2){
				this.phi = 0;
			}
		}
	}()
};

MYAPP.main = function() {
	var creator = new MYAPP.Creator();
	
	var scene = creator.createScene();

	var objects = [ new MYAPP.Objects.Sun(20,0) , 
		new MYAPP.Objects.Earth(7, 80, 0.05, 0x0000ff),
		new MYAPP.Objects.Earth(12, 160, 0.02, 0x220000),
		new MYAPP.Objects.Earth(12, 250, 0.03, 0x222000)];
	
	for ( var i = 0; i < objects.length; i++ ) {
		scene.add(objects[i].mesh);
	}
	
	creator.createAxes(200, scene);

	var light = new THREE.DirectionalLight( 0xffffff );
	light.position.set( 1, 1, 1 );
	scene.add( light );
//	light = new THREE.DirectionalLight( 0x002288 );
//	light.position.set( -1, -1, -1 );
//	scene.add( light );
	light = new THREE.AmbientLight( 0x555555 );
	scene.add( light );

	var camera = creator.createCamera();
	var controls = creator.createControls(camera, render);

	var renderer = creator.createRenderer();

	var container = $( 'div' ).attr('id','cardfield');
	$('body').append( container );

	container.append( renderer.domElement );
	
	var stats = creator.createStats();
	container.append( stats.domElement );

	window.addEventListener( 'resize', onWindowResize, false );
	


	$(window).load(function() {
		animate();
	});
	
	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		controls.handleResize();
	}

	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		render();
	}

	function render() {
		for ( var i = 0; i < objects.length; i++ ) {
			objects[i].exec();
		}
	
		renderer.render( scene, camera );
		stats.update();
	}	
}
