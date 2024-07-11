import type { Action, ActivityTile, BlockTile, BoardState, JunctionTile, ParkTile, Resources, RoadTile, Tile, UnknownTile, Vec2 } from "./solver-types";

export const BOARD_WIDTH = 11;
export const BOARD_HEIGHT = 15;

export const UP = { x: 0, y: -1 } as const;
export const DOWN = { x: 0, y: 1 } as const;
export const LEFT = { x: -1, y: 0 } as const;
export const RIGHT = { x: 1, y: 0 } as const;

export const DIRECTIONS = [UP, DOWN, LEFT, RIGHT];

export const tiles = {
    gas_station: {
        type: "activity",
        name: "gas_station",
        cost: {
            fuel: 100,
            food: -4,
            drink: -6,
            entertainement: -8,
            time: -4,
        },
    },
    italian_restaurant: {
        type: "activity",
        name: "italian_restaurant",
        cost: {
            fuel: 0,
            food: 56,
            drink: -6,
            entertainement: -8,
            time: -4,
        },
    },
    taco_shop: {
        type: "activity",
        name: "taco_shop",
        cost: {
            fuel: 0,
            food: 56,
            drink: -6,
            entertainement: -8,
            time: -4,
        },
    },
    sandwich_shop: {
        type: "activity",
        name: "sandwich_shop",
        cost: {
            fuel: 0,
            food: 36,
            drink: 14,
            entertainement: -8,
            time: -4,
        },
    },
    fair: {
        type: "activity",
        name: "fair",
        cost: {
            fuel: 0,
            food: 16,
            drink: 14,
            entertainement: 32,
            time: -4,
        },
    },
    juice_shop: {
        type: "activity",
        name: "juice_shop",
        cost: {
            fuel: 0,
            food: -4,
            drink: 54,
            entertainement: -8,
            time: -4,
        },
    },
    cofee_shop: {
        type: "activity",
        name: "cofee_shop",
        cost: {
            fuel: 0,
            food: -4,
            drink: 54,
            entertainement: -8,
            time: -4,
        },
    },
    night_club: {
        type: "activity",
        name: "night_club",
        cost: {
            fuel: 0,
            food: -4,
            drink: 34,
            entertainement: 32,
            time: -4,
        },
    },
    flower_garden: {
        type: "activity",
        name: "flower_garden",
        cost: {
            fuel: 0,
            food: -4,
            drink: -6,
            entertainement: 92,
            time: -4,
        },
    },
    ballroom: {
        type: "activity",
        name: "ballroom",
        cost: {
            fuel: 0,
            food: -14,
            drink: -21,
            entertainement: 92,
            time: -4,
        },
    },
    theatre: {
        type: "activity",
        name: "theatre",
        cost: {
            fuel: 0,
            food: -4,
            drink: -6,
            entertainement: 52,
            time: -4,
        },
    },
    airport: {
        type: "activity",
        name: "airport",
        cost: {
            fuel: 0,
            food: -4,
            drink: -6,
            entertainement: -18,
            time: -4,
        },
    },
    jewelry_store: {
        type: "activity",
        name: "jewelry_store",
        cost: {
            fuel: 0,
            food: -4,
            drink: -6,
            entertainement: -8,
            time: -4,
        },
    },
    shopping_mall: {
        type: "activity",
        name: "shopping_mall",
        cost: {
            fuel: 0,
            food: -4,
            drink: -6,
            entertainement: -8,
            time: -4,
        },
    },
    home: {
        type: "activity",
        name: "home",
        cost: {
            fuel: 0,
            food: -4,
            drink: -6,
            entertainement: -8,
            time: -4,
        },
    },
    junction: {
        type: "junction",
    },
    block: {
        type: "block",
    },
    park: {
        type: "park",
    },
    unknown: {
        type: "unknown",
    },
    road: {
        type: "road",
        cost: {
            fuel: -10,
            food: -4,
            drink: -6,
            entertainement: -8,
            time: -4,
        },
    },
} as const;

export const tile_list = Object.values(tiles);

