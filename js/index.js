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

  function setTarget(value){
    target = value;
  }

  function setSample(value){
    sample = value;
  }

  function setGroup1(value){
    group1 = value;
  }

  function setGroup2(value){
    group2 = value;
  }

  function getPosition(){
    return position;
  }

  function getInfo(){
    return {
      target: target,
      sample: sample,
      position: position,
      group1: group1,
      group2: group2
    };
  };

  function setInfo(params){
    if(params.target){
      target = params.target;
    }
    if(params.sample){
      sample = params.sample;
    }
    if(params.group1){
      group1 = params.group1;
    }
    if(params.group2){
      group2 = params.group2;
    }
  };

  function isSelected(){
    return selected;
  }

  return {
    draw: draw,
    checkCollision: checkCollision,
    checkHover: checkHover,
    toggle: toggle,
    getX: getX,
    getY: getY,
    isSelected: isSelected,
    setSelected: setSelected,
    getPosition: getPosition,
    getInfo: getInfo,
    setInfo: setInfo,
  };
};

var WellDesigner = (function(){

  var canvas = document.getElementById('plate');
  var graphics = canvas.getContext('2d');


  var hoveredCircle = undefined;

  var hoverListeners = [];
  var selectListeners = [];

  // create the root of the scene graph

  // set a fill and line style
  var circles = [];
  for(var i=0; i<12;i++){
    for(var j=0; j<8;j++){
      circles.push(new Circle(30+i*30, 30+j*30, 10, (i+1)+'ABCDEFGH'[j]));
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

  function triggerHovered(circle){
    for (var i = 0; i < hoverListeners.length; i++) {
      hoverListeners[i](circle);
    };
  };

  function triggerSelected(circles){
    for (var i = 0; i < selectListeners.length; i++) {
      selectListeners[i](circles);
    };
  };

  function checkMouse(x, y){
    var hg = false;
    var previousHover = hoveredCircle?hoveredCircle.position:'';
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
    if((hoveredCircle?hoveredCircle.position:'')!=previousHover){
      triggerHovered(hoveredCircle);
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
    if(definingArea){
      rectangleArea.xf = event.layerX;
      rectangleArea.yf = event.layerY;
    }else {
      checkMouse(event.layerX, event.layerY);
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
        circles[i].setSelected(true);
      }
    };
    definingArea = false;

    triggerSelected(getSelected());
  }

  canvas.onmouseleave = function(event){
    definingArea = false;
  }

  function reset(){
    for (var i = 0; i < circles.length; i++) {
      circles[i].setSelected(false);
    };  
  };

  function getSelected(){
    var selected = [];
    for (var i = 0; i < circles.length; i++) {
      if(circles[i].isSelected()){
        selected.push(circles[i]);
      }
    };
    return selected;
  };

  function getAll(){
    return circles;
  };

  function addHoverListener(listener){
    hoverListeners.push(listener);
  };

  function addSelectListener(listener){
    selectListeners.push(listener);
  };

  function removeHoverListener(listener){
    var index = hoverListeners.indexOf(listener);
    hoverListeners.splice(index, 0);
  };

  function removeSelectListener(listener){
    var index = selectListeners.indexOf(listener);
    selectListeners.splice(index, 0);
  };

  function getInfoSelected(argument){
    var selected = getSelected();
    var results = {};
    for (var i = 0; i < selected.length; i++) {
      results[selected[i].getPosition()] = selected[i].getInfo();
    };
    return results;
  };

  function setInfoSelected(params){
    var selected = getSelected();
    for (var i = 0; i < selected.length; i++) {
      selected[i].setInfo(params);
    };
  };

  return {
    reset: reset,
    getSelected: getSelected,
    getAll: getAll,
    setInfoSelected: setInfoSelected,
    getInfoSelected: getInfoSelected,
    addHoverListener: addHoverListener,
    addSelectListener: addSelectListener,
    removeHoverListener: removeHoverListener,
    removeSelectListener: removeSelectListener,
  };
}());