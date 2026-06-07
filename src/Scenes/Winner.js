class Winner extends Phaser.Scene {
    constructor() {
        super("Winner");
    }

    init(data) {
        this.isGameComplete = data.isGameComplete || false;
    }

    create() {
        const cx = this.cameras.main.centerX;
        let y = 60;

        this.add.text(cx, y, '🏆 You Win!', {
            fontSize: '32px',
            fill: '#ffdd00'
        }).setOrigin(0.5);

        y += 50;
        this.add.text(cx, y, 'Level Results:', {
            fontSize: '18px',
            fill: '#fff'
        }).setOrigin(0.5);

        y += 30;

        // Column headers
        this.add.text(cx - 80, y, 'Level', { fontSize: '13px', fill: '#aaa' }).setOrigin(0.5);
        this.add.text(cx,      y, 'Time',  { fontSize: '13px', fill: '#aaa' }).setOrigin(0.5);
        this.add.text(cx + 80, y, 'Score', { fontSize: '13px', fill: '#aaa' }).setOrigin(0.5);

        y += 24;

        let totalTime = 0;
        let totalScore = 0;

        for (let i = 1; i <= LEVELS.length; i++) {
            const time = parseFloat(localStorage.getItem(`leveltime_${i}`));
            const score = parseInt(localStorage.getItem(`levelscore_${i}`)) || 0;
            const best = parseFloat(localStorage.getItem(`highscore_level_${i}`));
            const isRecord = !isNaN(time) && !isNaN(best) && time <= best;

            const timeStr = !isNaN(time) ? `${time.toFixed(2)}s` : '--';
            const color = isRecord ? '#ffdd00' : '#fff';

            this.add.text(cx - 80, y, `${i}${isRecord ? ' 🏆' : ''}`, { fontSize: '14px', fill: color }).setOrigin(0.5);
            this.add.text(cx,      y, timeStr,       { fontSize: '14px', fill: color }).setOrigin(0.5);
            this.add.text(cx + 80, y, `${score}`,    { fontSize: '14px', fill: '#88ff88' }).setOrigin(0.5);

            if (!isNaN(time)) totalTime += time;
            totalScore += score;
            y += 26;
        }

        // Divider line
        y += 6;
        this.add.text(cx, y, '─────────────────', { fontSize: '12px', fill: '#555' }).setOrigin(0.5);

        y += 20;
        this.add.text(cx, y, `Total Time: ${totalTime.toFixed(2)}s`, {
            fontSize: '16px',
            fill: '#fff'
        }).setOrigin(0.5);

        y += 24;
        this.add.text(cx, y, `Total Score: ${totalScore}`, {
            fontSize: '18px',
            fill: '#ffdd00'
        }).setOrigin(0.5);

        // Play again button
        y += 44;
        const btn = this.add.text(cx, y, '[ Play Again ]', {
            fontSize: '18px',
            fill: '#fff'
        }).setOrigin(0.5).setInteractive();

        btn.on('pointerover', () => btn.setColor('#ffdd00'));
        btn.on('pointerout', () => btn.setColor('#fff'));
        btn.on('pointerdown', () => {
            // Clear all stored level data for a fresh run
            for (let i = 1; i <= LEVELS.length; i++) {
                localStorage.removeItem(`leveltime_${i}`);
                localStorage.removeItem(`levelscore_${i}`);
            }
            this.scene.start("PlayScene", { levelNumber: 1 });
        });
    }
}