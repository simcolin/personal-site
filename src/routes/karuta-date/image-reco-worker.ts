import { search_pattern_for_tiles, type PatternInfo, type PatternSearchResult } from "./image-recognition-fn";
import type { Vec2 } from "./solver-types";

export type SearchPatternRequest = {
    type: "search_pattern_for_tiles",
    img_data: ImageData,
    tiles_to_detect: Vec2[],
    patterns: PatternInfo[],
};

export type SearchPatternResponse = {
    type: "search_pattern_for_tiles",
    results: PatternSearchResult[],
};

onmessage = ({ data }: MessageEvent<SearchPatternRequest>) => {
    if(data.type === "search_pattern_for_tiles") {
        const results = search_pattern_for_tiles(data.img_data, data.patterns, data.tiles_to_detect);
        postMessage({ type: "search_pattern_for_tiles", results } satisfies SearchPatternResponse);
    }
};