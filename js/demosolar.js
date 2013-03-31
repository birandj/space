/**
 * Created with JetBrains WebStorm.
 * User: birandj
 * Date: 23.03.13
 * Time: 20:28
 * To change this template use File | Settings | File Templates.
 */
var MYAPP = {
};

MYAPP.debugaxis = function(axisLength, scene){
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
};


MYAPP.Creator = function() {}
MYAPP.Creator.prototype = {
	sceneCreator : function () {
		var scene = new THREE.Scene();
		MYAPP.debugaxis(200,scene);
		return scene;
	},
	cameraCreator : function () {
		var camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
		//camera.position.set( 0, 175, 250 );
		//camera.
		/*new THREE.TrackballCamera({
			fov:45,
			aspect:window.innerWidth / window.innerHeight,
			near:1,
			far:10000,
			rotateSpeed:1.0,
			zoomSpeed:1.2,
			panSpeed:0.8,
			noZoom:false,
			noPan:false
		});*/
		//устанавливаем камере позицию, немного разворачиваем её, чтобы она смотрела на нашу плоскость
		camera.position.z = 250;
		camera.position.y = 0;
		//camera.target.position.y = -75;

		return camera;
	},
	lightCreate : function () {
		//устанавливаем белый свет

		var light = new THREE.PointLight(0xffffff);
		//var light = new THREE.AmbientLight(0x444444);
		//да, объекты должны отбрасывать тень
		light.castShadow = true;
		//сам пол у нас в -150, свет соотв. ставим выше (в 1 по y и 0 по x и z), чтобы он попадал на наш куб и заставлял его отбрасывать тень
		//напомню, что свет двигается от указанной точки к началу координат
		light.position.set(0, 30, 0);

		return light;
	},
	light2Create : function () {
		var light = new THREE.AmbientLight(0x444444);
		return light;
	},
	controlCreate : function(render, camera) {
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
	}
}

MYAPP.Executer = function ( o ) {
	this.obj_array = o;
}
MYAPP.Executer.prototype = {
	exec : function(){
		for( var i = 0; i < this.obj_array.length; i++){
			this.obj_array[i].exec();
		}
	}
}

MYAPP.start = function () {


	var renderer = new THREE.WebGLRenderer( { antialias: false } );
	//renderer.setClearColor( scene.fog.color, 1 );
	renderer.setSize( window.innerWidth, window.innerHeight );

	var container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );

	var creator = new MYAPP.Creator();


	var scene = creator.sceneCreator();
	var camera = creator.cameraCreator();
	var light = creator.lightCreate();
	var object = new MYAPP.MyEarth();


	//добавляем к сцене
	scene.add(object.mesh);
	scene.add(light);
	//scene.add(creator.light2Create());

	var executer = new MYAPP.Executer([object]);

	var controls = creator.controlCreate(renderer,camera);
	window.addEventListener( 'resize', onWindowResize, false );

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

		controls.handleResize();

		render();

	}

	animate();

	function animate() {
		requestAnimationFrame(animate);
		//controls.update();
		render();
	}

	function render() {
		executer.exec();
		renderer.render(scene, camera);
	}
}
