
class SupportGem {
    constructor(applyFunction, applySkillEffectFunction = null) {
        this.applyFunction = applyFunction;
        this.applySkillEffectFunction = applySkillEffectFunction;
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
            if (skill.currentDistanceTraveled >= skill.maxDistanceTraveled/2) skill.direction = -1;
        });
    }
}

export class GreaterMultipleProjectilesGem extends SupportGem {
    constructor() {
        super((gem => {gem.projCount += 4;}));
    }
}
