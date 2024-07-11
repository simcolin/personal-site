import { tiles, tile_list } from "./solver";
import type { Vec2 } from "./solver-types";

type ColorArray = [number, number, number, number];

function get_color(img_data: ImageData, x: number, y: number) {
    const index = y * (img_data.width * 4) + x * 4;
    return [ ...img_data.data.slice(index, index + 4) ] as ColorArray;
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

export type PatternSearchResult = { x: number, y: number, tile_index: number, maybe: boolean };

export function search_pattern_for_tiles(img_data: ImageData, patterns: PatternInfo[], tiles_to_detect: Vec2[]): PatternSearchResult[] {
    const results: PatternSearchResult[] = [];

    for(const area of activities_search_areas) {
        const tiles_to_search_index = tiles_to_detect.findIndex(v => v.x === area.tile_x && v.y === area.tile_y);
        if(tiles_to_search_index !== -1) {
            const match_result = search_pattern(img_data, area, patterns);
            if(match_result) {
                tiles_to_detect.splice(tiles_to_search_index, 1);
                results.push({ x: area.tile_x, y: area.tile_y, tile_index: match_result.tile_index, maybe: !match_result.matched });
            }
        }
    }

    for(const position of tiles_to_detect) {
        results.push({ x: position.x, y: position.y, tile_index: tile_list.indexOf(tiles.unknown), maybe: false });
    }
    return results;
}

type PaternMatchTileResult = PaternMatchResult & { tile_index: number };

export function search_pattern(img_data: ImageData, area: SearchArea, patterns: PatternInfo[]): PaternMatchTileResult | null {    
    let best_match: PaternMatchTileResult | null = null;
    let best_match_confidence = 40;
    for(const pattern_info of patterns) {
        for(let x = area.min_x; x < area.max_x; ++x) {
            for(let y = area.min_y; y < area.max_y; ++y) {
                const match_result = is_pattern_at(img_data, pattern_info, x, y);
                if(match_result.matched) {
                    return { ...match_result, tile_index: pattern_info.tile_index };
                } else if(match_result.confidence > best_match_confidence) {
                    best_match = { ...match_result, tile_index: pattern_info.tile_index };
                }
            }
        }
    }
    if(best_match) {
        return best_match;
    }
    return null;
}

const COLOR_TOLERANCE = 40;

export function is_similar_to(b: ColorArray, a: ColorArray) {
    return a[0] >= b[0] - COLOR_TOLERANCE && a[0] <= b[0] + COLOR_TOLERANCE
        && a[1] >= b[1] - COLOR_TOLERANCE && a[1] <= b[1] + COLOR_TOLERANCE
        && a[2] >= b[2] - COLOR_TOLERANCE && a[2] <= b[2] + COLOR_TOLERANCE;
}

const PATTERN_TOLERANCE = 75 / 100;

type PaternMatchResult = { matched: boolean, confidence: number };

function is_pattern_at(img_data: ImageData, pattern_info: PatternInfo, p_x: number, p_y: number): PaternMatchResult {
    let matching = 0;
    for(let x = 0; x < 32; ++x) {
        for(let y = 0; y < 32; ++y) {
            const pat_color = pattern_info.pattern[x][y];
            if(pat_color) {
                const col = get_color(img_data, x + p_x, y + p_y);
                if(is_similar_to(pat_color, col)) {
                    ++matching;
                }
            }
        }
    }
    return {
        matched: matching > (pattern_info.min_match * PATTERN_TOLERANCE),
        confidence: (matching / (pattern_info.min_match)) * 100,
    }
}

type SearchArea = { tile_x: number, tile_y: number, min_x: number, min_y: number, max_x: number, max_y: number };

const activities_search_areas: SearchArea[] = [
    { tile_x: 1, tile_y: 1, min_x: 258, min_y: 148, max_x: 268, max_y: 158 },
    { tile_x: 3, tile_y: 1, min_x: 322, min_y: 148, max_x: 332, max_y: 158 },
    { tile_x: 5, tile_y: 1, min_x: 383, min_y: 148, max_x: 393, max_y: 158 },
    { tile_x: 7, tile_y: 1, min_x: 445, min_y: 148, max_x: 455, max_y: 158 },
    { tile_x: 9, tile_y: 1, min_x: 502, min_y: 148, max_x: 512, max_y: 158 },

    { tile_x: 1, tile_y: 3, min_x: 252, min_y: 182, max_x: 262, max_y: 192 },
    { tile_x: 3, tile_y: 3, min_x: 317, min_y: 182, max_x: 327, max_y: 192 },
    { tile_x: 5, tile_y: 3, min_x: 380, min_y: 182, max_x: 390, max_y: 192 },
    { tile_x: 7, tile_y: 3, min_x: 446, min_y: 182, max_x: 456, max_y: 192 },
    { tile_x: 9, tile_y: 3, min_x: 514, min_y: 182, max_x: 524, max_y: 192 },

    { tile_x: 1, tile_y: 5, min_x: 235, min_y: 223, max_x: 245, max_y: 233 },
    { tile_x: 3, tile_y: 5, min_x: 307, min_y: 223, max_x: 317, max_y: 233 },
    { tile_x: 5, tile_y: 5, min_x: 380, min_y: 223, max_x: 390, max_y: 233 },
    { tile_x: 7, tile_y: 5, min_x: 451, min_y: 223, max_x: 461, max_y: 233 },
    { tile_x: 9, tile_y: 5, min_x: 524, min_y: 223, max_x: 534, max_y: 233 },

    { tile_x: 1, tile_y: 7, min_x: 217, min_y: 266, max_x: 233, max_y: 282 },
    { tile_x: 3, tile_y: 7, min_x: 297, min_y: 266, max_x: 313, max_y: 282 },
    { tile_x: 5, tile_y: 7, min_x: 376, min_y: 266, max_x: 392, max_y: 282 },
    { tile_x: 7, tile_y: 7, min_x: 453, min_y: 266, max_x: 469, max_y: 282 },
    { tile_x: 9, tile_y: 7, min_x: 536, min_y: 266, max_x: 552, max_y: 282 },

    { tile_x: 1, tile_y: 9, min_x: 198, min_y: 328, max_x: 214, max_y: 344 },
    { tile_x: 3, tile_y: 9, min_x: 285, min_y: 328, max_x: 301, max_y: 344 },
    { tile_x: 5, tile_y: 9, min_x: 376, min_y: 328, max_x: 392, max_y: 344 },
    { tile_x: 7, tile_y: 9, min_x: 464, min_y: 328, max_x: 480, max_y: 344 },
    { tile_x: 9, tile_y: 9, min_x: 552, min_y: 328, max_x: 568, max_y: 344 },

    { tile_x: 1, tile_y: 11, min_x: 173, min_y: 403, max_x: 189, max_y: 419 },
    { tile_x: 3, tile_y: 11, min_x: 272, min_y: 403, max_x: 288, max_y: 419 },
    { tile_x: 5, tile_y: 11, min_x: 377, min_y: 403, max_x: 393, max_y: 419 },
    { tile_x: 7, tile_y: 11, min_x: 476, min_y: 403, max_x: 492, max_y: 419 },
    { tile_x: 9, tile_y: 11, min_x: 580, min_y: 403, max_x: 596, max_y: 419 },

    { tile_x: 1, tile_y: 13, min_x: 140, min_y: 499, max_x: 156, max_y: 515 },
    { tile_x: 3, tile_y: 13, min_x: 257, min_y: 499, max_x: 273, max_y: 515 },
    { tile_x: 5, tile_y: 13, min_x: 375, min_y: 499, max_x: 391, max_y: 515 },
    { tile_x: 7, tile_y: 13, min_x: 493, min_y: 499, max_x: 509, max_y: 515 },
    { tile_x: 9, tile_y: 13, min_x: 608, min_y: 499, max_x: 624, max_y: 515 },
];