import type { Vector } from "./vector";

let OPTIONS;

export class Ray {
    ori: Vector;
    dir: Vector;
    bounces: number;
    lastColliderId: number;

    constructor(ori: Vector, dir: Vector, bounces: number, lastColliderId: number) {
        this.ori = ori;
        this.dir = dir;
        this.bounces = bounces;
        this.lastColliderId = lastColliderId;
    }

    move(distance: number) {
        this.ori.add(this.dir.cp().mult(distance));
    }
}