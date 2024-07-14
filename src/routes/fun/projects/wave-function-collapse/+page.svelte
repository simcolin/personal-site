<script lang="ts">
    import { onMount } from "svelte";
    import { u, Vector2 } from "../utils";
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    const LEFT = "left";
    const RIGHT = "right";
    const TOP = "top";
    const BOTTOM = "bottom";

    const MIN_GRID_SIZE = 15;
    let tileSize = 0;
    let gridSize: Vector2;

    const usedTiles = [0, 1, 2, 3, 4, 5, 13, 15, 16, 17, 25, 26, 27, 40, 48, 57, 59];
    let tilemap: HTMLImageElement;
    let tilemapSize: Vector2;
    let tileset = new Map<number, Tile>();
    let generation: number[][];
    let niceGeneration: number[][];

    let isPrintingTileset = false;
    let isRawVersion = false;

    const randomInt = (a: number, b?: number) => Math.floor(u.random(a, b));
    const unique = <T>(v: T, i: number, a: T[]) => a.indexOf(v) === i;

    function hasChance(nb: number) {
        return u.random(100) > nb;
    }

    function loadTileset() {
        for(let i = 0; i < 132; ++i) {
            const tileId = i;
            tileset.set(tileId, new Tile(tileId % tilemapSize.x, Math.floor(tileId / tilemapSize.x), tileId));
        }
        tileset.set(132, new Tile(50 % tilemapSize.x, Math.floor(50 / tilemapSize.x), 132));
        (tileset.get(132) as Tile).rotation = -90;
        tileset.set(133, new Tile(52 % tilemapSize.x, Math.floor(52 / tilemapSize.x), 133));
        (tileset.get(133) as Tile).rotation = -90;
        tileset.set(134, new Tile(53 % tilemapSize.x, Math.floor(53 / tilemapSize.x), 134));
        (tileset.get(134) as Tile).rotation = -90;

        
        canBe(0, TOP, [0, 25, 26, 27]);
        canBe(0, RIGHT, [0, 1, 13, 25]);
        canBe(0, BOTTOM, [0, 1, 2, 3]);
        canBe(0, LEFT, [0, 3, 15, 17]);

        canBe(1, TOP, [25, 26, 27]);
        canBe(1, RIGHT, [2]);
        canBe(1, BOTTOM, [13, 15, 17]);
        canBe(1, LEFT, [3, 15, 27]);

        canBe(2, TOP, [25, 26, 27]);
        canBe(2, RIGHT, [2, 3]);
        canBe(2, BOTTOM, [40]);
        canBe(2, LEFT, [2]);

        canBe(3, TOP, [25, 26, 27]);
        canBe(3, RIGHT, [1, 13, 25]);
        canBe(3, BOTTOM, [15, 16, 27]);
        canBe(3, LEFT, []);

        canBe(4, TOP, [48]);
        canBe(4, RIGHT, [26, 5]);
        canBe(4, BOTTOM, [15, 16]);
        canBe(4, LEFT, [5, 48]);

        canBe(5, TOP, [48]);
        canBe(5, RIGHT, [48]);
        canBe(5, BOTTOM, [13, 17]);
        canBe(5, LEFT, [26]);

        canBe(13, TOP, [13]);
        canBe(13, RIGHT, [40, 48]);
        canBe(13, BOTTOM, [25, 17, 13]);
        canBe(13, LEFT, [15, 27]);

        canBe(15, TOP, [15]);
        canBe(15, RIGHT, [25]);
        canBe(15, BOTTOM, [15, 27, 16]);
        canBe(15, LEFT, [40, 48]);

        canBe(16, TOP, []);
        canBe(16, RIGHT, [17]);
        canBe(16, BOTTOM, [57]);
        canBe(16, LEFT, [40, 48]);

        canBe(17, TOP, []);
        canBe(17, RIGHT, [40, 48]);
        canBe(17, BOTTOM, [59]);
        canBe(17, LEFT, []);
        
        canBe(25, TOP, []);
        canBe(25, RIGHT, [26]);
        canBe(25, BOTTOM, []);
        canBe(25, LEFT, [27]);
        
        canBe(26, TOP, [48]);
        canBe(26, RIGHT, [27, 26]);
        canBe(26, BOTTOM, []);
        canBe(26, LEFT, [26]);
        
        canBe(27, TOP, []);
        canBe(27, RIGHT, []);
        canBe(27, BOTTOM, []);
        canBe(27, LEFT, []);
        
        canBe(40, TOP, []);
        canBe(40, RIGHT, [40, 59]);
        canBe(40, BOTTOM, [48]);
        canBe(40, LEFT, [40, 57]);
        
        canBe(48, TOP, [48, 57, 59]);
        canBe(48, RIGHT, [48, 57]);
        canBe(48, BOTTOM, [48]);
        canBe(48, LEFT, [48, 59]);
        
        canBe(57, TOP, []);
        canBe(57, RIGHT, [59]);
        canBe(57, BOTTOM, []);
        canBe(57, LEFT, []);
        
        canBe(59, TOP, []);
        canBe(59, RIGHT, []);
        canBe(59, BOTTOM, []);
        canBe(59, LEFT, []);
    }

    function opposite(side: string) {
        if(side === TOP) return BOTTOM;
        if(side === BOTTOM) return TOP;
        if(side === LEFT) return RIGHT;
        return LEFT;
    }

    function canBe(tileId: number, side: string, tileIds: number[]) {
        for(const tId of tileIds) {
            const tmp1 = tileset.get(tileId)?.constraints.get(side) as number[];
            if(!tmp1.includes(tId))
                tmp1.push(tId);
            const tmp2 = tileset.get(tId)?.constraints.get(opposite(side)) as number[];
            if(!tmp2.includes(tileId))
                tmp2.push(tileId);
        }
    }

    function printTileset() {
        ctx.fillStyle = u.color(31, 31, 31).toRGBA();
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(tilemap, 0, 0, tileSize * 12, tileSize * 11);
        let fontSize = Math.round(tileSize / 2);
        ctx.font = fontSize + "px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 3;

        for(let x = 0; x < tilemapSize.x; ++x) {
            for(let y = 0; y < tilemapSize.y; ++y) {
                let text = `${x + y * tilemapSize.x}`;
                let textSize = ctx.measureText(text);
                ctx.strokeText(text, (x + 0.5) * tileSize - textSize.width / 2, (y + 0.5) * tileSize + fontSize / 2)
                ctx.fillText(text, (x + 0.5) * tileSize - textSize.width / 2, (y + 0.5) * tileSize + fontSize / 2);
            }
        }
        ctx.lineWidth = 1;
    }

    function createGeneration() {
        console.time("generation");

        type Possibilities = { values: number[], pos: Vector2, final: boolean };

        let tiles: number[][] = [];
        let possibilities: Possibilities[][] = [];
        for(let x = 0; x < gridSize.x; ++x) {
            tiles[x] = [];
            possibilities[x] = [];
            for(let y = 0; y < gridSize.y; ++y) {
                tiles[x][y] = -1;
                possibilities[x][y] = { values: usedTiles, pos: u.vector2(x, y), final: false };
            }
        }

        const applyPossFilter = (x: number, y: number, tileIds: number[]): number => {
            if(x < 0 || y < 0 || x >= gridSize.x || y >= gridSize.y) return 0;
            const p = possibilities[x][y];
            const oldLength = p.values.length;
            p.values = p.values.filter(poss => tileIds.includes(poss));
            if(oldLength === p.values.length) return 0;
            
            return 1
                + applyPossFilter(x - 1, y, p.values.map(tId => tileset.get(tId)?.constraints.get(LEFT)).flat().filter(unique) as number[])
                + applyPossFilter(x + 1, y, p.values.map(tId => tileset.get(tId)?.constraints.get(RIGHT)).flat().filter(unique) as number[])
                + applyPossFilter(x, y - 1, p.values.map(tId => tileset.get(tId)?.constraints.get(TOP)).flat().filter(unique) as number[])
                + applyPossFilter(x, y + 1, p.values.map(tId => tileset.get(tId)?.constraints.get(BOTTOM)).flat().filter(unique) as number[])
        }

        let counter = 0;
        while(true) {
            let filteredPoss: Possibilities[] = [];
            for(let x = 0; x < gridSize.x; ++x) {
                for(let y = 0; y < gridSize.y; ++y) {
                    const p = possibilities[x][y];
                    if(!p.final) {
                        if(filteredPoss.length === 0) {
                            filteredPoss.push(p);
                        } else if(filteredPoss[0].values.length > p.values.length) {
                            filteredPoss = [p];
                        } else if(filteredPoss[0].values.length === p.values.length) {
                            filteredPoss.push(p);
                        }
                    }
                }
            }

            if(filteredPoss.length === 0) break;

            const selection = filteredPoss[randomInt(filteredPoss.length)];
            const newTileId = selection.values[randomInt(selection.values.length)];;
            tiles[selection.pos.x][selection.pos.y] = newTileId
            possibilities[selection.pos.x][selection.pos.y].final = true;
            const changes = applyPossFilter(selection.pos.x, selection.pos.y, [newTileId]);
        }
        
        generation = tiles;
        createNiceGeneration();
        console.timeEnd("generation");
    }

    function createNiceGeneration() {
        niceGeneration = generation.slice();
        for(let i = 0; i < gridSize.x; ++i) {
            niceGeneration[i] = generation[i].slice();
        }

        const getTile = (x: number, y: number) => {
            if(x < 0 || y < 0 || x >= gridSize.x || y >= gridSize.y) return -1;
            return generation[x][y];
        }

        const getNiceTile = (x: number, y: number) => {
            if(x < 0 || y < 0 || x >= gridSize.x || y >= gridSize.y) return -1;
            return niceGeneration[x][y];
        }
        
        for(let x = 0; x < gridSize.x; ++x) {
            for(let y = 0; y < gridSize.y; ++y) {
                const thisTile = getTile(x, y);
                const thisNiceTile = getNiceTile(x, y);
                const topTile = getTile(x, y - 1);
                const topNiceTile = getNiceTile(x, y - 1);
                const leftTile = getTile(x - 1, y);
                const leftNiceTile = getNiceTile(x - 1, y);
                const rightTile = getTile(x + 1, y);
                const bottomTile = getTile(x, y + 1);

                if(thisNiceTile === 48 && [40, 57, 59].includes(topTile)) {
                    if(![-1, 48].includes(leftTile))
                        niceGeneration[x][y] = 133;
                    else
                        niceGeneration[x][y] = 50;
                } else if(thisTile === 48 && leftTile !== 48) {
                    if(leftTile === 5)
                        niceGeneration[x][y] = 134;
                    else
                        niceGeneration[x][y] = 132;
                } else if(leftNiceTile === 40 && rightTile === 40) {
                    if(hasChance(70)) 
                        if(hasChance(50))
                            niceGeneration[x][y] = 28;
                        else
                            niceGeneration[x][y] = 29;
                    else if(hasChance(75)) {
                        if(topTile === 2) niceGeneration[x][y - 1] = 6;
                        niceGeneration[x][y] = 18;
                        if(bottomTile === 48) niceGeneration[x][y + 1] = 30;
                    }
                } else if(thisNiceTile === 48 && leftNiceTile === 50) {
                    niceGeneration[x][y] = 53;
                } else if(thisNiceTile === 48 && hasChance(85)) {
                    niceGeneration[x][y] = 49;
                } else if(thisNiceTile === 48 && hasChance(90)) {
                    niceGeneration[x][y] = 42;
                } else if(thisNiceTile === 0 && hasChance(95)) {
                    niceGeneration[x][y] = 12;
                } else if(thisNiceTile === 0 && hasChance(95)) {
                    niceGeneration[x][y] = 24;
                } else if(thisNiceTile === 40 && hasChance(95)) {
                    niceGeneration[x][y] = 21;
                } else if([0, 48].includes(thisTile) && hasChance(90)) {
                    if(![63, 75].includes(topNiceTile)) {
                        if(hasChance(90) && topTile !== -1) {
                            niceGeneration[x][y] = 75;
                            niceGeneration[x][y - 1] = 63;
                        }
                        else
                            niceGeneration[x][y] = 63;
                    }
                }
            }
        }
    }

    async function preload() {
        console.time("preload");
        tilemapSize = u.vector2(12, 11);
        tilemap = await u.loadImage("data:image/png;base64,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")
    }

    function setup() {
        console.timeEnd("preload");
        ctx.imageSmoothingEnabled = false;
        
        tileSize = Math.floor(Math.min(canvas.width, canvas.height) / MIN_GRID_SIZE);
        gridSize = u.vector2(
            Math.floor(canvas.width / tileSize),
            Math.floor(canvas.height / tileSize)
        );

        console.time("loadTileset");
        loadTileset();
        console.timeEnd("loadTileset");
        
        createGeneration();
    }

    function draw() {
        if(isPrintingTileset) {
            printTileset();
        } else if(isRawVersion) {
            ctx.fillStyle = u.color(31, 31, 31).toRGBA();
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for(let x = 0; x < gridSize.x; ++x) {
                for(let y = 0; y < gridSize.y; ++y) {
                    if(generation[x][y] !== -1) {
                        tileset.get(generation[x][y])?.render(x * tileSize, y * tileSize);
                    }
                }
            }
        } else {
            ctx.fillStyle = u.color(31, 31, 31).toRGBA();
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for(let x = 0; x < gridSize.x; ++x) {
                for(let y = 0; y < gridSize.y; ++y) {
                    if(niceGeneration[x][y] !== -1) {
                        tileset.get(niceGeneration[x][y])?.render(x * tileSize, y * tileSize);
                    }
                }
            }
        }
    }

    function keyPressed(event: KeyboardEvent) {
        if(event.code === "Space") {
            createGeneration();
            isPrintingTileset = false;
            draw();
        }
        if(event.code === "KeyQ") {
            isPrintingTileset = !isPrintingTileset;
            draw();
        }
        if(event.code === "KeyW") {
            isPrintingTileset = false;
            isRawVersion = !isRawVersion;
            draw();
        }
    }

    class Tile {
        img: HTMLCanvasElement;
        tId: number;
        rotation: number;
        constraints: Map<string, number[]>;

        constructor(xTex: number, yTex: number, tId: number) {
            const xTexSize = tilemap.width / tilemapSize.x;
            const yTexSize = tilemap.height / tilemapSize.y;
            this.img = u.cropImage(tilemap, xTex * xTexSize, yTex * yTexSize, xTexSize, yTexSize);
            this.tId = tId;
            this.rotation = 0;
            this.constraints = new Map([
                [TOP, []],
                [RIGHT, []],
                [BOTTOM, []],
                [LEFT, []],
            ]);
        }

        render(x: number, y: number) {
            ctx.translate(x + tileSize / 2, y + tileSize / 2);
            ctx.rotate(Math.PI / 180 * this.rotation);
            ctx.drawImage(this.img, -tileSize / 2, -tileSize / 2, tileSize, tileSize);
            ctx.resetTransform();
        }
    }

    onMount(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx = canvas.getContext("2d")!;
        preload().then(() => {
            setup();
            draw();
        });
    });
</script>

<div class="w-full h-full">
    <canvas bind:this={canvas} class="w-full h-full" />
</div>

<svelte:window on:keypress={keyPressed} />