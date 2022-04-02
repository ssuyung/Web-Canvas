// var c = document.getElementById("myCanvas");
// var ctx = c.getContext("2d");
// ctx.moveTo(0, 0);
// ctx.lineTo(200, 100);
// ctx.stroke();
var cur_x, cur_y, prev_x, prev_y,
    mouse_down = false, 
    thickness = 50;
    canvas = document.getElementById('myCanvas'), ctx = canvas.getContext("2d"),
    cur_function="pen",
    cPushArray = new Array(), cStep=-1;
function init() {
    // cur_x = cur_y = prev_x = prev_y = 0;
    // mouse_down = false;
    // console.log("check");
    
    // ctx = canvas.getContext("2d");
   
    var state = ctx.getImageData(0,0,canvas.width, canvas.height);
    window.history.pushState(state, null);
    
    cPush(); //save the initial canvas so that we can undo all the way back to empty canvas
    canvas.addEventListener("mousemove", function (e) {
        findxy('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        findxy('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        findxy('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        findxy('out', e)
    }, false);
    window.addEventListener('popstate', changeStep, false);
}
function findxy(movement, e){
    if(movement == "move"){
        prev_x = cur_x;
        prev_y = cur_y
        cur_x = e.clientX - canvas.offsetLeft;
        cur_y = e.clientY - canvas.offsetTop;
        if(mouse_down){
            if(cur_function=="pen") draw();
            else if(cur_function=="eraser") erase();
        }
    } else if(movement == "down"){
        mouse_down = true;
        prev_x = cur_x;
        prev_y = cur_y
        cur_x = e.clientX - canvas.offsetLeft;
        cur_y = e.clientY - canvas.offsetTop;
        console.log(cur_x, cur_y);
    } else if(movement == "up"){
        cPush();
        var state = ctx.getImageData(0,0,canvas.width, canvas.height);
        window.history.pushState(state, null); 
        mouse_down = false;
    } else if(movement == "out"){

    }
}
function draw(){
    var color = document.getElementById("colorpicker");
    console.log("color = "+color.value);
    ctx.beginPath();
    ctx.moveTo(prev_x, prev_y);
    ctx.lineTo(cur_x, cur_y);
    ctx.strokeStyle = color.value;
    ctx.lineWidth = thickness*0.2;
    ctx.stroke();
    ctx.closePath();
}
function clickbutton(item){
    cur_function=item;
    console.log("cur_function:" + item);
}
function erase(){
    ctx.clearRect(cur_x-thickness*0.25, cur_y-thickness*0.25, thickness*0.5, thickness*0.5);
}
function changeThickness(){
    var slider=document.getElementById("thickness");
    thickness = slider.value;
    console.log("Change thickness to " + thickness);
}
function changeStep(e){ //undo, redo with "previous/next page button" of browser
    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // 透過 e.state 取得先前存到 window.history 的狀態
    if( e.state ){
      ctx.putImageData(e.state, 0, 0);
    }
}
  
function cPush() {
    cStep++;
    if (cStep < cPushArray.length-1) { cPushArray.length = cStep; }
    cPushArray.push(canvas.toDataURL());
    console.log("Image saved, step: "+cStep);
}
function cUndo() {
    if (cStep > 0) {
        cStep--;
        console.log("Undo, steps: "+cStep);
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () { 
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvasPic, 0, 0);
        }
        
    }
}
function cRedo() {
    if (cStep < cPushArray.length-1) {
        cStep++;
        console.log("Redo, step: "+cStep);
        var canvasPic = new Image();
        canvasPic.src = cPushArray[cStep];
        canvasPic.onload = function () { 
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvasPic, 0, 0); 
        }
    }
}
function clearcanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Cleared canvas");
}