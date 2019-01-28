window.addEventListener('load', function(){
	
	var stats = new Stats();
	stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );

	var particles, particleMaterial, particleSystem;
	var geometry, material, object;
	var _stars, starMaterial, starSystem;
	var geoDetail, matDetail, sphereDetail;

	Array.prototype.max = function() {
		return Math.max.apply(null, this);
	};

	Array.prototype.min = function() {
		return Math.min.apply(null, this);
	};

	var randomRange = function(min, max){
		return min + Math.random() * (max-min);
	}

	var normSum = function(a,b,c){
		return (a - b) / (c - b) ;	 
	};

	function particleRender( context ) {
		context.beginPath();
		context.fillStyle = 'red';
		context.arc( 0, 0, 1, 0,  Math.PI * 2, true );
		context.fill();
	};

	/*Fonction qui recherche la valeur la plus proche dans un tableau
	a -> la valeur analysé
	b -> le tableau des valeurs à utiliser
	*/
	var closestVal = function(a,b){
		var dist = Math.abs(b[0] - a );
		var idx = 0;
		for( var i = 1; i < b.length; i++ ){
			var idist = Math.abs( b[i] - a );
			if( idist < dist ){
				idx = i;
				distance = -idist;
			}
		}
		return  b[idx];
	};

	var randSat = function(){
		return Math.random()*.5 + .5;
	}

	var randLum = function(){
		return Math.random()*.5 + .35;
	}

	var coord = function(x,y,s){
		return y*s+x;
	}

	var color = [
	{ h : .6, s : .5, v: .5 },
	{ h : .16, s : .5, v: .5 },
	{ h : .18, s : .5, v: .5 },
	{ h : .2, s : .5, v: .5 },
	{ h : .21, s : .5, v: .5 },
	{ h : .22, s : .5, v: .5 },
	{ h : .23, s : .5, v: .5 },
	{ h : .24, s : .4, v: .5 },
	{ h : .25, s : .25, v: .5 },
	{ h : .26, s : .1, v: .5 },
	{ h : .27, s : 0, v: .9 }
	];

	var planet = {
		nbrVertices : 512,
		radius :  150,
		initPos : [],
		octave : 256,
		amplitude : 5,
		noiseIteration : 6,
		turbColor : [],
		seaLevel : .5,
		mountainLevel:  .9,
		poleSize : 50,
		colorSurface : {},
		ArrayIndex : [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ],
		thermalErosionFactor : 25,
		hydraulicErosionFactor : 50,
		HeightMap : [],
		Water_table : [],
		Sediment_Table : [],
		create : function(){	
			var obj = Object.create(this);
			// obj.setCubeMesh();
			// obj.setPlaneMesh();
			obj.setSphereMesh();
			return obj;
		},
		setPlaneMesh : function(){
			geometry = new THREE.PlaneGeometry( this.radius, this.radius, this.nbrVertices, this.nbrVertices );
			for(var i= 0; i < geometry.vertices.length; i++ ){
				var coord = geometry.vertices[i];
				this.initPos.push( {_X : coord.x, _Y : coord.y, _Z : this.radius } );
			}
			material = new THREE.MeshPhongMaterial( { vertexColors: THREE.FaceColors, wireframe: false, shading: THREE.SmoothShading, shininess : 0 } );
			object = new THREE.Mesh( geometry, material );
			scene.add( object );
		},
		setSphereMesh : function(){
			geometry = new THREE.SphereGeometry( this.radius, this.nbrVertices, this.nbrVertices );
			for(var i= 0; i < geometry.vertices.length; i++ ){
				var coord = geometry.vertices[i];
				this.initPos.push( {_X : coord.x, _Y : coord.y, _Z : coord.z } );
			}
			material = new THREE.MeshPhongMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors, wireframe: false, shading: THREE.SmoothShading, shininess : 0 } );
			object = new THREE.Mesh( geometry, material );
			scene.add( object );
		},
		setCubeMesh : function(){
			geometry = new THREE.BoxGeometry( this.radius, this.radius, this.radius, this.nbrVertices, this.nbrVertices, this.nbrVertices );
			for(var i= 0; i < geometry.vertices.length; i++ ){
				var coord = geometry.vertices[i];
				// this.initPos.push( {_X : coord.x, _Y : coord.y, _Z : coord.z } );
				var spheredPoints = this.spherizer( coord.x, coord.y, coord.z);
			}
			material = new THREE.MeshPhongMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors, wireframe: false, shading: THREE.FlatShading, shininess : 0 } );
			object = new THREE.Mesh( geometry, material );
			scene.add( object );
		},
		spherizer : function(x,y,z){		
			/*Fonction de transformation d'un cube en sphere*/
			var radius = this.radius;
			lengthSphere = Math.sqrt( x*x + y*y + z*z );
			var sX = (x / lengthSphere) * radius;
			var sY = (y / lengthSphere) * radius;
			var sZ = (z / lengthSphere) * radius;
			this.initPos.push( { _X : sX, _Y : sY, _Z: sZ } );
			return { _X : sX, _Y : sY, _Z : sZ};
		},
		turbCoord : function(){
			this.turbColor = [];
			for( var i = 0; i < this.initPos.length; i++ ){	
				var originalCoord=  this.initPos[i];
				var NoiseX = NoiseY = NoiseZ = 1;
				var noiseIteration = this.noiseIteration,
				octave = this.octave,
				octaveVar = 2;
				var sumNoise = coutnIteration = 0;
				for(var j =0; j < noiseIteration; j++ ){
					var tempNoise = noise.simplex3( originalCoord._X/octave, originalCoord._Y/octave, originalCoord._Z/octave );
					tempNoise+=1;
					tempNoise/=2;
					sumNoise += tempNoise / noiseIteration;
					octave /= octaveVar;
				}
				var IcePole = this.poleWeight( originalCoord._Y, sumNoise );
				IcePole *= sumNoise;
				sumNoise += IcePole;
				var VerticesVal = normSum( sumNoise, this.seaLevel, this.mountainLevel);
				this.turbColor.push( { HeightMap : VerticesVal, LandSea : sumNoise} );

				this.Water_table.push(0);
				this.Sediment_Table.push(0);
			}
			this.thermalErosion();
			//this.hydraulicErosion();
		},
		poleWeight : function(a,b){
			var Ice = 1;
			if( a > this.radius-this.poleSize*b ) Ice = normSum( a, this.radius-this.poleSize*b, this.radius ) ;
			if( a < this.radius-this.poleSize*b ) Ice = 0;
			if( a < -this.radius + this.poleSize*b ) Ice = normSum( a, -this.radius + this.poleSize*b, -this.radius ) ;
			return Ice;
		},
		thermalErosion : function(){
			var T = 4/this.nbrVertices,
			arrayErode =[ 1, -1, this.nbrVertices, -this.nbrVertices, this.nbrVertices+1, this.nbrVertices-1, -this.nbrVertices+1, -this.nbrVertices-1 ];
			for( var j = 0; j < this.thermalErosionFactor; j++ ){	
				for( var i = 0; i < this.initPos.length; i++ ){	
					var HM_original = this.turbColor[i].HeightMap;
					for( var k =0; k < arrayErode.length; k++){
						var key = i + arrayErode[k];
						var dTotal = 0;
						var dMax = 0;
						var test = 0;
						if( this.turbColor[key] != undefined){
							var diff = HM_original - this.turbColor[key].HeightMap;	
							if( diff > T ){
								dTotal += diff;
								if( diff <= dMax ) dMax = diff;
								this.turbColor[i].HeightMap +=  0.1*(dMax - T ) * diff/dTotal ;
							}
						}
					}
				}
			}
		},
		hydraulicErosion : function(){
			var T = 4/this.nbrVertices,
			arrayErode =[ 1, -1, this.nbrVertices, -this.nbrVertices, this.nbrVertices+1, this.nbrVertices-1, -this.nbrVertices+1, -this.nbrVertices-1 ];
			var Water_amount = 0.01;
			var Solubility_amount = 0.01;
			var Evaporation_amount = 0.5;
			var Sediment_capacity = 0.01;
			for( var j = 0; j < this.hydraulicErosionFactor; j++ ){
				for( var i = 0; i < this.initPos.length; i++ ){	
					var HM_original = this.turbColor[i].HeightMap;
					this.Water_table[i] += Water_amount;
					this.turbColor[i].HeightMap -= Solubility_amount * this.Water_table[i];
					this.Sediment_Table[i] += Solubility_amount * this.Water_table[i];
					var dTotal = 0;
					var dMin = 0;
					for( var k =0; k < arrayErode.length; k++){
						var key = i + arrayErode[k];
						if( this.turbColor[key] != undefined){
							var diff = this.turbColor[i].HeightMap - this.turbColor[key].HeightMap;
							if( diff > dMin ) dMin = diff, dTotal += diff;
						}
					}
					// var deltaDiff = dTotal / arrayErode.length;
					// var Moved_Water = Math.min( this.Water_table[i], deltaDiff) * (diff/dTotal);
					// var Sediment_amount = this.Sediment_Table[i] * (Moved_Water/this.Water_table[i]);
					// this.Water_table[i] *= 1 - Evaporation_amount;
					// var maxSediment = this.Water_table[i] * Sediment_capacity;
					// var SedimCapactity = Math.max(0, this.Sediment_Table[i] - maxSediment);
					// this.Sediment_Table[i] -= SedimCapactity;
					// this.turbColor[i].HeightMap += SedimCapactity;
				}
			}
		},
		changeColor : function(){
			var faceIndex = [ 'a', 'b', 'c' ];
			for(var k = 0; k < geometry.faces.length; k++ ){
				var totHue = totSat = totLum = totVertVal = HM = 0;
				for( var l = 0; l < 3; l++ ) {
					var VertexIndex = geometry.faces[k][faceIndex[l]];
					var sumNoise = this.turbColor[VertexIndex].LandSea;
					HM = this.turbColor[VertexIndex].HeightMap;
					var idxClosest = closestVal( HM*10, this.ArrayIndex );
					if( idxClosest == 0 ) HM = 0 ;
					this.displacement(VertexIndex,HM);
				}
				totHue = color[idxClosest].h;
				totSat = color[idxClosest].s;
				totLum = sumNoise*color[idxClosest].v;
				geometry.faces[k].color.setHSL( totHue, totSat, totLum );
			}
		},
		displacement : function(a,b){
			var originalCoord = this.initPos[a];
			var noiseX = (b / this.radius)  * originalCoord._X;
			var noiseY = (b / this.radius)  * originalCoord._Y;
			var noiseZ= (b / this.radius)  * originalCoord._Z;

			var displX = originalCoord._X + ( noiseX * this.amplitude);
			var displY = originalCoord._Y + ( noiseY * this.amplitude);
			var displZ = originalCoord._Z + ( noiseZ * this.amplitude);
			geometry.vertices[a].x = displX;
			geometry.vertices[a].y = displY;
			geometry.vertices[a].z = displZ;
		}
	};

	var stars = {
		nbrStars : 500,
		create : function(){
			_stars = new THREE.Geometry;
			starMaterial = new THREE.PointsMaterial( { size : 3 , fog: false} ) ;
			starSystem = new THREE.Points(_stars, starMaterial);

			for(var i = 0; i < this.nbrStars; i ++ ){

				var tempX = Math.random()*2 - 1;
				var tempY = Math.random()*2 - 1;
				var tempZ = Math.random()*2 - 1;
				var lengthSphere = Math.sqrt( tempX*tempX + tempY*tempY + tempZ*tempZ );
				var radius = Math.random()*500 + 1000;
				var posX  = (tempX/lengthSphere) * (radius+10);
				var posY  = (tempY/lengthSphere) * (radius+10);
				var posZ  = (tempZ/lengthSphere) * (radius+10);

				var star = new THREE.Vector3( posX, posY, posZ );
				_stars.vertices.push(star);
			}
			scene.add(starSystem);
		}
	}

	var noiseMotion = Math.random()*1000,
	update = false;
	noise.seed( Math.random() );

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 90, window.innerWidth/window.innerHeight, 0.1, 1500 );
	scene.fog = new THREE.FogExp2( 0x000003 , 0.0025);
	camera.position.z = 300;
	var renderer = new THREE.WebGLRenderer( {alpha: true, antialias: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	var controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 0.25;
	controls.enableZoom = true;


	// ambient
	scene.add( new THREE.AmbientLight( 0x999999 ) );

    // light
    var light = new THREE.DirectionalLight( 0xcccccc, 2 );
    light.position.set( 20, 5, 10 );
    scene.add( light );

    theStars = stars.create();
    thePlanet = planet.create();
    light.target = object;

    var terraForming = function(){
    	//thePlanet.diamondSquare();
    	thePlanet.turbCoord();
    	thePlanet.changeColor();
    	object.geometry.verticesNeedUpdate = true;
    	object.geometry.colorsNeedUpdate = true;
    	// render();

    };

    var render = function () {
    	requestAnimationFrame( render );
    	stats.begin();
   		//controls.update();
   		renderer.render(scene, camera);
   		object.rotation.x = -Math.PI*.5;
   		// object.rotation.x += 0.001;
   		// object.rotation.y += 0.0025;

   		stats.end();
   	};
   	terraForming();

   	render();

   	var seed = { Seed : function(){noise.seed(Math.random());terraForming();} };

   	var gui = new dat.GUI();

   	gui.add(seed, 'Seed');

   	var f1 = gui.addFolder('Relief');
   	f1.add(thePlanet, 'octave').min(0).max(500).step(1).onChange(function(newValue){thePlanet.octave = newValue, terraForming();});
   	f1.add(thePlanet, 'amplitude', 0, 25).onChange(function(newValue){thePlanet.amplitude = newValue, terraForming();});
   	f1.add(thePlanet, 'noiseIteration').min(1).max(10).step(1).onChange(function(newValue){thePlanet.noiseIteration = newValue, terraForming();});
   	f1.add(thePlanet, 'seaLevel', 0, 1).onChange(function(newValue){thePlanet.seaLevel = newValue, terraForming();});
   	f1.add(thePlanet, 'mountainLevel', 0, 1).onChange(function(newValue){thePlanet.mountainLevel = newValue, terraForming();});
   	f1.add(thePlanet, 'poleSize', 0, 150).onChange(function(newValue){thePlanet.poleSize = newValue, terraForming();});
   	f1.add(thePlanet, 'thermalErosionFactor', 0, 50).onChange(function(newValue){thePlanet.thermalErosionFactor = newValue, terraForming();});

    // var f2 = gui.addFolder('Color');
    // for( var i = 0; i < color.length; i++ ){
    // 	f2.addColor(color, i).onChange(function(newValue){terraForming(); console.log( color );});
    // }

	//window.addEventListener('keydown', function(event){});
	//window.addEventListener('keyup', function(){});
	//window.addEventListener('click', function(){});

	//window.addEventListener('mousemove', function(event){requestAnimationFrame( render );});

});