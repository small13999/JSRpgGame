import {drawArc} from '../../main.js';
import { ProjSpread } from '../util/projspread.js';

class Projectile {
    constructor(x, y, dx, dy, projSpeed, dmg, radius, color, supportGems) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.projSpeed = projSpeed;
        this.dmg = dmg;
        this.radius = radius;
        this.color = color;
        this.delete = false;
        this.maxDistanceTraveled = 2000;
        this.currentDistanceTraveled = 0;
        this.direction = 1;
        this.supportGems = supportGems;
    }

    update() {
        this.supportGems.forEach(supportGem => {
            supportGem.applyToSkillEffect(this);
        })
        this.x += this.dx * this.projSpeed * this.direction;
        this.y += this.dy * this.projSpeed * this.direction;
        this.currentDistanceTraveled += this.projSpeed;
        if (this.currentDistanceTraveled >= this.maxDistanceTraveled) this.delete = true;
        drawArc(this.x, this.y, this.radius, this.color);
    }
}

export class FireBallProjectile extends Projectile {
    constructor(x, y, dx, dy, projSpeed, dmg, radius, color, supportGems) {
        super(x, y, dx, dy, projSpeed, dmg, radius, color, supportGems)
    }

    update() {
        super.update();
    }
}

class ActiveGem {
    //eff: added dmg effectiveness
    constructor(level, eff, baseDmg, cost, xp) {
        this.level = level;
        this.eff = eff;
        this.baseDmg = baseDmg;
        this.cost = cost;
        this.xp = xp;
        this.xpToLevelUp = 100 * Math.pow(1.1, level);
        this.supportGems = [];
        this.getOriginEntityPos = null;
    }

    addXp(xp) {
        if (this.xp + xp >= xpToLevelUp) {
            let leftoverXp = this.xp + xp - this.xpToLevelUp;
            this.level++;
            this.xp = leftoverXp;
            xpToLevelUp *= 1.1;
        }
    }

    linkSupportGem(supportGem) {
        this.supportGems.push(supportGem)
        supportGem.apply(this);
        supportGem.parentGem = this;
    }


}

class ProjectileGem extends ActiveGem {
    constructor(level, eff, baseDmg, cost, xp, projCount, projSpeed) {
        super(level, eff, baseDmg, cost, xp);
        this.projCount = projCount;
        this.projSpeed = projSpeed;
    }
}

export class FireBallGem extends ProjectileGem {
    constructor(level, xp) {
        super(level, 2, 10, 0, xp, 1, 5);
    }

    use() {
        const ret = [];
        const entityObj = this.getOriginEntityPos();
        for (let i = 1; i<=this.projCount; i++) {
            const v = ProjSpread(i, this.projCount, entityObj.dx, entityObj.dy);
            ret.push(new FireBallProjectile(entityObj.x, entityObj.y, v.x, v.y, this.projSpeed, this.baseDmg, 20, "red", this.supportGems));
        }
        return ret;
    }
}

