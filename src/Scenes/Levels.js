// Level configuration data
const LEVELS = [
    {
        levelNumber: 1,
        tilemapKey: "platformer-level-1",
        playerStartX: 40,
        playerStartY: 200,
        enemies: [
        { x: 310, y: 150, patrolSpeed: 50, patrolDistance: 100 },
        { x: 1050, y: 150, patrolSpeed: 50, patrolDistance: 50 },
        { x: 1300, y: 150, patrolSpeed: 50, patrolDistance: 50 }
        ],
        hasKeys: true,
        hasSpikes: true
    },
    {
        levelNumber: 2,
        tilemapKey: "platformer-level-2",
        playerStartX: 40,
        playerStartY: 200,
        enemies: [
        { x: 300, y: 170, patrolSpeed: 50, patrolDistance: 50 },
        { x: 1625, y: 170, patrolSpeed: 50, patrolDistance: 75 }
        ],
        hasKeys: true,
        hasSpikes: true
    },
    {
        levelNumber: 3,
        tilemapKey: "platformer-level-3",
        playerStartX: 55,
        playerStartY: 200,
        enemies: [
        { x: 775, y: 100, patrolSpeed: 50, patrolDistance: 75 },
        { x: 1100, y: 170, patrolSpeed: 50, patrolDistance: 75 }
        ],
        hasKeys: true,
        hasSpikes: true
    },
    {
        levelNumber: 4,
        tilemapKey: "platformer-level-4",
        playerStartX: 55,
        playerStartY: 200,
        hasKeys: true,
        hasSpikes: false
    },
    {
        levelNumber: 5,
        tilemapKey: "platformer-level-5",
        playerStartX: 40,
        playerStartY: 175,
        hasKeys: true,
        hasSpikes: false,
        hasChest: true,
        hasChestKey: true
    }
];