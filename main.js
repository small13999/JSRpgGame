import { Mob, MobStats } from './src/mob/mob.js';
import { FireBallGem } from './src/gems/activegem.js';
import { FasterProjectilesGem } from './src/gems/supportgem.js';
import { ReturningProjectilesGem, GreaterMultipleProjectilesGem } from './src/gems/supportgem.js';
import { Player } from './src/player/player.js';
import { Element, toggleSkillGemsPanel } from './gui/gui.js';
import { guiPanel, toggleInvetoryPanel } from './gui/gui.js';
import { Item } from './src/items/item.js';
import { pointRectCollision } from './src/util/collision.js';
import { veryValuableFilter, gemFilter } from './src/itemfilter/itemfilter.js';

let PLAYER_ID = -1;

// SOCKET
//const PLAYER_ID = Math.floor(Math.random() * 10000);

const socket = new WebSocket("wss://188.6.118.42:9001");

socket.addEventListener("open", (event) => {
    console.log("WebSocket connection opened:", event);
});

socket.addEventListener("message", (event) => {
    let data = JSON.parse(event.data);
    if (!isNaN(data)) {
        PLAYER_ID = data;
    } else {
        let tmpArr = [];
        let tmpArr2 = [];
        data.players.forEach(player => {
        tmpArr.push({
            playerId: player[0],
            playerPos: player[1],
            });
        })
        data.skill_effects.forEach(effect => {
            tmpArr2.push({
                x: effect[0].x,
                y: effect[0].y
            })
        })
    map.otherPlayers = tmpArr;
    map.otherSkills = tmpArr2;
    }
});

socket.addEventListener("close", (event) => {
    if (event.wasClean) {
        console.log(`Connection closed cleanly, code=${event.code}, reason=${event.reason}`);
    } else {
        console.error("Connection abruptly closed");
    }
});

socket.addEventListener("error", (error) => {
    console.error("WebSocket error:", error);
});

//SOCKET

export const renderCanvas = document.querySelector("#renderCanvas");
const renderCtx = renderCanvas.getContext("2d");

export const uiCanvas = document.querySelector("#uiCanvas");
export const uiCtx = renderCanvas.getContext("2d");

const wrapper = document.querySelector(".canvasWrapper");
export let wrapperHeight = wrapper.clientHeight;
export let wrapperWidth = wrapper.clientWidth;

export const activePanels = {
    right: null,
    left: null
}

let offsetRight = activePanels.right ? 1-activePanels.right.width : 1;
let offsetLeft = activePanels.left ? 1-activePanels.left.width : 1;

let hoveredObject = null;
export let objectOnCursor = null;
export function setObjectOnCursor(obj) {
    objectOnCursor = obj;
}
const invSlotWidth = wrapperWidth*0.3/12;
const invSlotHeight = wrapperHeight*0.3/5;

const movingTo = {
    x: null,
    y: null
}

let mouseClickOnGui = true;

//stuff for image, rect, arc drawing
const baseScale = 3;
const targetSize = 64;

window.addEventListener('keydown', keydown);
window.addEventListener('keyup', keyup);
window.addEventListener('mousewheel', mousewheel);

let mouseDown = false;
//used for skill uses interrupting movement
let mouseHold = false;
let mouseX = 0;
let mouseY = 0;
uiCanvas.addEventListener('mousemove', mouseMoveHandler);
uiCanvas.addEventListener('mousedown', mouseDownHandler);
uiCanvas.addEventListener('mouseup', mouseUpHandler);

