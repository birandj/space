/**
 * Created with JetBrains WebStorm.
 * User: birandj
 * Date: 23.03.13
 * Time: 20:28
 * To change this template use File | Settings | File Templates.
 */
var MYAPP = {
};


MYAPP.MyCube = function() {
	var materials = [
		//делаем каждую сторону своего цвета
		new THREE.MeshBasicMaterial({ color:0xE01B4C }), // правая сторона
		new THREE.MeshBasicMaterial({ color:0x34609E }), // левая сторона
		new THREE.MeshBasicMaterial({ color:0x7CAD18 }), //верх
		new THREE.MeshBasicMaterial({ color:0x00EDB2 }), // низ
		new THREE.MeshBasicMaterial({ color:0xED7700 }), // лицевая сторона
		new THREE.MeshBasicMaterial({ color:0xB5B1AE }) // задняя сторона
	];
	//создаем куб со стороной 50 и размерами сегментов 1, применяем к нему массив материалов
	var cube = new THREE.CubeGeometry(50, 50, 50, 1, 1, 1, materials);
	//создаем мэш для куба, в качестве материала мэша
	//будет браться тот, который применен к кубу
	this.mesh = new THREE.Mesh(cube, new THREE.MeshFaceMaterial());
	//указываем позицию по оси y
	this.mesh.position.y = -10;
	//добавляем тень кубу
	new THREE.ShadowVolume(this.mesh);
}
MYAPP.MyCube.prototype = {
	exec : function() {
		var phi = 0;
		return function() {
			//вращаем куб по всем трем осям (переменная мэша куба доступна глобально)
			this.mesh.rotation.x += 0.5 * Math.PI / 90;
			this.mesh.rotation.y += 1.0 * Math.PI / 90;
			this.mesh.rotation.z += 1.5 * Math.PI / 90;
			//двигаем куб по кругу
			this.mesh.position.x = Math.sin(phi) * 50;
			this.mesh.position.y = Math.cos(phi) * 50;
			//итерируем глобальную переменную
			phi += 0.05;
		}
	}()
}

MYAPP.Creator = function() {}
MYAPP.Creator.prototype = {
	sceneCreator : function () {
		var scene = new THREE.Scene();

		//создаем наш "пол". Это будет псевдокуб со сторонами в 600х600 и глубиной 5
		var floorgeo = new THREE.CubeGeometry(600, 600, 5);
		//создаем мэш для него с материалом заданного цвета и прозрачностью
		var floormesh = new THREE.Mesh(floorgeo, new THREE.MeshBasicMaterial({color:0x248C0F, opacity:0.9}));
		//устанавливаем позицию нашему полу
		floormesh.position.y = -200;
		//и разворачиваем его по оси х так, чтобы он был параллелен ей.
		floormesh.rotation.x = 90 * Math.PI / 180;
		//добавляем к сцене
		scene.addChild(floormesh);

		return scene;
	},
	cameraCreator : function () {
		var camera = new THREE.TrackballCamera({
			fov:45,
			aspect:window.innerWidth / window.innerHeight,
			near:1,
			far:10000,
			rotateSpeed:1.0,
			zoomSpeed:1.2,
			panSpeed:0.8,
			noZoom:false,
			noPan:false
		});
		//устанавливаем камере позицию, немного разворачиваем её, чтобы она смотрела на нашу плоскость
		camera.position.z = 250;
		camera.position.y = 175;
		camera.target.position.y = -75;

		return camera;
	},
	lightCreate : function () {
		//устанавливаем белый свет
		var light = new THREE.DirectionalLight(0xffffff);
		//да, объекты должны отбрасывать тень
		light.castShadow = true;
		//сам пол у нас в -150, свет соотв. ставим выше (в 1 по y и 0 по x и z), чтобы он попадал на наш куб и заставлял его отбрасывать тень
		//напомню, что свет двигается от указанной точки к началу координат
		light.position.set(0, 1, 0);

		return light;
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
	var container = $('div').attr('id', 'cardfield');
	$('body').append(container);

	var creator = new MYAPP.Creator();


	var scene = creator.sceneCreator();
	var camera = creator.cameraCreator();
	var light = creator.lightCreate();
	var object = new MYAPP.MyCube();

	//добавляем к сцене
	scene.addChild(object.mesh);
	scene.addChild(light);

	var executer = new MYAPP.Executer([object]);


	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(window.innerWidth, window.innerHeight);
	container.append(renderer.domElement);

	animate();

	function animate() {
		requestAnimationFrame(animate);
		render();
	}

	function render() {
		executer.exec();
		renderer.render(scene, camera);
	}
}
