class ItemFilter {
    constructor(borderColor, backgroundColor, textColor, size, visible) {
        this.borderColor = borderColor;
        this.backgroundColor = backgroundColor;
        this.textColor = textColor;
        this.size = size;
        this.visible = visible;
    }

    getDisplaySize(length) {
        return {
            width: length * this.size,
            height: 20*this.size*1.3,
        }
    }
    getFontSize() {
        return 20*this.size;
    }
}

export const veryValuableFilter = new ItemFilter("red", "#FFFFFF", "red", 1.2, true);
export const gemFilter = new ItemFilter("#03a17f", "#243b36", "#03a17f", 1, true);
export const defaultFilter = new ItemFilter("black", "#aba057", "black", 1, true);