function mouseDownHandler(e) {
    mouseDown = true;
    let clickedGuiElement = guiPanel.clickedElement(mouseX, mouseY);
    if (clickedGuiElement == guiPanel) {
        //dropping item
        if (objectOnCursor != null) {
            objectOnCursor.x = player.x;
            objectOnCursor.y = player.y;
            map.items.push(objectOnCursor);
            objectOnCursor = null;
            mouseDown = false;
        } else {
            let gamePos = canvasPosToGamePos(mouseX, mouseY)
            movingTo.x = gamePos.x;
            movingTo.y = gamePos.y;
            socket.send(JSON.stringify({
                action: "MovePlayer",
                args: [Math.round(gamePos.x), Math.round(gamePos.y)]
            }));
        }
        mouseClickOnGui = false;
    } else {
        mouseClickOnGui = true;
    }
    if (hoveredObject != null && objectOnCursor == null) {
        const index = map.items.indexOf(hoveredObject);
        map.items.splice(index, 1);
        objectOnCursor = hoveredObject;
        hoveredObject = null;
        let added = player.addItem(objectOnCursor);
        console.log(added);
        objectOnCursor = null;
    }
}

function mouseUpHandler(e) {
    mouseDown = false;
    mouseHold = false;
}

function mouseMoveHandler(e) {
    //console.log(e.layerX, e.layerY);
    mouseX = e.layerX;
    mouseY = e.layerY;
    if (mouseDown && !mouseClickOnGui) {
        let gamePos = canvasPosToGamePos(mouseX, mouseY)
        movingTo.x = gamePos.x;
        movingTo.y = gamePos.y;
        socket.send(JSON.stringify({
            action: "MovePlayer",
            args: [Math.round(gamePos.x), Math.round(gamePos.y)]
        }));
    }
}

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
    if (e.key == "q") {
        if (!mouseDown) {
            let vy = mouseY - renderCanvas.height / 2;
            let vx = mouseX - renderCanvas.width / 2* offsetRight / offsetLeft;

            let dist = Math.sqrt(vx*vx + vy*vy);
            let normX = vx/dist;
            let normY = vy/dist;

            player.dx = normX;
            player.dy = normY;
            console.log(normX, normY);
        }

        let newProjs = player.primarySkill.use();
        //newProjs.forEach(proj => {map.skills.push(proj)});
        socket.send(JSON.stringify({
            action: "PlayerUseSkill",
            args: [Math.round(player.x), Math.round(player.y), player.dx, player.dy]
        }));
        if (!mouseHold) mouseHold = mouseDown;
        mouseDown = false;
        movingTo.x = null; movingTo.y = null;
        console.log(mouseHold);
    }
    if (e.key == "i") {
        toggleInvetoryPanel();
    }
    if (e.key == "u") {
        toggleSkillGemsPanel();
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
    if (e.key == "q") {
        mouseDown = mouseHold;
    }
}

let isLeft = false;
let isRight = false;
let isDown = false;
let isUp = false;

