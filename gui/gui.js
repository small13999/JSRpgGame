import { uiCtx, uiCanvas, wrapperWidth, wrapperHeight, renderCanvas } from "../main.js";
import { activePanels } from "../main.js";
import { player, objectOnCursor, setObjectOnCursor } from "../main.js";
const gmppng = new Image();
gmppng.src = "gmp.png";

export class Element {
    constructor(x, y, width, height, color, visible=false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.childElements = [];
        this.visible = visible;
    }

    draw() {
        if (!this.visible) return;
        uiCtx.fillStyle = this.color;
        uiCtx.fillRect(this.x * wrapperWidth, this.y * wrapperHeight, this.width * wrapperWidth, this.height * wrapperHeight);
        this.childElements.forEach(element => element.draw());
    }

    addChild(element) {
        this.childElements.push(element);
    }

    toggleVisibility() {
        this.visible = !this.visible;
    }

    clickedElement(mouseX, mouseY) {
        if (!this.visible) return null;
        let clickedObj = null;
        if (mouseX > this.x * wrapperWidth && mouseX < this.x * wrapperWidth + this.width * wrapperWidth &&
            mouseY > this.y * wrapperHeight && mouseY < this.y * wrapperHeight + this.height * wrapperHeight) {
            clickedObj = this;
        }
        if (clickedObj == null) return null;

        let childClickedObj = null;
        this.childElements.forEach(element => {
            let obj = element.clickedElement(mouseX, mouseY);
            if (obj != null) childClickedObj = obj;
        })

        if (childClickedObj != null) {
            return childClickedObj;
        } else {
            return clickedObj;
        }
    }
}

export const guiPanel = new Element(0, 0, 1, 1, "rgba(0, 0, 0, 0)", true);

const inventoryPanel = new Element(0.7, 0, 0.3, 1, "rgba(100, 70, 36, 1)", false);
export function toggleInvetoryPanel() {
    inventoryPanel.toggleVisibility();
    if (inventoryPanel.visible) {
        if (activePanels.right != null) {
            activePanels.right.toggleVisibility();
        }
        activePanels.right = inventoryPanel;
    } else {
        activePanels.right = null;
    }
}

const skillGemsPanel = new Element(0, 0, 0.3, 1, "rgba(100, 70, 50, 1)", false);
export function toggleSkillGemsPanel() {
    skillGemsPanel.toggleVisibility();
    if (skillGemsPanel.visible) {
        if (activePanels.left != null) {
            activePanels.left.toggleVisibility();
        }
        activePanels.left = skillGemsPanel;
    } else {
        activePanels.left = null;
    }
}

guiPanel.addChild(inventoryPanel);
guiPanel.addChild(skillGemsPanel);

class InventorySlots extends Element {
    constructor(x, y, width, height, color, visible=false) {
        super(x, y, width, height, color, visible);
    }

    draw() {
        super.draw();
        
        const topleftX = wrapperWidth * 0.7;
        const topleftY = wrapperHeight * 0.6;
        const bottomrightX = wrapperWidth;
        const bottomrightY = wrapperHeight * 0.9;
        uiCtx.fillStyle = "black";
        uiCtx.strokeStyle = "black";
        for (let i = 0; i<13; i++) {

            uiCtx.beginPath();
            uiCtx.moveTo(topleftX + i/12 * wrapperWidth * 0.3, topleftY);
            uiCtx.lineTo(topleftX + i/12 * wrapperWidth * 0.3, bottomrightY)
            uiCtx.stroke();
        }

        for (let j = 0; j<5; j++) {
            uiCtx.beginPath();
            uiCtx.moveTo(topleftX, topleftY + j/5 * wrapperHeight * 0.3);
            uiCtx.lineTo(bottomrightX, topleftY + j/5 * wrapperHeight * 0.3);
            uiCtx.stroke();
        }

        const drawnSlots = new Array(5).fill().map(() => new Array(12).fill(0));
        for (let col = 0; col <12; col++) {
            for (let row = 0; row < 5; row++) {
                if (player.inventory[row][col] != null && drawnSlots[row][col] == 0) {
                    const item = player.inventory[row][col];
                    for (let x = col; x < col + item.width; x++) {
                        for (let y = row; y < row + item.height; y++) {
                            drawnSlots[y][x] = 1;
                        }
                    }
                    uiCtx.drawImage(gmppng, topleftX + col/12 * wrapperWidth * 0.3, topleftY + row/5 * wrapperHeight * 0.3,
                    wrapperWidth * 0.3 * 1/12 * item.width, wrapperHeight * 0.3 * 1/5 * item.height);
                }
            }
        }
    }
}

class InventorySlot extends Element {
    constructor(x, y, width, height, color, invCol, invRow, visible=false) {
        super(x, y, width, height, color, visible);
        this.invCol = invCol;
        this.invRow = invRow;
    }

    clickedElement(mouseX, mouseY) {
        let ret = super.clickedElement(mouseX, mouseY);
        if (ret == this) {
            if (player.inventory[this.invRow][this.invCol] != null) {
                let item = player.inventory[this.invRow][this.invCol];
                for (let x = item.invTopLeftX; x < item.invTopLeftX + item.width; x++) {
                    for (let y = item.invTopLeftY; y < item.invTopLeftY + item.height; y++) {
                        player.inventory[y][x] = null;

                    }
                }
                setObjectOnCursor(item);
            } else if (objectOnCursor != null) {
                let ret = false;
                let halfwayX = this.x * wrapperWidth + this.width*wrapperWidth/2;
                let halfwayY = this.y * wrapperHeight + this.height*wrapperHeight/2;
                if (mouseX < halfwayX && mouseY < halfwayY) {
                    ret = player.addItemAtPos(objectOnCursor, this.invRow - 1, this.invCol - 1);
                }
                if (mouseX < halfwayX && mouseY > halfwayY) {
                    ret = player.addItemAtPos(objectOnCursor, this.invRow, this.invCol - 1);
                }
                if (mouseX > halfwayX && mouseY < halfwayY) {
                    ret = player.addItemAtPos(objectOnCursor, this.invRow - 1, this.invCol);
                }
                if (mouseX > halfwayX && mouseY > halfwayY) {
                    ret = player.addItemAtPos(objectOnCursor, this.invRow, this.invCol);
                }

                if (ret) setObjectOnCursor(null);
            }
        }

        return ret;
    }
}
const inventorySlots = new InventorySlots(0.7, 0.6, 0.3, 0.3, "grey", true);
inventoryPanel.addChild(inventorySlots);

for (let i = 0; i<12; i++) {
    for (let j = 0; j<5; j++) {
        const slot = new InventorySlot(0.7 + i/12*0.3, 0.6  + j/5*0.3, 0.3/12, 0.3/5, "rgba(0,0,0,0)", i, j, true);
        inventorySlots.addChild(slot);
        console.log(slot.width, slot.height);
    }
}