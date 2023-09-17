export class Mob {
    constructor(name, img, x, y, stats, gems, loot, mods, xp) {
        this.name = name;
        this.img = img;
        this.x = x;
        this.y = y;
        this.gems = gems;
        this.loot = loot;
        this.mods = mods;
        this.stats = stats;
        this.xp = xp;
        this.applyMods(this.mods);
    }

    applyMods(mods) {
        mods.forEach(mod => {
            mod.flatOrInc ? this.stats.hp += mod.hp : this.stats.hp *= mod.hp;
            mod.flatOrInc ? this.stats.speed += mod.speed : this.stats.speed *= mod.speed;
            mod.flatOrInc ? this.stats.size += mod.size : this.stats.size *= mod.size;
            mod.flatOrInc ? this.stats.projs += mod.projs : this.stats.projs *= mod.projs;
            mod.flatOrInc ? this.stats.quantity += mod.quantity : this.stats.quantity *= mod.quantity;
            mod.flatOrInc ? this.stats.itemRarity += mod.itemRarity : this.stats.itemRarity *= mod.itemRarity;
        })
    }

    getType() {
        const n = mods.length;
        if (n == 0) return "normal";
        if (n < 3) return "magic";
        if (n < 5) return "rare";
        return "unique";
    }

    takeDamage(dmg) {
        this.stats.currentHp -= dmg;
    }
}

class MobMods {
    // flatOrInc: is the mod a flat bonus or %increase(multiplicative for now) to existing mod?
    constructor(flatOrInc, hp, speed, size, projs, quantity, itemRarity, type) {
        this.flatOrInc = flatOrInc;
        this.hp = hp;
        this.speed = speed;
        this.size = size;
        this.projs = projs;
        this.quantity = quantity;
        this.itemRarity = itemRarity;
    }
}

export class MobStats {
    constructor(hp, speed, size, projs, quantity, itemRarity) {
        this.hp = hp;
        this.currentHp = hp;
        this.speed = speed;
        this.size = size;
        this.projs = projs;
        this.quantity = quantity;
        this.itemRarity = itemRarity;
    }
}