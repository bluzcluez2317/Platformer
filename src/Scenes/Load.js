class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load tilemap information
        this.load.image("tilemap_tiles", "monochrome_tilemap_packed.png");                  
        this.load.tilemapTiledJSON("platformer-level-1", "untitled.tmj"); 

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "monochrome_tilemap_packed.png", {
            frameWidth: 16,
            frameHeight: 16
        });

        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
        this.load.image("player", "tile_0260.png");  

    }

    create() {
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
        
        this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}