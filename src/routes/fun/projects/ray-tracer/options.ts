import type { Vector } from "./vector";

export type Options = {
    NULL_COLOR: number[],
    SKY_COLOR: number[],
    MAX_BOUNCE: number,
    SHADOW_COLOR: number[],
    DIRECT_SHADOW_FORCE: number,
    LIGHT_COLOR: number[],
    EPSILON: number,
    FOV: number,
    LIGHT: Vector,
    MULTITHREAD: boolean,
    SPECULAR_LIGHTING: boolean,
    DIRECT_LIGHTING: boolean,
    PROGRESSIVE_LIGHTING: false,
    RANDOM_SEED: string,
    ANTIALIASING: number,
    RAY_TRACING: boolean,
    MAX_ITER: number,
    MAX_DISTANCE: number,
    HIT_DISTANCE: number,
};