function resizeCanvasToDisplaySize() {
    var width = wrapper.clientWidth;
    var height = wrapper.clientHeight;
    if (renderCanvas.width != width  || renderCanvas.height != height) {
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

function lightenHex(hexcode) {
    let code = hexcode.slice(1);
    let newCode = "#";
    for (let i = 0; i<6; i++) {
        if (isNaN(code[i])) {
            newCode += code[i];
        } else if (parseInt(code[i]) < 9) {
            newCode += parseInt(code[i]) + 1;
        } else {
            newCode += 9;
        }
    }
    return newCode;
}

function gamePosToCanvasPos(x, y) {
    let rX = x - camera.x;
    let rY = y - camera.y;
    return {
        x: tX(rX) - ((renderCanvas.width/2 - tX(rX))*(camera.zoom-1)),
        y: tY(rY) - ((renderCanvas.height/2 - tY(rY))*(camera.zoom-1))
    }
}

function canvasPosToGamePos(x, y) {
    let playerCanvasPosX = renderCanvas.width / 2 * offsetRight / offsetLeft;
    let playerCanvasPosY = renderCanvas.height / 2;
    let canvasVx = (x - playerCanvasPosX) / camera.zoom;
    let canvasVy = (y - playerCanvasPosY) / camera.zoom;
    let gamePosX = player.x + canvasVx;
    let gamePosY = player.y + canvasVy;
    return {
        x: gamePosX,
        y: gamePosY
    }
}

function renderImage(img, x, y, offsetX, offsetY, frames, scale = 1) {
    scale *= baseScale;
    let rX = x - camera.x;
    let rY = y - camera.y;
    let size = img.width / frames;
    renderCtx.drawImage(img, size*offsetX, size*offsetY, size, size, tX(rX) - ((renderCanvas.width/2 - tX(rX))*(camera.zoom-1)), tY(rY) - ((renderCanvas.height/2 - tY(rY))*(camera.zoom-1)), tWH(targetSize*scale*camera.zoom), tWH(targetSize*scale*camera.zoom));
}

function renderRect(x, y, width, height, color) {
    let rX = x - camera.x;
    let rY = y - camera.y;
    renderCtx.fillStyle = color;
    renderCtx.fillRect(tX(rX) - ((renderCanvas.width/2 - tX(rX))*(camera.zoom-1)), tY(rY) - ((renderCanvas.height/2 - tY(rY))*(camera.zoom-1)), tWH(width*camera.zoom), tWH(height*camera.zoom));
}

function renderRectBorder(x, y, width, height, color) {
    let rX = x - camera.x;
    let rY = y - camera.y;
    renderCtx.strokeStyle = color;
    renderCtx.lineWidth = 1;
    renderCtx.strokeRect(tX(rX) - ((renderCanvas.width/2 - tX(rX))*(camera.zoom-1)), tY(rY) - ((renderCanvas.height/2 - tY(rY))*(camera.zoom-1)), tWH(width*camera.zoom), tWH(height*camera.zoom));
}

function renderText(text, x, y, color="black", size=15) {
    let rX = x - camera.x;
    let rY = y - camera.y;
    renderCtx.textBaseline = "hanging";
    renderCtx.fillStyle = color;
    renderCtx.font = size * camera.zoom + "px Arial";
    renderCtx.fillText(text, tX(rX) - ((renderCanvas.width/2 - tX(rX))*(camera.zoom-1)), tY(rY) - ((renderCanvas.height/2 - tY(rY))*(camera.zoom-1)));
}

function update() {

    wrapperHeight = wrapper.clientHeight;
    wrapperWidth = wrapper.clientWidth;

    offsetRight = activePanels.right ? 1-activePanels.right.width : 1;
    offsetLeft = activePanels.left ? 1-activePanels.left.width : 1;

    resizeCanvasToDisplaySize();
    updateMouse();
    movePlayer();
    draw();
    updateSkills();
    drawItems();
    guiPanel.draw();
    drawObjectOnCursor();
    requestAnimationFrame(update);
}

const aspectRatio = 16 / 9;
function tX(x) {
    let newWidth = wrapperHeight * aspectRatio;
    let newTopLeft = (wrapperWidth / 2) - (newWidth / 2);
    return newTopLeft + x * newWidth / 1600;
}

function tY(y) {
    return y / 900 * wrapperHeight;
}

function tWH(n) {
    return n / 900 * wrapperHeight;
}

const grass = new Image();
const stone = new Image();
const mob = new Image();
const orc = new Image();
mob.src = "spritesheets/mob1t.png";
orc.src = "spritesheets/orc.png";
grass.src = "grass.png";
stone.src = "stone.png";

const orcStats = new MobStats(100, 10, 1, 1, 0, 0);
const orcMob = new Mob("Angry Orc", orc, 100, 100, orcStats, [], [], []);

const fireball = new FireBallGem(1, 0);
const fasterProj = new FasterProjectilesGem();
const returnProj = new ReturningProjectilesGem();
const gmp = new GreaterMultipleProjectilesGem();
fireball.linkSupportGem(fasterProj);
fireball.linkSupportGem(returnProj);
fireball.linkSupportGem(gmp);

const gmppng = new Image();
gmppng.src = "gmp.png";

const gmpItem = new Item("Greater Multiple Projectiles Support", 300, 250, 2, 2, gmp, gmppng, gemFilter);
const gmpItem1 = new Item("Greater Multiple Projectiles Support", 400, 350, 2, 2, gmp, gmppng, gemFilter);
const gmpItem2 = new Item("Greater Multiple Projectiles Support", 500, 200, 2, 2, gmp, gmppng, gemFilter);
const gmpItem3 = new Item("Greater Multiple Projectiles Support", 300, 300, 2, 2, gmp, gmppng, gemFilter);
const gmpItem4 = new Item("Divine Orb", 300, 400, 2, 2, gmp, gmppng, veryValuableFilter);


const tileMap = new Map();
tileMap.set(0, grass);
tileMap.set(1, stone);

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

export const player = new Player(0, 0, 1, 0, 1);
player.addSkill(fireball);

const map = {
    tileset: tiles,
    mods: [],
    mobs: [],
    items: [],
    graphics: [],
    skills: [],
    otherPlayers: [],
    otherSkills: [],
}

map.items.push(gmpItem);
map.items.push(gmpItem1);
map.items.push(gmpItem2);
map.items.push(gmpItem3);
map.items.push(gmpItem4);


map.mobs.push(orcMob);
orcMob.takeDamage(0);

let tileSize = 256;
let counter = 0;
let neg = 1;

function draw() {
    renderCtx.imageSmoothingEnabled = false;
    renderCtx.fillStyle = "green";
    renderCtx.fillRect(0, 0, renderCanvas.width, renderCanvas.height);

    for (let i = 0; i<tiles.length; i++) {
        for (let j = 0; j<tiles[0].length; j++) {
            let rX = i*tileSize-camera.x;
            let rY = j*tileSize-camera.y;

            renderCtx.drawImage(tileMap.get(tiles[i][j]), tX(rX) - ((renderCanvas.width/2 - tX(rX))*(camera.zoom-1)), tY(rY) - ((renderCanvas.height/2 - tY(rY))*(camera.zoom-1)), tWH(tileSize*camera.zoom), tWH(tileSize*camera.zoom));
        }
    }

    drawArc(player.x, player.y, 20, "black");

    /*
    offset = Math.floor(counter / 8);
    drawSprite(mob, -100, -100, offset, 0, 8);
    counter+=0.5 * neg;
    if (counter == 63) neg = -1;
    if (counter == 0) neg = 1;

    drawSprite(orc, 200, 100, 0, 0);d
    */

    map.mobs.forEach(mob => {
        let number = targetSize * baseScale;
        drawSprite(mob.img, mob.x, mob.y, 0, 0);
        renderRect(mob.x + number/6 - 4, mob.y - number/7 - 4, number/6*4 + 8, number/14 + 8, "#661d17");
        renderRect(mob.x + number/6, mob.y - number/7, number/6*4 * (mob.stats.currentHp / mob.stats.hp), number/14, "red");
    })

    map.otherPlayers.forEach(player => {
        if (PLAYER_ID != player.playerId) {
            drawArc(player.playerPos.x, player.playerPos.y, 20, "black");
            renderText("Player " + player.playerId, player.playerPos.x - 40, player.playerPos.y - 50, 20, "black", 20);
        }
    })

    map.otherSkills.forEach(skill => {
        drawArc(skill.x, skill.y, 20, "red");
    })
}

function drawSprite(img, x, y, offsetX, offsetY, frames = 1, scale = 1) { 
    renderImage(img, x, y, offsetX, offsetY, frames, 1);
}

export function drawArc(x, y, r, color) {
    renderCtx.fillStyle = color;

    renderCtx.beginPath();
    let rX = x - camera.x;
    let rY = y - camera.y;
    renderCtx.arc(tX(rX) - ((renderCanvas.width / 2  - tX(rX))*(camera.zoom-1)), tY(rY) - ((renderCanvas.height / 2 - tY(rY))*(camera.zoom-1)), tWH(r*camera.zoom), 0, 6.28);
    //renderCtx.arc(renderCanvas.width/2*0.7, tY(rY) - ((renderCanvas.height / 2 - tY(rY))*(camera.zoom-1)), tWH(r*camera.zoom), 0, 6.28);
    renderCtx.fill();
}

function movePlayer() {
    if (mouseDown && !mouseClickOnGui) {
        let gamePos = canvasPosToGamePos(mouseX, mouseY)
        movingTo.x = gamePos.x;
        movingTo.y = gamePos.y;
    }
    if (movingTo.x == null || movingTo.y == null) {
        updateCamera();
        return;
    }
    let px = wrapperWidth * offsetRight / offsetLeft / 2;
    let py = wrapperHeight / 2;
    
    
    let vy = movingTo.y - player.y;
    let vx = movingTo.x - player.x;

    let dist = Math.sqrt(vx*vx + vy*vy);
    let normX = vx/dist;
    let normY = vy/dist;

    let newVx = movingTo.x - player.x - normX*8;
    let newVy = movingTo.y - player.y - normY *8;

    if (Math.sign(vy) != Math.sign(newVy) && Math.sign(vx) != Math.sign(newVx)) {
        player.x = movingTo.x;
        player.y = movingTo.y;
        movingTo.x = null;
        movingTo.y = null;
    } else {
        player.x += normX*8;
        player.y += normY*8;
    }

    player.dx = normX;
    player.dy = normY;

    updateCamera();
}

function updateCamera() { 
    var width = 1600; 
    var height = 900;

    camera.x = player.x - width / 2 * offsetRight / offsetLeft;
    camera.y = player.y - height/2;
    
}

function updateSkills() {
    map.skills.forEach((skill, index) => {
        if (skill.delete) {
            map.skills.splice(index, 1);
        } else {
            skill.update();
        }
    })
}

function drawItems() {
    let z = camera.zoom;
    let heightFactor = 960/wrapperHeight;
    map.items.forEach(item => {
        let fontSize = item.filter.getFontSize();
        renderText(item.text, item.x+ 10, item.y + 5, item.filter.textColor, fontSize);
        let text = renderCtx.measureText(item.text);
        let displaySize = item.filter.getDisplaySize(text.width);
        item.renderWidth = displaySize.width;
        item.renderHeight = displaySize.height;
        if (item == hoveredObject) {
            renderRect(item.x, item.y, displaySize.width/z*heightFactor, displaySize.height/heightFactor, lightenHex(item.filter.backgroundColor));
            renderText(item.text, item.x+ 10, item.y + 5, item.filter.textColor, fontSize);
            renderRectBorder(item.x, item.y, displaySize.width/z*heightFactor, displaySize.height, item.filter.borderColor);
        } else {
            renderRect(item.x, item.y, displaySize.width/z*heightFactor, displaySize.height, item.filter.backgroundColor);
            renderText(item.text, item.x+ 10, item.y + 5, item.filter.textColor, fontSize);
            renderRectBorder(item.x, item.y, displaySize.width/z*heightFactor, displaySize.height, item.filter.borderColor);
        }
    })
}

function updateMouse() {
    let found = false;
    let z = camera.zoom;
    map.items.forEach(item => {
        const canvasPos = gamePosToCanvasPos(item.x, item.y);
        //item.width here is already converted coords to world space
        if (pointRectCollision({x: mouseX, y: mouseY}, {x: canvasPos.x, y: canvasPos.y, width: tWH(item.renderWidth), height: item.renderHeight*z})) {
            hoveredObject = item;
            found = true;
        }
    })
    if (!found) hoveredObject = null;
}

function drawObjectOnCursor() {

    if (objectOnCursor != null) {
        uiCtx.drawImage(objectOnCursor.icon, mouseX - objectOnCursor.width*invSlotWidth/2, mouseY - objectOnCursor.height*invSlotHeight/2,
        objectOnCursor.width*invSlotWidth, objectOnCursor.height*invSlotHeight);
    }
}

updateCamera();
update();
