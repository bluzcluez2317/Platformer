class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }
 
    init() {
        this.ACCELERATION = 250;
        this.DRAG = 1000;
        this.physics.world.gravity.y = 1600;
        this.JUMP_VELOCITY = -480;
        this.PARTICLE_VELOCITY = 50;
        this.SCALE = 0.90;
    }
 
    create() {
        this.map = this.add.tilemap("platformer-level-1", 16, 16, 120, 20);
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_tiles");
    
        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.lootLayer = this.map.createLayer("Coin-n-Diamond", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.coinCount = 0;

        // Create coins
        this.coins = this.map.createFromObjects("Objects", {
            name: "Coin",
            key: "tilemap_sheet",
            frame: 2  
        });

        // Creates Door exit
        this.doors = this.map.createFromObjects("Objects", {
            name: "Door",  
            key: "tilemap_sheet",
            frame: 56  
        });

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.physics.world.enable(this.doors, Phaser.Physics.Arcade.STATIC_BODY);
        this.doorGroup = this.add.group(this.doors);

        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);
    
        // Adds player
        this.player = this.physics.add.sprite(55, 200, "tilemap_sheet", 260);
        this.player.setScale(this.SCALE);
        this.player.setCollideWorldBounds(true);
        this.player.setAlpha(1);
        this.player.setBlendMode(Phaser.BlendModes.SCREEN);
        this.player.body.setMaxVelocity(300, 450);
    
        // Collision
        this.physics.add.collider(this.player, this.groundLayer);
     
        this.coinParticles = this.add.particles(0, 0, "kenny-particles", {
            frame: ['light_01.png', 'light_02.png'],
            scale: { start: 0.005, end: 0 },
            lifespan: 500,
            alpha: { start: 1, end: 0 },
            speedY: { min: -50, max: -100 },
            speedX: { min: -30, max: 30 },
            quantity: 5,
            frequency: -1 
        });
        
        // Stop emitting until we need it
        this.coinParticles.stop();

        // Coin collection with particles
        this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
            // Store position before destroying
            const coinX = obj2.x;
            const coinY = obj2.y;
            
            // Remove the coin
            obj2.destroy();
            this.coinCount++;
            console.log(`Coins: ${this.coinCount}`);
            
            // Makes particles at the coin's position
            this.coinParticles.setPosition(coinX, coinY);
            this.coinParticles.explode(8);  // Emit 8 particles
        });

        // Show winner scene once player reaches door
        this.physics.add.overlap(this.player, this.doorGroup, () => {
            this.scene.start("Winner"); 
        });

    
        this.cursors = this.input.keyboard.createCursorKeys();

        
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(1.75);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25, 0, 0);
    }

 
    update() {
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.setFlipX(true);
            this.player.anims.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.setFlipX(false);
            this.player.anims.play('walk', true);
        } else {
            this.player.setAccelerationX(0);
            this.player.setDragX(this.DRAG);
            this.player.anims.play('idle', true);
        }

        if (this.cursors.up.isDown && this.player.body.blocked.down) {
            this.player.setVelocityY(this.JUMP_VELOCITY);
            this.player.anims.play('jump', true);
        }

        // If player touches the ground they respawn in the beginning 
        if (this.player.y > 275) {
            this.time.delayedCall(100, () => this.scene.restart());
        }
    }
}
