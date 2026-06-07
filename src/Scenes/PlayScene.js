class PlayScene extends Phaser.Scene {
    constructor() {
        super("PlayScene");
    }

    init(data) {
        this.levelNumber = data.levelNumber || 1;
        this.levelConfig = LEVELS[this.levelNumber - 1];
        this.savedTime = data.savedTime || 0;

        this.hasKey = false;
        this.hasChestKey = false; 

        this.ACCELERATION = 200;
        this.DRAG = 1500;
        this.JUMP_VELOCITY = -450;
        this.SCALE = 0.90;
        this.COIN_VALUE = 100;

        this.WALL_JUMP_VELOCITY_X = 250;
        this.WALL_JUMP_VELOCITY_Y = -400;
        this.wallSlideGravity = 200;
        
        this.physics.world.gravity.y = 1400;
    }

    create() {
        // Load tilemap
        this.map = this.add.tilemap(this.levelConfig.tilemapKey, 16, 16, 120, 20);
        this.tileset = this.map.addTilesetImage("monochrome_tilemap_packed", "tilemap_tiles");

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.coins = [];
        this.doors = [];
        this.keys = [];
        this.spikes = [];
        this.chest = [];
        this.chestkey = [];

        // Create Coins
        const coinsData = this.map.createFromObjects("Objects", {
            name: "Coin",
            key: "tilemap_sheet",
            frame: 2 
        });
        this.coins = coinsData || [];

        // Create Doors
        const doorsData = this.map.createFromObjects("Objects", {
            name: "Door",
            key: "tilemap_sheet",
            frame: 56 
        });
        this.doors = doorsData || [];

        // Create Keys
        const keysData = this.map.createFromObjects("Objects", {
            name: "Key",
            key: "tilemap_sheet",
            frame: 97
        });
        this.keys = keysData || [];
    
        // Create Spikes if the level has them
        if (this.levelConfig.hasSpikes) {
            const spikesData = this.map.createFromObjects("Objects", {
                name: "Spikes",
                key: "tilemap_sheet",
                frame: 183 
            });
            this.spikes = spikesData || [];
        }

        // Create Chest if the level has them
        if (this.levelConfig.hasChest) {
            const chestData = this.map.createFromObjects("Objects", {
                name: "Chest",
                key: "tilemap_sheet",
                frame: 389
            });
            this.chest = chestData || [];
            this.chest.forEach(c => c.setDepth(1));
        }

        // Create Chest Key if the level has them
        if (this.levelConfig.hasChestKey) {
            const chestkeyData = this.map.createFromObjects("Objects", {
                name: "ChestKey",
                key: "tilemap_sheet",
                frame: 96
            });
            this.chestkey = chestkeyData || [];
            this.chestkey.forEach(k => k.setDepth(1));
        }

        console.log("chest:", this.chest);
        console.log("chestkey:", this.chestkey);

        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        this.physics.world.enable(this.doors, Phaser.Physics.Arcade.STATIC_BODY);
        this.doorGroup = this.add.group(this.doors);

        this.physics.world.enable(this.keys, Phaser.Physics.Arcade.STATIC_BODY);
        this.keyGroup = this.add.group(this.keys);

        if (this.spikes.length > 0) {
            this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
            this.spikeGroup = this.add.group(this.spikes);
        }

        if (this.chest.length > 0) {
            this.physics.world.enable(this.chest, Phaser.Physics.Arcade.STATIC_BODY);
            this.chestGroup = this.add.group(this.chest);
        }

        if (this.chestkey.length > 0) {
            this.physics.world.enable(this.chestkey, Phaser.Physics.Arcade.STATIC_BODY);
            this.chestkeyGroup = this.add.group(this.chestkey);
        }

        // Debug toggle
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);

        // Add player
        this.player = this.physics.add.sprite(
            this.levelConfig.playerStartX || 40,
            this.levelConfig.playerStartY || 200,
            "tilemap_sheet",
            260
        );

        this.player.setScale(this.SCALE);
        this.player.setCollideWorldBounds(true);
        this.player.setAlpha(1);
        this.player.setBlendMode(Phaser.BlendModes.SCREEN);
        this.player.body.setMaxVelocity(300, 450);

        let collisionProcess = (obj1, obj2) => {
            if (!obj2.visible) {
                return false;
            }

            if (obj2.properties.switch && this.player.body.acceleration.x > 0) {
                obj2.index = 166; 
                for (let tile of this.upSwitchable) {
                    tile.visible = true;
                }
                for (let tile of this.downSwitchable) {
                    tile.visible = false;
                }
                return false;
            }

            if (obj2.properties.switch && this.player.body.acceleration.x < 0) {
                obj2.index = 164;
                for (let tile of this.upSwitchable) {
                    tile.visible = false;
                }
                for (let tile of this.downSwitchable) {
                    tile.visible = true;
                }
                return false;
            }

            return true;
        }

        this.physics.add.collider(this.player, this.groundLayer, null, collisionProcess);

        // Particle system
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
        this.coinParticles.stop();

        // Coin collection — adds to score
        if (this.coins.length > 0) {
            this.physics.add.overlap(this.player, this.coinGroup, (obj1, obj2) => {
                const coinX = obj2.x;
                const coinY = obj2.y;
                obj2.destroy();
                this.coinParticles.setPosition(coinX, coinY);
                this.coinParticles.explode(8);
                this.score += this.COIN_VALUE;
                this.scoreText.setText(`Score: ${this.score}`);
            });
        }

        // Door exit — save time and score, move to next level
        if (this.doors.length > 0) {
            this.physics.add.overlap(this.player, this.doorGroup, () => {
                if (!this.hasKey) return;

                // Save this level's time and score to localStorage
                localStorage.setItem(`leveltime_${this.levelNumber}`, this.elapsedTime.toFixed(2));
                localStorage.setItem(`levelscore_${this.levelNumber}`, this.score);

                // Save best time if it's a new record
                const prev = parseFloat(localStorage.getItem(`highscore_level_${this.levelNumber}`));
                if (isNaN(prev) || this.elapsedTime < prev) {
                    localStorage.setItem(`highscore_level_${this.levelNumber}`, this.elapsedTime.toFixed(2));
                }

                const nextLevel = this.levelNumber + 1;
                if (nextLevel > LEVELS.length) {
                    this.scene.start("Winner", { isGameComplete: true });
                } else {
                    // New level: time and score both reset to 0
                    this.scene.start("PlayScene", { levelNumber: nextLevel });
                }
            });
        }

        // Chest Open
        if (this.chest.length > 0) {
            this.physics.add.overlap(this.player, this.chestGroup, (obj1, obj2) => {
                if(!this.hasChestKey) return;
                
                obj2.setFrame(390);
                this.hasKey = true;
            });
        }

        // Key collection
        if (this.keys.length > 0) {
            this.physics.add.overlap(this.player, this.keyGroup, (obj1, obj2) => {
                obj2.destroy();
                this.hasKey = true;
            });
        }

        // ChestKey collection
        if (this.chestkey.length > 0) {
            this.physics.add.overlap(this.player, this.chestkeyGroup, (obj1, obj2) => {
                obj2.destroy();
                this.hasChestKey = true;
            });
        }

        // Spike collision — time continues, score resets
        if (this.spikes.length > 0) {
            this.physics.add.overlap(this.player, this.spikeGroup, () => {
                this.time.delayedCall(50, () => {
                    this.scene.start("PlayScene", { 
                        levelNumber: this.levelNumber,
                        savedTime: this.elapsedTime
                    });
                });
            });
        }

        this.upSwitchable = this.groundLayer.filterTiles((tile) => {
            if (tile.properties.switchable == "Up") {
                return true;
            } else {
                return false;
            }
        });

        for (let tile of this.upSwitchable) {
            tile.visible = false;
        }

        this.downSwitchable = this.groundLayer.filterTiles((tile) => {
            if (tile.properties.switchable == "Down") {
                return true;
            } else {
                return false;
            }
        });

        for (let tile of this.downSwitchable) {
            tile.visible = false;
        }

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.setZoom(1.75);
        this.cameras.main.startFollow(this.player, true, 0.25, 0.25, 0, 0);

        this.jumpsAvailable = 1;
        this.isTouchingWall = false;
        this.wallDirection = 0;

        // Time persists through deaths, score resets
        this.elapsedTime = this.savedTime || 0;
        this.score = 0;

        // HUD
        this.levelText = this.add.text(10, 10, `Level ${this.levelNumber}`, {
            fontSize: '12px',
            fill: '#fff'
        }).setScrollFactor(0).setDepth(10);

        this.timerText = this.add.text(10, 26, `Time: ${this.elapsedTime.toFixed(2)}s`, {
            fontSize: '12px',
            fill: '#fff'
        }).setScrollFactor(0).setDepth(10);

        this.scoreText = this.add.text(10, 42, `Score: 0`, {
            fontSize: '12px',
            fill: '#ffdd00'
        }).setScrollFactor(0).setDepth(10);
    }

    update() {
        const onGround = this.player.body.blocked.down;
        const onWallLeft = this.player.body.blocked.left;
        const onWallRight = this.player.body.blocked.right;
        this.isTouchingWall = !onGround && (onWallLeft || onWallRight);

        if (this.isTouchingWall) {
            this.wallDirection = onWallLeft ? -1 : 1;
            if (this.player.body.velocity.y > 0) {
                this.player.setVelocityY(this.wallSlideGravity);
            }
            this.jumpsAvailable = 1;
        }

        // Movement
        if (this.cursors.left.isDown) {
            this.player.setAccelerationX(-this.ACCELERATION);
            this.player.setFlipX(true);
            if (onGround) this.player.anims.play('walk', true);
        } else if (this.cursors.right.isDown) {
            this.player.setAccelerationX(this.ACCELERATION);
            this.player.setFlipX(false);
            if (onGround) this.player.anims.play('walk', true);
        } else {
            this.player.setAccelerationX(0);
            this.player.setDragX(this.DRAG);
            if (onGround) this.player.anims.play('idle', true);
        }

        // Jumping (double + wall)
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            if (onGround) {
                this.player.setVelocityY(this.JUMP_VELOCITY);
                this.jumpsAvailable = 1;
                this.player.anims.play('jump', true);
            } else if (this.isTouchingWall) {
                this.player.setVelocityY(this.WALL_JUMP_VELOCITY_Y);
                this.player.setVelocityX(-this.wallDirection * this.WALL_JUMP_VELOCITY_X);
                this.jumpsAvailable = 1;
                this.player.anims.play('jump', true);
            } else if (this.jumpsAvailable > 0) {
                this.player.setVelocityY(this.JUMP_VELOCITY * 0.85);
                this.jumpsAvailable--;
                this.player.anims.play('jump', true);
            }
        }

        // Reset jumps on landing
        if (onGround) {
            this.jumpsAvailable = 1;
        }

        // Fall off level = respawn, time continues, score resets
        if (this.player.y > 275) {
            this.time.delayedCall(100, () => {
                this.scene.start("PlayScene", { 
                    levelNumber: this.levelNumber,
                    savedTime: this.elapsedTime
                });
            });
        }

        this.elapsedTime += this.game.loop.delta / 1000;
        this.timerText.setText(`Time: ${this.elapsedTime.toFixed(2)}s`);
    }
}