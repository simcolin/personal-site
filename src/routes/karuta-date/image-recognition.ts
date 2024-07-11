import { BOARD_HEIGHT, BOARD_WIDTH, LEFT, RIGHT, tiles, tile_list } from "./solver";
import type { Tile, Vec2 } from "./solver-types";
import ImageRecoWorker from "./image-reco-worker?worker";
import type { SearchPatternRequest, SearchPatternResponse } from "./image-reco-worker";
import { multi_thread } from "./option_store";
import { get } from "svelte/store";
import { is_similar_to, type PatternSearchResult } from "./image-recognition-fn";

type LoadImageOptions = {
    reverse_x: boolean,
    fixed_width: number,
    fixed_height: number,
    log_loading_time: boolean,
}

export function load_image_data_from_url(url: string, options?: Partial<LoadImageOptions>): Promise<ImageData> {
    let opts: LoadImageOptions = {
        reverse_x: false,
        fixed_width: 0,
        fixed_height: 0,
        log_loading_time: false,
        ...options,
    };
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            if(opts.log_loading_time) console.timeEnd("loading image");
            opts = {
                ...opts,
                fixed_width: image.width,
                fixed_height: image.height,
                ...options,
            };
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
            canvas.width = opts.fixed_width;
            canvas.height = opts.fixed_height;
            if(opts.reverse_x) {
                ctx.scale(-1, 1);
                ctx.drawImage(image, 0, 0, -canvas.width, canvas.height);
            } else {
                ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            }
            const img_data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            resolve(img_data);
        }
        image.onerror = err => {
            if(opts.log_loading_time) console.timeEnd("loading image");
            reject(err);
        }
        if(opts.log_loading_time) console.time("loading image");
        image.src = url;
    });
}

type ColorArray = [number, number, number, number];

const car_window_color: ColorArray = [47, 108, 250, 255]; // #2f6cfa
const road_color: ColorArray = [93, 95, 93, 255]; // #5d5f5d

const road_pixel_positions = [
    { tile_x: 2, tile_y: 13, x: 207, y: 567 },
    { tile_x: 4, tile_y: 13, x: 331, y: 567 },
    { tile_x: 6, tile_y: 13, x: 455, y: 567 },
    { tile_x: 8, tile_y: 13, x: 592, y: 567 },
    { tile_x: 1, tile_y: 12, x: 216, y: 482 },
    { tile_x: 3, tile_y: 12, x: 325, y: 482 },
    { tile_x: 5, tile_y: 12, x: 435, y: 482 },
    { tile_x: 7, tile_y: 12, x: 545, y: 482 },
    { tile_x: 9, tile_y: 12, x: 652, y: 482 },
    { tile_x: 2, tile_y: 11, x: 248, y: 460 },
    { tile_x: 4, tile_y: 11, x: 353, y: 460 },
    { tile_x: 6, tile_y: 11, x: 447, y: 460 },
    { tile_x: 8, tile_y: 11, x: 553, y: 460 },
    { tile_x: 1, tile_y: 10, x: 245, y: 388 },
    { tile_x: 3, tile_y: 10, x: 338, y: 388 },
    { tile_x: 5, tile_y: 10, x: 432, y: 388 },
    { tile_x: 7, tile_y: 10, x: 526, y: 388 },
    { tile_x: 9, tile_y: 10, x: 556, y: 388 },
    { tile_x: 2, tile_y: 9, x: 266, y: 380 },
    { tile_x: 4, tile_y: 9, x: 358, y: 380 },
    { tile_x: 6, tile_y: 9, x: 452, y: 380 },
    { tile_x: 8, tile_y: 9, x: 544, y: 380 },
    { tile_x: 1, tile_y: 8, x: 261, y: 324 },
    { tile_x: 3, tile_y: 8, x: 345, y: 324 },
    { tile_x: 5, tile_y: 8, x: 428, y: 324 },
    { tile_x: 7, tile_y: 8, x: 458, y: 324 },
    { tile_x: 9, tile_y: 8, x: 539, y: 324 },
    { tile_x: 2, tile_y: 7, x: 281, y: 318 },
    { tile_x: 4, tile_y: 7, x: 363, y: 318 },
    { tile_x: 6, tile_y: 7, x: 436, y: 318 },
    { tile_x: 8, tile_y: 7, x: 519, y: 318 },
    { tile_x: 1, tile_y: 6, x: 275, y: 274 },
    { tile_x: 3, tile_y: 6, x: 350, y: 274 },
    { tile_x: 5, tile_y: 6, x: 426, y: 274 },
    { tile_x: 7, tile_y: 6, x: 452, y: 274 },
    { tile_x: 9, tile_y: 6, x: 524, y: 274 },
    { tile_x: 2, tile_y: 5, x: 292, y: 269 },
    { tile_x: 4, tile_y: 5, x: 367, y: 269 },
    { tile_x: 6, tile_y: 5, x: 433, y: 269 },
    { tile_x: 8, tile_y: 5, x: 508, y: 269 },
    { tile_x: 1, tile_y: 4, x: 287, y: 232 },
    { tile_x: 3, tile_y: 4, x: 356, y: 232 },
    { tile_x: 5, tile_y: 4, x: 424, y: 232 },
    { tile_x: 7, tile_y: 4, x: 447, y: 232 },
    { tile_x: 9, tile_y: 4, x: 513, y: 232 },
    { tile_x: 2, tile_y: 3, x: 302, y: 228 },
    { tile_x: 4, tile_y: 3, x: 370, y: 228 },
    { tile_x: 6, tile_y: 3, x: 430, y: 228 },
    { tile_x: 8, tile_y: 3, x: 498, y: 228 },
    { tile_x: 1, tile_y: 2, x: 296, y: 197 },
    { tile_x: 3, tile_y: 2, x: 359, y: 197 },
    { tile_x: 5, tile_y: 2, x: 421, y: 197 },
    { tile_x: 7, tile_y: 2, x: 441, y: 197 },
    { tile_x: 9, tile_y: 2, x: 503, y: 197 },
    { tile_x: 2, tile_y: 1, x: 304, y: 193 },
    { tile_x: 4, tile_y: 1, x: 365, y: 193 },
    { tile_x: 6, tile_y: 1, x: 433, y: 193 },
    { tile_x: 8, tile_y: 1, x: 496, y: 193 },
];

