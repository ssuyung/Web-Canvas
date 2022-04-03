// var c = document.getElementById("myCanvas");
// var ctx = c.getContext("2d");
// ctx.moveTo(0, 0);
// ctx.lineTo(200, 100);
// ctx.stroke();
var cur_x, cur_y, prev_x, prev_y, down_x, down_y,
    mouse_down = false, initial_stroke = true, 
    thickness = 50;
    canvas = document.getElementById('myCanvas'), ctx = canvas.getContext("2d"),
    cur_function="pen",
    cPushArray = new Array(), cStep=-1,
    color = document.getElementById("colorpicker");
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
    document.getElementById('file_selector').addEventListener('change', handleFiles);

}
function handleFiles(e) {//upload image and draw on canvas
    var img = new Image;
    img.src = URL.createObjectURL(e.target.files[0]);
    img.onload = function() {
        ctx.drawImage(img, 20,20);
       // alert('the image is drawn');
    }
}
function findxy(movement, e){
    if(movement == "move"){
        prev_x = cur_x;
        prev_y = cur_y
        cur_x = e.clientX - canvas.offsetLeft;
        cur_y = e.clientY - canvas.offsetTop;
        change_cursor();
        if(mouse_down){
            if(cur_function=="pen") draw();
            else if(cur_function=="eraser") erase();
            else if(cur_function=="circle") draw_circle();
            else if(cur_function=="triangle") draw_triangle();
            else if(cur_function=="rectangle") draw_rectangle();
            
            if(initial_stroke==true) initial_stroke = false;
        }
    } else if(movement == "down"){
        initial_stroke = true;
        mouse_down = true;
        prev_x = cur_x;
        prev_y = cur_y;
        cur_x = e.clientX - canvas.offsetLeft;
        cur_y = e.clientY - canvas.offsetTop;
        down_x = cur_x;
        down_y = cur_y;
        console.log(cur_x, cur_y);
        if(cur_function=="text") put_text();
    } else if(movement == "up"){
        if(cur_function !="rectangle" && cur_function !="circle" && cur_function !="triangle") cPush();
        cRefresh();
        var state = ctx.getImageData(0,0,canvas.width, canvas.height);
        window.history.pushState(state, null); 
        mouse_down = false;
        initial_stroke = false;
    } else if(movement == "out"){

    }
}
function draw(){
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
function cRefresh(){// for unknown reason, rectangle need this after done so that rectangle shows without undo+redo
    var canvasPic = new Image();
    canvasPic.src = cPushArray[cStep];
    canvasPic.onload = function () { 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(canvasPic, 0, 0);
    }
}
function clearcanvas(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Cleared canvas");
}
function draw_circle(){
    // console.log("drawing circle");
    var r;
    if(Math.abs(cur_x-down_x)>=Math.abs(cur_y-down_y)) r = cur_y-down_y;
    else r=cur_x-down_x;
    if(initial_stroke==false) cUndo();
    ctx.beginPath();
    ctx.strokeStyle = color.value;
    ctx.lineWidth = thickness*0.2;
    ctx.arc(down_x+r, down_y+r, Math.abs(r), 0, 2 * Math.PI);
    ctx.stroke();
    cPush();
}
function draw_rectangle(){
    // console.log("drawing rectangle");
    if(initial_stroke==false) cUndo();
    ctx.beginPath();
    ctx.strokeStyle = color.value;
    ctx.lineWidth = thickness*0.2;
    ctx.rect(down_x, down_y, cur_x-down_x, cur_y-down_y);
    ctx.stroke();
    cPush();
}
function draw_triangle(){
    // console.log("drawing triangle");
    if(initial_stroke==false) cUndo();
    ctx.beginPath();
    ctx.strokeStyle = color.value;
    ctx.lineWidth = thickness*0.2;
    ctx.moveTo((down_x+cur_x)/2, down_y);
    ctx.lineTo(down_x, cur_y);
    ctx.lineTo(cur_x, cur_y);
    ctx.lineTo((down_x+cur_x)/2, down_y);
    ctx.lineTo(down_x, cur_y);
    ctx.stroke();
    ctx.closePath();
    cPush();
}
function put_text(){// TODO: positioning, font, size...
    var t=document.getElementById("text_input").value;
    ctx.font = "30px Comic Sans MS";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText(t, down_x, down_y);
}
function get_image(){// reference only, not being used
    
    //alert('Selected file: ' + document.getElementById("file_selector").value);

    var image = new Image();
    
    image.onload = function() {
        var w = this.width,
            h = this.height;
        
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(this, 0, 0, w, h);
        //ctx.fillText('Mood', 163, 191); 
  }

  image.src = 'hello.jpg';
}
function change_cursor(){
    if(cur_function=="pen") canvas.style.cursor="url('./src/big-paint-brush_shrinked.png'), auto";
    else if(cur_function=="eraser") canvas.style.cursor="url('./src/eraser_shrinked.png'), auto";
    else if(cur_function=="circle") canvas.style.cursor="url('./src/circle_shrinked.png'), auto";
    else if(cur_function=="rectangle") canvas.style.cursor="url('./src/rectangle_shrinked.png'), auto";
    else if(cur_function=="triangle") canvas.style.cursor="url('./src/triangle_shrinked.png'), auto";
    else if(cur_function=="text") canvas.style.cursor="url('./src/text_shrinked.png'), auto";
}