var width = window.innerWidth,
height =  window.innerHeight;
var ctxFX;
var canvasFX;
var canvasFX1;
var ctxFX1;
var arrayCanvas;

var FX = function(){

	arrayCanvas = document.getElementsByTagName('canvas');

	for( var i=0; i < arrayCanvas.length; i++ ){
		arrayCanvas[i].style.display='none';
	}

	canvasFX = document.createElement('canvas');
	canvasFX.setAttribute('id','canvasFX');
	document.body.appendChild(canvasFX);

	var cFX = canvasFX;
	ctxFX = cFX.getContext('2d');
	cFX.width = width;
	cFX.height = height;

	canvasFX1 = document.createElement('canvas');
	canvasFX1.setAttribute('id','canvasFX1');
	document.body.appendChild(canvasFX1);

	var cFX1 = canvasFX1;
	ctxFX1 = cFX1.getContext('2d');
	cFX1.width = width;
	cFX1.height = height;
}

var FXrecupData = function(){

	ctxFX.clearRect( 0, 0, width, height );
	ctxFX1.clearRect( 0, 0, width, height );
	
	for( var i=0; i < arrayCanvas.length; i++ ){
		ctxFX.drawImage( arrayCanvas[i] , 0, 0 );
	}

	ctxFX1.drawImage( canvasFX , 0, 0 );
	canvasFX1.style.filter = 'blur(5px)';

}
