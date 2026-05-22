class Winner extends Phaser.Scene {
    constructor() {
        super('Winner');
    }

    preload(){
        this.load.setPath("./assets/");
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
    }

    create() {
        this.add.bitmapText(200, 250, "rocketSquare", "You won!").setScale(2);
        this.add.bitmapText(180, 320, "rocketSquare", "Press SPACE to restart");

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start("platformerScene");
        });
    }
}