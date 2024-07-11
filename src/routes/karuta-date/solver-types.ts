export type Vec2 = { x: number, y: number };

export type Resources = {
    fuel: number,
    food: number,
    drink: number,
    entertainement: number,
    time: number,
};

export type BoardState = {
    actions: string,
    action_count: number,
    cooldowns: Map<string, number>,
    car_position_x: number,
    car_position_y: number,
    car_direction_x: number,
    car_direction_y: number,
    has_jewelry_store: boolean,
    has_shopping_mall: boolean,
    has_airport: boolean,
    has_home: boolean,
    score: number,
} & Resources;

export type Action = {
    x: number,
    y: number,
    dir: Vec2,
    tile: Tile,
};

export type ActivityTile = {
    type: "activity",
    name: string,
    cost: Resources,
};

export type RoadTile = {
    type: "road",
    cost: Resources,
};

export type JunctionTile = {
    type: "junction",
};

export type BlockTile = {
    type: "block",
};

export type ParkTile = {
    type: "park",
};

export type UnknownTile = {
    type: "unknown",
};

export type Tile = ActivityTile | RoadTile | JunctionTile | BlockTile | ParkTile | UnknownTile;