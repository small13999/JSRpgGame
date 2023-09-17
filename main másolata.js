const renderCanvas = document.querySelector("#renderCanvas");
const renderCtx = renderCanvas.getContext("2d");

const uiCanvas = document.querySelector("#uiCanvas");
const uiCtx = renderCanvas.getContext("2d");

const wrapper = document.querySelector(".canvasWrapper");

window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
window.addEventListener('mousewheel', mousewheel);

function mousewheel(e) {
    if (camera.zoom - Math.sign(e.deltaY)*0.1 < 0.2) return;
    camera.zoom += -Math.sign(e.deltaY)*0.1;
}

function keydown(e) {
    if (e.key == "ArrowUp" || e.key == "w") {
        isUp = true;
    }
    if (e.key == "ArrowDown" || e.key == "s") {
        isDown = true;
    }
    if (e.key == "ArrowLeft" || e.key == "a") {
        isLeft = true;
    }
    if (e.key == "ArrowRight" || e.key == "d") {
        isRight = true;
    }
}

function keyup(e) {
    if (e.key == "ArrowUp" || e.key == "w") {
        isUp = false;
    }
    if (e.key == "ArrowDown" || e.key == "s") {
        isDown = false;
    }
    if (e.key == "ArrowLeft" || e.key == "a") {
        isLeft = false;
    }
    if (e.key == "ArrowRight" || e.key == "d") {
        isRight = false;
    }
}

let isLeft = false;
let isRight = false;
let isDown = false;
let isUp = false;

function resizeCanvasToDisplaySize() {
    var width = wrapper.clientWidth;
    var height = wrapper.clientHeight;
    if (renderCanvas.width != width || renderCanvas.height != height) {
        renderCanvas.width = width;
        renderCanvas.height = height;
        uiCanvas.width = width;
        uiCanvas.height = height;
    }
}

class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function render() {
    resizeCanvasToDisplaySize();
    movePlayer();
    draw();
    requestAnimationFrame(render);
}

function tX(x) {
    let newWidth = wrapper.clientHeight * 16 / 9;
    let newTopLeft = (wrapper.clientWidth / 2) - (newWidth / 2);
    //console.log("wrap mid", wrapper.clientWidth / 2);
    //console.log("new mid", newWidth / 2);
    return newTopLeft + x * newWidth / 1600;
}

function tY(y) {
    return y / 900 * wrapper.clientHeight;
}

function tWH(n) {
    return n / 900 * wrapper.clientHeight;
}

const grass = new Image();
const stone = new Image();
grass.src = "grass.png";
stone.src = "stone.png";

const tiles = [
    [0,0,0,0,1,0,0,0,0,0],
    [0,1,1,0,1,0,0,0,0,0],
    [0,1,1,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [1,1,1,1,1,1,1,1,1,1],
    [0,0,0,0,1,0,0,1,0,0],
    [0,0,0,0,1,0,0,1,0,0],
    [0,0,0,0,1,0,0,1,0,0],
    [0,0,0,0,1,0,0,1,0,0],
    [0,0,0,0,1,0,0,1,0,0],
]

const camera = {
    x: 0,
    y: 0,
    zoom: 1,
    rotation: 0
}

const player = {
    x: 0,
    y: 0
}

let tileSize = 256;

function draw() {
    renderCtx.fillStyle = "green";
    renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

    for (let i = 0; i<tiles.length; i++) {
        for (let j = 0; j<tiles[0].length; j++) {
            let rX = i*tileSize-camera.x;
            let rY = j*tileSize-camera.y;
            if (tiles[i][j] == 0) {
                renderCtx.drawImage(grass, tX(rX - (renderCanvas.width/2 - rX)*(camera.zoom-1)), tY(rY - (renderCanvas.height/2 - rY)*(camera.zoom-1)), tWH(tileSize*camera.zoom), tWH(tileSize*camera.zoom));
            } else {
                renderCtx.drawImage(stone, tX(rX - (renderCanvas.width/2 - rX)*(camera.zoom-1)), tY(rY - (renderCanvas.height/2 - rY)*(camera.zoom-1)), tWH(tileSize*camera.zoom), tWH(tileSize*camera.zoom));
            }
        }
    }

    drawArc(player.x, player.y, 50);
}

function drawArc(x, y, r) {
    renderCtx.fillStyle = "black";
    renderCtx.beginPath();
    let rX = x - camera.x;
    let rY = y - camera.y;
    renderCtx.arc(tX(rX - (renderCanvas.width / 2 - rX)*(camera.zoom-1)), tY(rY - (renderCanvas.height / 2 - rY)*(camera.zoom-1)), tWH(50*camera.zoom), 0, 6.28);
    renderCtx.fill();
}

function movePlayer() {
    let v = 3;
    let base = new Vector2(1, 0);
    let move = new Vector2(0, 0);
    if (isLeft) {
        move.x -= 1;
    }
    if (isRight) {
        move.x += 1;
    }
    if (isDown) {
        move.y += 1;
    }
    if (isUp) {
        move.y -= 1;
    }
    if (move.x == 0 && move.y == 0) {
        updateCamera();
        return;
    }

    let costheta = (base.x*move.x + base.y*move.y) / (Math.sqrt(Math.pow(base.x, 2) + Math.pow(base.y, 2)) * Math.sqrt(Math.pow(move.x, 2) + Math.pow(move.y, 2)));
    let theta = Math.acos(costheta);

    player.x += costheta * v;
    player.y += move.y * Math.sin(theta) * v;
    updateCamera();
}

function updateCamera() {
    /*
    let rX = player.x - camera.x;
    let rY = player.y - camera.y;
    camera.x = tX(rX - (renderCanvas.width / 2 - rX)*(camera.zoom-1));
    camera.y = tY(rY - (renderCanvas.height / 2 - rY)*(camera.zoom-1));
    */
    
    /*
    var width = wrapper.clientWidth;
    var height = wrapper.clientHeight;
    camera.x = player.x - width/2;
    camera.y = player.y - height/2;
    */
    
    var width = 1600; 
    var height = 900;
    camera.x = player.x - width/2;
    camera.y = player.y - height/2;

    //width: 1000 height: 300           width = 
}

render();

