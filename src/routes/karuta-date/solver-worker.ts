import type { BoardState, Tile } from "./solver-types";
import { filter_useless_solutions, get_concurrency_queue, get_solutions, sort_solutions } from "./solver";

export type GetSolutionsRequest = {
    type: "get_solutions" | "get_concurrency_queue",
    board: Tile[][],
    states: BoardState[],
    worker_count: number,
};

export type GetSolutionsResponse = {
    type: "get_solutions" | "get_concurrency_queue",
    solutions: BoardState[],
    evaluated_path_count: number,
    valid_path_count: number,
};

onmessage = ({ data }: MessageEvent<GetSolutionsRequest>) => {
    if(data.type === "get_solutions") {
        console.time("solving");
        let { solutions, evaluated_path_count, valid_path_count } = get_solutions(data.board, data.states);
        console.timeEnd("solving");
    
        console.time("filtering");
        solutions = filter_useless_solutions(solutions);
        console.timeEnd("filtering");
    
        console.time("sorting");
        solutions = sort_solutions(solutions);
        console.timeEnd("sorting");
        postMessage({ type: data.type, solutions: solutions, evaluated_path_count, valid_path_count } satisfies GetSolutionsResponse);
    } else if(data.type === "get_concurrency_queue") {
        let { solutions, evaluated_path_count, valid_path_count } = get_concurrency_queue(data.board, data.states, data.worker_count * 6);
        postMessage({ type: data.type, solutions, evaluated_path_count, valid_path_count } satisfies GetSolutionsResponse);
    }
};