<script lang="ts" context="module">
    const map_init = [
        ["park", "/karuta-images/park.svg"],
        ["gas_station", "/karuta-images/fuel.svg"],
        ["italian_restaurant", "/karuta-images/italian.svg"],
        ["taco_shop", "/karuta-images/taco.svg"],
        ["sandwich_shop", "/karuta-images/sandwich.svg"],
        ["fair", "/karuta-images/fair.svg"],
        ["juice_shop", "/karuta-images/juice.svg"],
        ["cofee_shop", "/karuta-images/coffee.svg"],
        ["night_club", "/karuta-images/cocktail.svg"],
        ["flower_garden", "/karuta-images/flower.svg"],
        ["ballroom", "/karuta-images/ballroom.svg"],
        ["theatre", "/karuta-images/theatre.svg"],
        ["airport", "/karuta-images/plane.svg"],
        ["jewelry_store", "/karuta-images/ring.svg"],
        ["shopping_mall", "/karuta-images/shopping.svg"],
        ["home", "/karuta-images/home.svg"],
        ["junction", "/karuta-images/junction.svg"],
        ["road", "/karuta-images/road_2.svg"],
        ["road_vertical", "/karuta-images/road_2_vertical.svg"],
        ["block", "/karuta-images/none.svg"],
        ["unknown", "/karuta-images/unknown.svg"],
        ["move_up", "/karuta-images/move_up.svg"],
        ["move_down", "/karuta-images/move_down.svg"],
        ["move_left", "/karuta-images/move_left.svg"],
        ["move_right", "/karuta-images/move_right.svg"],
    ] as const;
    
    // type Test = keyof typeof map_init;
    // type ImageMapKey = typeof map_init[i][0];

    export const image_map = new Map<string, string>(map_init);

    export function get_tile_image_url(tile: Tile, x: number, _y: number) {
        if(tile.type === "activity") {
            return image_map.get(tile.name) as string;
        } else if(tile.type === "road" && (x % 2) === 0) {
            return image_map.get("road_vertical") as string;
        }
        return image_map.get(tile.type) as string;
    }
</script>

