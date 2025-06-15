class BattlePass {
    constructor() {
        this.season = 1;
        this.maxLevel = 50;
        this.currentLevel = 0;
        this.experience = 0;
        this.hasPremium = false;
        this.rewards = this.generateRewards();
    }
    
    generateRewards() {
        const rewards = [];
        for (let i = 1; i <= this.maxLevel; i++) {
            rewards.push({
                level: i,
                free: this.getFreeReward(i),
                premium: this.getPremiumReward(i),
                unlocked: false
            });
        }
        return rewards;
    }
    
    getFreeReward(level) {
        const freeRewards = [
            { type: 'coins', amount: 100 },
            { type: 'powerup', item: 'hint_eliminator' },
            { type: 'coins', amount: 150 },
            { type: 'cosmetic', item: 'joy_bible' },
            // ... más recompensas
        ];
        return freeRewards[level % freeRewards.length];
    }
    
    addExperience(amount) {
        this.experience += amount;
        while (this.experience >= this.getRequiredXP()) {
            this.levelUp();
        }
    }
}