export const activities: ActivityTile[] = [
    tiles.gas_station,
    tiles.italian_restaurant,
    tiles.taco_shop,
    tiles.sandwich_shop,
    tiles.fair,
    tiles.juice_shop,
    tiles.cofee_shop,
    tiles.night_club,
    tiles.flower_garden,
    tiles.ballroom,
    tiles.theatre,
    tiles.airport,
    tiles.jewelry_store,
    tiles.shopping_mall,
    tiles.home,
];

export function build_default_board() {
    const board: Tile[][] = [];
    for(let x = 0; x < BOARD_WIDTH; ++x) {
        board.push([]);
        for(let y = 0; y < BOARD_HEIGHT; ++y) {
            if(x % 2 == 0 && y % 2 == 0) {
                board[x].push(tiles.junction);
            } else if(x % 2 == 0 || y % 2 == 0) {
                board[x].push(tiles.road);
            } else {
                board[x].push(tiles.park);
            }
        }
    }
    return board;
}

export function get_direction_name(dir: Vec2): string {
    if(dir === UP) return "up";
    if(dir === DOWN) return "down";
    if(dir === LEFT) return "left";
    return "right";
}

export function is_in_board(x: number, y: number) {
    return x >= 0 && y >= 0 && x < BOARD_WIDTH && y < BOARD_HEIGHT;
}

export function is_on_border(x: number, y: number) {
    return x === 0 || y === 0 || x === BOARD_WIDTH - 1 || y === BOARD_HEIGHT - 1;
}

export function evaluate_state(state: BoardState): number {
    if(state.fuel <= 0 || state.food <= 0 || state.drink <= 0 || state.entertainement <= 0) {
        return -1;
    }
    if(state.has_airport) return evaluate_plane(state);
    
    let bonus = state.has_shopping_mall ? 30 : 0;
    if(state.has_home) {
        return Math.ceil(((state.food + state.drink + state.entertainement) / 6) * ((100 - state.time) / 100)) + bonus;
    } else {
        return Math.ceil((state.food + state.drink + state.entertainement) / 6) + bonus;
    }
}

export function get_actions(board: Tile[][], state: BoardState): Action[] {
    const actions: Action[] = [];
    for(let i = 0; i < DIRECTIONS.length; ++i) {
        const dir = DIRECTIONS[i];

        const action_x = state.car_position_x + dir.x;
        const action_y = state.car_position_y + dir.y;
        if(is_in_board(action_x, action_y)) {
            const tile = board[action_x][action_y];
            if(tile.type === "activity" && !state.cooldowns.has(action_x + "_" + action_y)) {
                const action = pull_action(action_x, action_y, dir, tile);
                actions.push(action);
            }
        }

        const action2_x = state.car_position_x + dir.x + state.car_direction_x;
        const action2_y = state.car_position_y + dir.y + state.car_direction_y;
        if(is_in_board(action2_x, action2_y) && (action2_x !== state.car_position_x || action2_y !== state.car_position_y)) {
            const tile = board[action2_x][action2_y];
            if(tile.type === "road") {
                const action = pull_action(action2_x, action2_y, dir, tile);
                actions.push(action);
            }
        }
    }
    return actions;
}

export function apply_cost(resources: Resources, cost: Resources) {
    resources.fuel += cost.fuel;
    resources.food += cost.food;
    resources.drink += cost.drink;
    resources.entertainement += cost.entertainement;
    resources.time += cost.time;
}

export function apply_action(state: BoardState, action: Action) {
    if(action.tile.type === "road") {
        state.car_position_x = action.x;
        state.car_position_y = action.y;
        state.car_direction_x = action.dir.x;
        state.car_direction_y = action.dir.y;
        apply_cost(state, action.tile.cost);
        state.action_count += 1;
        state.actions += ",move_" + get_direction_name(action.dir);
    } else if(action.tile.type === "activity") {
        if(action.tile.name === "home") state.has_home = true;
        if(action.tile.name === "jewelry_store") state.has_jewelry_store = true;
        if(action.tile.name === "shopping_mall") state.has_shopping_mall = true;
        if(action.tile.name === "airport") state.has_airport = true;
        if(action.tile.name === "jewelry_store" || action.tile.name === "shopping_mall" || action.tile.name === "flower_garden") {
            state.cooldowns.set(action.x + "_" + action.y, -20);
        } else {
            state.cooldowns.set(action.x + "_" + action.y, -1);
        }
        apply_cost(state, action.tile.cost);
        state.action_count += 1;
        state.actions += ",activity_" + action.tile.name;
    }
}

