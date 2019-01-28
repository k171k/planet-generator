var mirorNbr =  24;
var width = window.innerWidth,
height =  window.innerHeight;


var mouseX = 0;
var mouseY = 0;
var ctxKaleid;

var mainScale = 1;

/***********************
Foncion de creation des elements du kaleidoscope
***********************/
var Kaleidoscope = function(){
	var angle = 0;
	var delta = 360/mirorNbr;
	
	var scaleX = mainScale;
	var scaleY = mainScale;
	for(var i=0; i< mirorNbr; i++){
		var canvasKaleid = document.createElement('canvas');
		canvasKaleid.setAttribute('id','kaleid'+i);
		document.body.appendChild(canvasKaleid);
		canvasKaleid.width = width;
		canvasKaleid.height = height;

		ctxKaleid = canvasKaleid.getContext('2d');
		
		angle += delta;
		scaleX *= -1;
		scaleY *= 1;

		ctxKaleid.translate( width/2 , height/2);
		ctxKaleid.scale( scaleX, scaleY);
		ctxKaleid.rotate( angle * Math.PI/180 );
		ctxKaleid.translate( 0 , -height/2 );
	}
}

/***************************
Affichage du kaleidoscope 
c => le canvas source
***************************/
var applyKaleidoscope = function(c){

	for(var i=0; i< mirorNbr; i++){
		var canvasKaleid = document.getElementById('kaleid'+i);
		var ctxKaleid = canvasKaleid.getContext('2d');

		ctxKaleid.clearRect( 0 , 0, width, height );

		drawKaleid(ctxKaleid);

		ctxKaleid.globalCompositeOperation = 'source-in';
		ctxKaleid.drawImage(c, 0 , 0);

		ctxKaleid.globalCompositeOperation = 'lighter';

	}
	var ctx = c.getContext('2d');
	ctx.clearRect(0, 0, width, height);
}

/***************************
Tracage des triangles, permettant le kaleidoscope
***************************/
var drawKaleid = function(c){
	var angle = 0;
	var delta = 360/mirorNbr;

	c.fillStyle = 'black';

	c.beginPath();
	c.moveTo( 0, height/2 );

	var rotateX = width*Math.cos( (delta*2)* Math.PI/180) + width;
	var rotateY = -width*Math.sin( (delta*2)* Math.PI/180) + height;
	c.lineTo( rotateX , rotateY/2 );

	var rotateX = width*Math.cos(-(delta*2)* Math.PI/180) + width;
	var rotateY = -width*Math.sin(-(delta*2)* Math.PI/180) + height;
	c.lineTo( rotateX , rotateY/2 );

	c.closePath();
	c.fill();
}