<script lang="ts">
    import { contextmenu } from "$lib/ContextMenu.svelte";
    import { show_coordinates } from "./option_store";
    import { activities, is_on_border, DOWN, LEFT, RIGHT, UP, tiles } from "./solver";
    import type { Tile, Vec2 } from "./solver-types";

    export let board: Tile[][];
    export let car_direction: Vec2;
    export let car_position: Vec2;
    export let hypothesis: Vec2[];

    const CAR_ICON = "🚗";
    const RESPONSIVE_THRESHOLD = 600;

    $: ROAD_SIZE = window_width > RESPONSIVE_THRESHOLD ? 2 : 1; // in rem
    $: ACTIVITY_SIZE = window_width > RESPONSIVE_THRESHOLD ? 4 : 2; // in rem
    $: BOARD_SIZE_X = ROAD_SIZE * 6 + ACTIVITY_SIZE * 5;
    $: BOARD_SIZE_Y = ROAD_SIZE * 8 + ACTIVITY_SIZE * 7;

    let window_width: number = 1600;

    function on_tile_click(event: MouseEvent, x: number, y: number, tile: Tile) {
        if(tile.type === "road" && !is_on_border(x, y)) {
            board[x][y] = tiles.block;
        } else if(tile.type === "block" && !is_on_border(x, y)) {
            board[x][y] = tiles.road;
        } else if(tile.type === "activity" || tile.type === "park" || tile.type === "unknown") {
            const options = activities.filter(t => tile.type === "park" || tile.type === "unknown" || tile.name !== t.name).map(t => ({
                text: `<img style="height: 1rem; margin-right: 0.5rem;" src="${get_tile_image_url(t, x, y)}"> ${t.name}`,
                action: () => {
                    remove_hypothesis(x, y);
                    board[x][y] = t;
                },
            }));
            if(tile.type !== "park") {
                options.push({
                    text: `<img style="height: 1rem; margin-right: 0.5rem;" src="${get_tile_image_url(tiles.park, x, y)}"> park`,
                    action: () => {
                        remove_hypothesis(x, y);
                        board[x][y] = tiles.park;
                    },
                });
            }
            contextmenu.open(event, options);
        }
    }

    function get_style_for_pos(x: number, y: number, ROAD_SIZE: number, ACTIVITY_SIZE: number) {
        let style = "";
        style += (x % 2 === 0) ? `left: ${(ROAD_SIZE + ACTIVITY_SIZE) * (x / 2)}rem;` : `left: ${ROAD_SIZE + (ROAD_SIZE + ACTIVITY_SIZE) * Math.floor(x / 2)}rem;`;
        style += (y % 2 === 0) ? `top: ${(ROAD_SIZE + ACTIVITY_SIZE) * (y / 2)}rem;` : `top: ${ROAD_SIZE + (ROAD_SIZE + ACTIVITY_SIZE) * Math.floor(y / 2)}rem;`;
        style += (x % 2 === 0) ? `width: ${ROAD_SIZE}rem;` : `width: ${ACTIVITY_SIZE}rem;`;
        style += (y % 2 === 0) ? `height: ${ROAD_SIZE}rem;` : `height: ${ACTIVITY_SIZE}rem;`;
        return style;
    }

    function get_tile_transform(tile: Tile, _x: number, _y: number) {
        if(tile.type === "activity" || tile.type === "park" || tile.type === "unknown") {
            return "scale(0.75)";
        }
        return null;
    }

    function get_car_rotation(direction: Vec2) {
        if(direction === UP) return "scaleX(-1) rotate(90deg)";
        else if(direction === DOWN) return "rotate(270deg)";
        else if(direction === LEFT) return null;
        else if(direction === RIGHT) return "scaleX(-1)";
        return null;
    }

    function remove_hypothesis(x: number, y: number) {
        const index = hypothesis.findIndex(h => h.x === x && h.y === y);
        if(index !== -1) {
            hypothesis.splice(index, 1);
            hypothesis = hypothesis;
        }
    }

    function is_hypothetic(x: number, y: number, hypothesis: Vec2[]) {
        return hypothesis.some(h => h.x === x && h.y === y);
    }
</script>

<svelte:window bind:innerWidth={window_width} />

<div class="relative text-[2.5rem] leading-4" style:width={BOARD_SIZE_X + "rem"}  style:height={BOARD_SIZE_Y + "rem"} >
    {#each board as row, x}
        {#each row as tile, y}
            <button
                class="absolute"
                style={get_style_for_pos(x, y, ROAD_SIZE, ACTIVITY_SIZE)}
                on:click={e => on_tile_click(e, x, y, tile)}>
                <div class="relative flex justify-center items-center w-full h-full">
                    <img class="w-full h-full" style:transform={get_tile_transform(tile, x, y)} src={get_tile_image_url(tile, x, y)} alt="pog">
                    {#if car_position.x === x && car_position.y === y}
                        <span class="absolute" style:font-size={((ROAD_SIZE + ACTIVITY_SIZE) / 2 )+ "rem"} style:transform={get_car_rotation(car_direction)}>{CAR_ICON}</span>
                    {/if}
                    {#if is_hypothetic(x, y, hypothesis)}
                        <div class="absolute right-0 top-0 flex">
                            <img class="w-8 h-8" src="/karuta-images/unknown.svg" alt="">
                        </div>
                    {/if}
                </div>
            </button>
        {/each}
    {/each}
    {#if $show_coordinates}
        {#each board as _, x}
            {#each _ as __, y}
                <button
                    class="absolute flex justify-center items-center pointer-events-none text-lg text-white font-bold text-outline"
                    style={get_style_for_pos(x, y, ROAD_SIZE, ACTIVITY_SIZE)}>
                    {x},{y}
                </button>
            {/each}
        {/each}
    {/if}
</div>

{#each Array.from(image_map.values()) as image}
    <img class="hidden w-0 h-0" src={image} alt="">
{/each}

<style>
    .text-outline {
        filter: drop-shadow(0 0 4px #000);
    }
</style>