export function clamp(v: number, min: number, max: number) {
    return Math.min(Math.max(v, min), max);
}

export function update_state(state: BoardState) {
    const keys = state.cooldowns.keys();
    for(const key of keys) {
        state.cooldowns.set(key, state.cooldowns.get(key) as number + 1);
        if(state.cooldowns.get(key) as number > 9) {
            state.cooldowns.delete(key);
        }
    }
    state.fuel = clamp(state.fuel, 0, 100);
    state.food = clamp(state.food, 0, 100);
    state.drink = clamp(state.drink, 0, 100);
    state.entertainement = clamp(state.entertainement, 0, 100);
}

export function is_finished(state: BoardState) {
    return state.has_home
        || state.has_airport
        || state.fuel <= 0
        || state.food <= 0
        || state.drink <= 0
        || state.entertainement <= 0
        || state.time <= 0
}

function evaluate_plane(state: BoardState) {
    return Math.min(
        Math.floor(state.fuel / 10),
        Math.floor(state.food / 4),
        Math.floor(state.drink / 6),
        Math.floor(state.entertainement / 8),
    );
}

function contains_better_solution(solutions: BoardState[], solution: BoardState) {
    if(solution.score < 0) return true;
    let found = false;
    let i = 0;
    while(!found && i < solutions.length) {
        if(solution.has_airport) {
            if(solution.score < solutions[i].score
                && solution.has_jewelry_store === solutions[i].has_jewelry_store
                && solution.has_shopping_mall === solutions[i].has_shopping_mall
                && solutions[i].has_airport
            ) {
                found = true;
            }
        } else {
            if(solution.score < solutions[i].score
                && solution.has_jewelry_store === solutions[i].has_jewelry_store
                && solution.has_shopping_mall === solutions[i].has_shopping_mall
                && !solutions[i].has_airport
            ) {
                found = true;
            }
        }
        ++i;
    }
    return found;
}

const state_pool: BoardState[] = [];

function release_state(state: BoardState) {
    state_pool.push(state);
}

function clone_state(to_clone: BoardState) {
    if(state_pool.length > 0) {
        const state = state_pool.pop() as BoardState;
        state.actions = to_clone.actions;
        state.action_count = to_clone.action_count;
        state.cooldowns = new Map(to_clone.cooldowns.entries());
        state.car_position_x = to_clone.car_position_x;
        state.car_position_y = to_clone.car_position_y;
        state.car_direction_x = to_clone.car_direction_x;
        state.car_direction_y = to_clone.car_direction_y;
        state.fuel = to_clone.fuel;
        state.food = to_clone.food;
        state.drink = to_clone.drink;
        state.entertainement = to_clone.entertainement;
        state.time = to_clone.time;
        state.has_home = to_clone.has_home;
        state.has_airport = to_clone.has_airport;
        state.has_jewelry_store = to_clone.has_jewelry_store;
        state.has_shopping_mall = to_clone.has_shopping_mall;
        state.score = to_clone.score;
        return state;
    }
    return {
        actions: to_clone.actions,
        action_count: to_clone.action_count,
        cooldowns: new Map(to_clone.cooldowns.entries()),
        car_position_x: to_clone.car_position_x,
        car_position_y: to_clone.car_position_y,
        car_direction_x: to_clone.car_direction_x,
        car_direction_y: to_clone.car_direction_y,
        fuel: to_clone.fuel,
        food: to_clone.food,
        drink: to_clone.drink,
        entertainement: to_clone.entertainement,
        time: to_clone.time,
        has_home: to_clone.has_home,
        has_airport: to_clone.has_airport,
        has_jewelry_store: to_clone.has_jewelry_store,
        has_shopping_mall: to_clone.has_shopping_mall,
        score: to_clone.score,
    };
}

