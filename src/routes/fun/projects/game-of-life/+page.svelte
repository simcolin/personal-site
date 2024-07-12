<script lang="ts">
    import { numbersOnly } from "$lib/inputHelpers";
    import { onMount } from "svelte";

    let intervalRunning = false;
    let tickInterval: NodeJS.Timeout;
    let width = 20;
    let height = 20;

    let currentGrid: boolean[][] = [];
    let nextGrid: boolean[][] = [];

    let containerWidth: number;
    let containerHeight: number;

    $: gridWidth = currentGrid.length;
    $: gridHeight = currentGrid[0]?.length || 0;
    $: cellSize = Math.min((containerWidth - gridWidth) / gridWidth, (containerHeight - gridHeight) / gridHeight);

    function initGrids() {
        if(intervalRunning) {
            clearInterval(tickInterval);
            intervalRunning = false;
        }
        currentGrid = [];
        nextGrid = [];
        for(let x = 0; x < width; ++x) {
            currentGrid[x] = [];
            nextGrid[x] = [];
            for(let y = 0; y < height; ++y) {
                currentGrid[x][y] = false;
                nextGrid[x][y] = false;
            }
        }
    }

    function toggleCell(x: number, y: number) {
        if(currentGrid[x][y]) {
            currentGrid[x][y] = false;
        } else {
            currentGrid[x][y] = true;
        }
    }

    function clearGrids() {
        if(intervalRunning) {
            clearInterval(tickInterval);
            intervalRunning = false;
        }
        for(let x = 0; x < width; ++x) {
            for(let y = 0; y < height; ++y) {
                currentGrid[x][y] = false;
                nextGrid[x][y] = false;
            }
        }
    }

    function isInGrid(x: number, y: number) {
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    function tick() {
        for(let x = 0; x < width; ++x) {
            for(let y = 0; y < height; ++y) {
                let aliveNeightbors = 0;
                for(let i = x - 1; i <= x + 1; ++i) {
                    for(let j = y - 1; j <= y + 1; ++j) {
                        if(isInGrid(i, j) && currentGrid[i][j] && !(x === i && y === j)) {
                            aliveNeightbors++;
                        }
                    }
                }
                nextGrid[x][y] = (currentGrid[x][y] && (aliveNeightbors === 2 || aliveNeightbors === 3)) || aliveNeightbors === 3;
            }
        }
        const tmp = currentGrid;
        currentGrid = nextGrid;
        nextGrid = tmp;
    }

    function toggleAutoTick() {
        if(intervalRunning) {
            clearInterval(tickInterval);
        } else {
            tick();
            tickInterval = setInterval(() => tick(), 500);
        }
        intervalRunning = !intervalRunning;
    }

    function manualTick() {
        if(intervalRunning) {
            clearInterval(tickInterval);
            intervalRunning = false;
        }
        tick();
    }

    // function printGridInConsole(grid: boolean[][]) {
    //     let str = "";
    //     for(let x = 0; x < width; ++x) {
    //         for(let y = 0; y < height; ++y) {
    //             str += grid[y][x] ? "1" : "0";
    //         }
    //         str += "\n";
    //     }
    //     console.log(str);
    // }

    onMount(() => {
        initGrids();
    });
</script>

<div class="w-full h-full bg-slate-800 flex flex-col items-center justify-center gap-4 p-8">
    <div class="flex gap-4">
        <button class="rounded py-2 px-4 border bg-slate-700 hover:bg-slate-600" on:click={() => toggleAutoTick()}>{intervalRunning ? "Stop" : "Start"}</button>
        <button class="rounded py-2 px-4 border bg-slate-700 hover:bg-slate-600" on:click={() => manualTick()}>Next</button>
        <button class="rounded py-2 px-4 border bg-slate-700 hover:bg-slate-600" on:click={() => clearGrids()}>Clear</button>
    </div>
    <div class="flex gap-4">
        <button class="rounded py-2 px-4 border bg-slate-700 hover:bg-slate-600" on:click={() => initGrids()}>Init Grids</button>
        <input class="rounded py-2 px-4 border bg-slate-700 appearance-none" use:numbersOnly bind:value={width} type="number">
        <input class="rounded py-2 px-4 border bg-slate-700 appearance-none" use:numbersOnly bind:value={height} type="number">
    </div>
    <div class="w-full grow flex items-center justify-center" bind:clientWidth={containerWidth} bind:clientHeight={containerHeight}>
        <div class="max-w-full flex gap-[1px]">
            {#each currentGrid as row, x}
                <div class="flex flex-col gap-[1px]">
                    {#each row as cell, y}
                        <button on:click={() => toggleCell(x, y)} class="cell" style:--cell-size-js="{cellSize}px" class:bg-black={cell} class:bg-white={!cell} />
                    {/each}
                </div>
            {/each}
        </div>
    </div>
</div>

<style lang="postcss">
    .cell {
        --cell-size: min(1.5rem, var(--cell-size-js));
        width: var(--cell-size);
        height: var(--cell-size);
    }

    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    /* Firefox */
    input[type=number] {
        -moz-appearance: textfield;
    }
</style>