function get_color(img_data: ImageData, x: number, y: number) {
    const index = y * (img_data.width * 4) + x * 4;
    return [ ...img_data.data.slice(index, index + 4) ] as ColorArray;
}

function is_same_rgb(a: ColorArray, b: ColorArray) {
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

type Pattern = (ColorArray | null)[][];

export type PatternInfo = {
    name: string,
    reversed: boolean,
    image_url: string,
    pattern: Pattern,
    min_match: number,
    tile_index: number,
};

const patterns: PatternInfo[] = [
    { name: "park", reversed: false, image_url: "/karuta-images/park_2.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.park) },
    { name: "park", reversed: false, image_url: "/karuta-images/park_3.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.park) },
    { name: "fuel", reversed: false, image_url: "/karuta-images/fuel.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.gas_station) },
    { name: "fuel", reversed: true, image_url: "/karuta-images/fuel.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.gas_station) },
    { name: "italian", reversed: false, image_url: "/karuta-images/italian.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.italian_restaurant) },
    { name: "italian", reversed: true, image_url: "/karuta-images/italian.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.italian_restaurant) },
    { name: "taco", reversed: false, image_url: "/karuta-images/taco.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.taco_shop) },
    { name: "taco", reversed: true, image_url: "/karuta-images/taco.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.taco_shop) },
    { name: "sandwich", reversed: false, image_url: "/karuta-images/sandwich.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.sandwich_shop) },
    { name: "sandwich", reversed: true, image_url: "/karuta-images/sandwich.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.sandwich_shop) },
    { name: "fair", reversed: false, image_url: "/karuta-images/fair.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.fair) },
    { name: "fair", reversed: true, image_url: "/karuta-images/fair.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.fair) },
    { name: "juice", reversed: false, image_url: "/karuta-images/juice.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.juice_shop) },
    { name: "juice", reversed: true, image_url: "/karuta-images/juice.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.juice_shop) },
    { name: "coffee", reversed: false, image_url: "/karuta-images/coffee.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.cofee_shop) },
    { name: "coffee", reversed: true, image_url: "/karuta-images/coffee.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.cofee_shop) },
    { name: "cocktail", reversed: false, image_url: "/karuta-images/cocktail.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.night_club) },
    { name: "cocktail", reversed: true, image_url: "/karuta-images/cocktail.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.night_club) },
    { name: "flower", reversed: false, image_url: "/karuta-images/flower.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.flower_garden) },
    { name: "flower", reversed: true, image_url: "/karuta-images/flower.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.flower_garden) },
    { name: "ballroom", reversed: false, image_url: "/karuta-images/ballroom.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.ballroom) },
    { name: "ballroom", reversed: true, image_url: "/karuta-images/ballroom.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.ballroom) },
    { name: "theatre", reversed: false, image_url: "/karuta-images/theatre.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.theatre) },
    { name: "theatre", reversed: true, image_url: "/karuta-images/theatre.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.theatre) },
    { name: "plane", reversed: false, image_url: "/karuta-images/plane.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.airport) },
    { name: "plane", reversed: true, image_url: "/karuta-images/plane.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.airport) },
    { name: "ring", reversed: false, image_url: "/karuta-images/ring.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.jewelry_store) },
    { name: "ring", reversed: true, image_url: "/karuta-images/ring.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.jewelry_store) },
    { name: "shopping", reversed: false, image_url: "/karuta-images/shopping.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.shopping_mall) },
    { name: "shopping", reversed: true, image_url: "/karuta-images/shopping.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.shopping_mall) },
    { name: "home", reversed: false, image_url: "/karuta-images/home.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.home) },
    { name: "home", reversed: true, image_url: "/karuta-images/home.svg", pattern: [], min_match: 0, tile_index: tile_list.indexOf(tiles.home) },
];

async function load_pattern(pattern_info: PatternInfo) {
    const img_data = await load_image_data_from_url(pattern_info.image_url, { reverse_x: pattern_info.reversed, fixed_width: 32, fixed_height: 32 });
    pattern_info.pattern = [];
    for(let x = 0; x < img_data.width; ++x) {
        pattern_info.pattern[x] = [];
        for(let y = 0; y < img_data.height; ++y) {
            const color = get_color(img_data, x, y);
            if(color[3] === 255) {
                pattern_info.pattern[x][y] = color;
                pattern_info.min_match++;
            } else {
                pattern_info.pattern[x][y] = null;
            }
        }
    }
    pattern_info.min_match;
}

export async function load_patterns() {
    for(let i = 0; i < patterns.length; ++i) {
        await load_pattern(patterns[i]);
    }
    console.log(`all patterns loaded`);
}

export async function on_image_data_loaded(img_data: ImageData) {
    const car_direction: Vec2 = is_same_rgb(get_color(img_data, 410, 573), car_window_color) ? RIGHT : LEFT;

    const road_types = road_pixel_positions.map(info => ({
        x: info.tile_x,
        y: info.tile_y,
        tile: is_similar_to(get_color(img_data, info.x, info.y), road_color) ? tiles.road : tiles.block,
        // tile: is_same_rgb(get_color(img_data, info.x, info.y), road_color) ? tiles.road : tiles.block,
    }));

    let tiles_to_detect: Vec2[] = [];
    const board: Tile[][] = [];
    for(let x = 0; x < BOARD_WIDTH; ++x) {
        board.push([]);
        for(let y = 0; y < BOARD_HEIGHT; ++y) {
            if(x % 2 == 0 && y % 2 == 0) {
                board[x].push(tiles.junction);
            } else if(x % 2 == 0 || y % 2 == 0) {
                const road_type = road_types.find(r => r.x === x && r.y === y);
                board[x].push(road_type?.tile || tiles.road);
            } else {
                board[x].push(tiles.park);
                tiles_to_detect.push({ x, y });
            }
        }
    }

    let results: PatternSearchResult[] = [];
    console.time("detect activities");
    if(get(multi_thread)) {
        const worker_count = Math.ceil(navigator.hardwareConcurrency * 0.75);
        const worker_promises: Promise<PatternSearchResult[]>[] = [];
        for(let worker_index = 0; worker_index < worker_count; ++worker_index) {
            const ttd_worker = tiles_to_detect.filter((_, i) => i % worker_count === worker_index);
            worker_promises.push(search_pattern_worker(img_data, ttd_worker));
        }
        results = (await Promise.all(worker_promises)).flat();
    } else {
        results = await search_pattern_worker(img_data, tiles_to_detect);
    }
    for(const result of results) {
        board[result.x][result.y] = tile_list[result.tile_index];
    }
    const hypothesis: Vec2[] = results.filter(r => r.maybe).map(r => ({ x: r.x, y: r.y }));
    console.timeEnd("detect activities");

    return { board, car_direction, hypothesis };
}

function search_pattern_worker(img_data: ImageData, tiles_to_detect: Vec2[]): Promise<PatternSearchResult[]> {
    return new Promise(resolve => {
        const worker = new ImageRecoWorker();
        worker.postMessage({ img_data, tiles_to_detect, patterns, type: "search_pattern_for_tiles" } satisfies SearchPatternRequest);

        worker.onmessage = ({ data }: MessageEvent<SearchPatternResponse>) => {
            resolve(data.results);
            worker.terminate();
        };
    });
}