const action_pool: Action[] = [];

function release_action(action: Action) {
    action_pool.push(action);
}

function pull_action(x: number, y: number, dir: Vec2, tile: Tile): Action {
    if(action_pool.length > 0) {
        const action = action_pool.pop() as Action;
        action.x = x;
        action.y = y;
        action.dir = dir;
        action.tile = tile;
        return action;
    }
    return { x, y, dir, tile }
}

export function get_concurrency_queue(board: Tile[][], initial_state: BoardState[], stop_at: number) {
    const solutions: BoardState[] = [];
    const queue: BoardState[] = initial_state;
    let evaluated_path_count = 0;
    let valid_path_count = 0;
    while(queue.length > 0) {
        if(queue.length > stop_at) return { solutions: queue, evaluated_path_count, valid_path_count };
        const state = queue.shift() as BoardState;

        const actions = get_actions(board, state);
        for(let i = 0; i < actions.length; ++i) {
            const new_state = clone_state(state);
            apply_action(new_state, actions[i]);
            update_state(new_state);
            if(is_finished(new_state)) {
                new_state.score = evaluate_state(new_state);
                if(new_state.score >= 0) ++valid_path_count;
                if(!contains_better_solution(solutions, new_state)) {
                    solutions.push(new_state);
                }
                ++evaluated_path_count;
            } else {
                queue.push(new_state);
            }
            release_action(actions[i]);
        }
        release_state(state);
    }
    return { solutions, evaluated_path_count, valid_path_count };
}

export function get_solutions(board: Tile[][], initial_state: BoardState[]) {
    const solutions: BoardState[] = [];
    const queue: BoardState[] = initial_state;
    let evaluated_path_count = 0;
    let valid_path_count = 0;
    while(queue.length > 0) {
        const state = queue.pop() as BoardState;

        const actions = get_actions(board, state);
        for(let i = 0; i < actions.length; ++i) {
            const new_state = clone_state(state);
            apply_action(new_state, actions[i]);
            update_state(new_state);
            if(is_finished(new_state)) {
                new_state.score = evaluate_state(new_state);
                if(new_state.score >= 0) ++valid_path_count;
                if(!contains_better_solution(solutions, new_state)) {
                    solutions.push(new_state);
                }
                ++evaluated_path_count;
            } else {
                queue.push(new_state);
            }
            release_action(actions[i]);
        }
        release_state(state);
    }
    return { solutions, evaluated_path_count, valid_path_count };
}

export function bool_sorter(a: boolean, b: boolean) {
    if(a && !b) return 1;
    if(b && !a) return -1;
    return 0;
}

export function sort_solutions(solutions: BoardState[]): BoardState[] {
    return [...solutions].sort((a, b) => {
        const score_diff = b.score - a.score;
        if(score_diff !== 0) return score_diff;
        if(a.score === -1) return 0;

        if(a.has_airport && b.has_airport) {
            return a.action_count - b.action_count;
        } else if(a.has_home && b.has_home) {
            const ring_diff = bool_sorter(a.has_jewelry_store, b.has_jewelry_store);
            if(ring_diff !== 0) return ring_diff;
            return a.action_count - b.action_count;
        } else {
            const ring_diff = bool_sorter(a.has_jewelry_store, b.has_jewelry_store);
            if(ring_diff !== 0) return ring_diff;
            return a.action_count - b.action_count;
        }
    });
}

function get_flag(solution: BoardState) {
    return [solution.has_jewelry_store, solution.has_shopping_mall, solution.has_airport].map(b => (b ? 1 : 0) as number).reduce((b, i) => b << 1 | i);
}

export function filter_useless_solutions(solutions: BoardState[]): BoardState[] {
    const best_solutions: BoardState[] = [];
    for(let i = 0; i < solutions.length; ++i) {
        const sol = solutions[i];
        const flag = get_flag(sol);
        if(!best_solutions[flag] || best_solutions[flag].score < sol.score) {
            best_solutions[flag] = sol;
        }
    }
    return best_solutions.filter(Boolean);
}