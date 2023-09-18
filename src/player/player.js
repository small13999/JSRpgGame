export class Player {
    constructor(x, y, dx, dy, speed, primarySkill = null) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.speed = speed;
        this.primarySkill = primarySkill;
        this.inventory = new Array(5).fill().map(() => new Array(12).fill(null));
        console.log(this.inventory);
    }

    getPosition() {
        return {
            x: this.x,
            y: this.y,
            dx: this.dx,
            dy: this.dy
        }
        
    }

    addSkill(gem) {
        this.primarySkill = gem;
        gem.getOriginEntityPos = this.getPosition.bind(this);
    }

    addItem(item) {
        for (let col = 0; col <12; col++) {
            for (let row = 0; row < 5; row++) {
                if (this.inventory[row][col] != null) continue;

                let fits = true;
                for (let x = col; x < col + item.width; x++) {
                    for (let y = row; y < row + item.height; y++) {
                        if (y >= 5 || x >= 12) {
                            fits = false;
                            break;
                        }
                        if (this.inventory[y][x] != null) fits = false;
                    }
                }

                if (fits) {
                    for (let x = col; x < col + item.width; x++) {
                        for (let y = row; y < row + item.height; y++) {
                            this.inventory[y][x] = item;
                            item.invTopLeftX = col;
                            item.invTopLeftY = row;
                        }
                    }
                    return true;
                }
            }
        }
        return false;
    }

    addItemAtPos(item, row, col) {
        if (row < 0 || col < 0) return false;
        let fits = true;
        for (let x = col; x < col + item.width; x++) {
            for (let y = row; y < row + item.height; y++) {
                if (y >= 5 || x >= 12) {
                    fits = false;
                    break;
                }
                if (this.inventory[y][x] != null) fits = false;
            }
        }

        if (fits) {
            for (let x = col; x < col + item.width; x++) {
                for (let y = row; y < row + item.height; y++) {
                    this.inventory[y][x] = item;
                    item.invTopLeftX = col;
                    item.invTopLeftY = row;
                }
            }
            return true;
        }
    }
}