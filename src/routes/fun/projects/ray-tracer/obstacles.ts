import type { Vector } from "./vector";

let idIndex = 0;

function id() {
    return idIndex++;
}

export function createSphere(center: Vector, radius: number) {
    return {
        type: 'sphere',
        id: id(),
        center,
        radius,
        material: randomMaterial(),
    };
}

export function createPlane(pos: Vector, normal: Vector) {
    return {
        type: 'plane',
        id: id(),
        pos, 
        normal,
        material: randomMaterial(),
    };
}

function randomColor() {
    return [random(255), random(255), random(255), 255];
}

function randomMaterial() {
    return {
        color: randomColor(),
        reflectiveness: 0.4,
        // reflectiveness: random(1),
    }
}

export function random(a: number, b?: number) {
    if(typeof b === 'number') {
        return a + Math.random() * (b - a);
    }
    return Math.random() * a;
}