
class SupportGem {
    constructor(applyFunction, applySkillEffectFunction = null) {
        this.applyFunction = applyFunction;
        this.applySkillEffectFunction = applySkillEffectFunction;
        this.parentGem = null;
    }

    apply(gem) {
        if (this.applyFunction == null) return;
        this.applyFunction(gem);
    }

    applyToSkillEffect(skill) {
        if (this.applySkillEffectFunction == null) return;
        this.applySkillEffectFunction(skill);
    }
}

export class FasterProjectilesGem extends SupportGem {
    constructor() {
        super((gem) => {gem.projSpeed *= 2;});
    }
}

export class ReturningProjectilesGem extends SupportGem {
    constructor() {
        super(null, (skill) => {
            if (this.appliedProjs == undefined) {
                this.appliedProjs = [];
            }
            if (skill.currentDistanceTraveled >= skill.maxDistanceTraveled/2 && !this.appliedProjs.find(elem => elem == skill)) {
                let originPos = this.parentGem.getOriginEntityPos();
                let vx = originPos.x - skill.x;
                let vy = originPos.y - skill.y;
                let dist = Math.sqrt(vx*vx + vy*vy);
                skill.dx = vx/dist;
                skill.dy = vy/dist;
                skill.maxDistanceTraveled *= 1.5;
                this.appliedProjs.push(skill);
            }

            if (skill.delete) {
                const ind = this.appliedProjs.indexOf(skill);
                if (ind > -1) this.appliedProjs.splice(ind, 1);
            }
        });
    }
}

export class GreaterMultipleProjectilesGem extends SupportGem {
    constructor() {
        super((gem => {gem.projCount += 4;}));
    }
}
