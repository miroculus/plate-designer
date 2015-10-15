var canvas = document.getElementById('plate');
var graphics = canvas.getContext('2d');


var hoveredCircle = undefined;

var Circle = function(x, y, size, position){
  var x = x;
  var y = y;
  var size = size;
  var selected = false;
  var highlighted = false;
  var cont = 0;
  
  var target;
  var sample;
  var position = position;
  var group1;
  var group2;


  function draw(g){
    if(highlighted){
      g.strokeStyle = '#00FF00';      
    }
    else if(selected){
      g.strokeStyle = '#00FFFF';      
    }else{
      g.strokeStyle = '#0000FF';
    }
    g.beginPath();
    g.arc(x, y, 10, 0, 2*Math.PI);
    g.stroke();
  }
  
  function checkCollision(targetX, targetY){
    return Math.pow(x-targetX, 2) + Math.pow(y-targetY, 2)<100;
  };
  function checkHover(targetX, targetY){
    highlighted = checkCollision(targetX, targetY);
    return highlighted;
  }
  function toggle(){
    selected = !selected;
  }
  function getX(){
    return x;
  }

  function getY(){
    return y;
  }

  function setSelected(value){
    selected = value;
  }

  function getPosition(){
    return position;
  }

  return {
    draw: draw,
    checkCollision: checkCollision,
    checkHover: checkHover,
    toggle: toggle,
    getX: getX,
    getY: getY,
    setSelected: setSelected,
    getPosition: getPosition
  };
};

// create the root of the scene graph

// set a fill and line style
var circles = [];
for(var i=0; i<12;i++){
  for(var j=0; j<8;j++){
    circles.push(new Circle(30+i*30, 30+j*30, 10, (i+1)+'ABCDEFGHI'[j]));
  }
};

var update = function(){
  graphics.clearRect(0,0,800,600);
  for(var i =0; i<circles.length; i++){
    circles[i].draw(graphics);
  } 
  if(definingArea){
    drawRectangle();
  } 
};

var selectCircle = function(circle){
  if(circle){
    circle.toggle();
  }
};

animate();
update();
function animate() {
  requestAnimationFrame(animate);
  update();
}

function checkMouse(x, y){
  var hg = false;
  for(var i =0; i<circles.length; i++){
    hg = hg||circles[i].checkHover(x, y);
    if(hg){
      hoveredCircle = circles[i];
      break;
    }
  }
  if(!hg){
    hoveredCircle = undefined;
  }
}

graphics.interactive = true;

var definingArea = false;
var rectangleArea = {
  xi: 0,
  yi: 0,
  xf: 0,
  yf: 0, 
  order: function(){
    var tmp = 0;
    if(this.xi>this.xf){
      tmp = this.xi;
      this.xi = this.xf;
      this.xf = tmp;
    }
    if(this.yi>this.yf){
      tmp = this.yi;
      this.yi = this.yf;
      this.yf = tmp;
    }
  }
};

var drawRectangle = function(){
  graphics.strokeRect(rectangleArea.xi, rectangleArea.yi, rectangleArea.xf-rectangleArea.xi, rectangleArea.yf-rectangleArea.yi);
}

canvas.onmousemove = function(event){
  checkMouse(event.layerX, event.layerY);
  if(definingArea){
    rectangleArea.xf = event.layerX;
    rectangleArea.yf = event.layerY;
  }
};

canvas.onclick = function(event){
  //selectCircle(hoveredCircle)
}


canvas.onmousedown = function(event){
  definingArea = true;
  rectangleArea.xi = event.layerX;
  rectangleArea.xf = event.layerX;
  rectangleArea.yi = event.layerY;
  rectangleArea.yf = event.layerY;
}

canvas.onmouseup = function(event){
  rectangleArea.order();
  for (var i = 0; i < circles.length; i++) {
    var collides = circles[i].getX()+10 > rectangleArea.xi;
    collides = collides && circles[i].getX()-10 < rectangleArea.xf;
    collides = collides && circles[i].getY()+10 > rectangleArea.yi;
    collides = collides && circles[i].getY()-10 < rectangleArea.yf;
    if(collides){
      circles[i].toggle();
      console.log(circles[i].getPosition());
    }
  };
  definingArea = false;
}

canvas.onmouseleave = function(event){
  definingArea = false;
}

var resetButton = document.getElementById('reset');
resetButton.onclick = function(event){
  event.preventDefault();
  for (var i = 0; i < circles.length; i++) {
    circles[i].setSelected(false);
  };
}