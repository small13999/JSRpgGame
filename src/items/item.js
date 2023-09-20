import { defaultFilter } from "../itemfilter/itemfilter.js";

export class Item {
    constructor(text, x, y, width, height, itemObject, icon, filter=defaultFilter) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.itemObject = itemObject;
        this.icon = icon;
        this.invTopLeftX = null;
        this.invTopLeftY = null;
        this.filter = filter;
    }
}