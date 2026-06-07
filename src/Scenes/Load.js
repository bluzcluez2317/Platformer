class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load tilemap information
        this.load.image("tilemap_tiles", "monochrome_tilemap_packed.png");
        this.load.tilemapTiledJSON("platformer-level-1", "Level1.tmj");
        this.load.tilemapTiledJSON("platformer-level-2", "Level2.tmj");
        this.load.tilemapTiledJSON("platformer-level-3", "Level3.tmj");
        this.load.tilemapTiledJSON("platformer-level-4", "Level4.tmj");
        this.load.tilemapTiledJSON("platformer-level-5", "Level5.tmj");

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Particle Pack asset pack
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        this.load.image("player", "tile_0260.png");
    }

    create() {
        // Create animations (shared across all levels)
        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { start: 260, end: 260 }),
            frameRate: 1,
            repeat: -1
        });

        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { start: 261, end: 265 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            frames: this.anims.generateFrameNumbers('tilemap_sheet', { start: 266, end: 266 }),
            frameRate: 1,
            repeat: 0
        });

        // Start with level 1
        this.scene.start("PlayScene", { levelNumber: 1 });
    }

    update() {
    }
}