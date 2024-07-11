import type { Options } from "./options";
import { Ray } from "./ray";
import { RayMarching } from "./ray-marching";
import { RayTracing } from "./ray-tracing";
import { mergeColors } from "./utils";
import { Vector } from "./vector";

export function renderPixel(x: number, y: number, width: number, height: number, OPTIONS: Options, obstacles: any[]): number[] {
    let imageAspectRatio = width / height;
    let Px = (2 * ((x + 0.5) / width) - 1) * Math.tan(OPTIONS.FOV / 2 * Math.PI / 180) * imageAspectRatio; 
    let Py = (1 - 2 * ((y + 0.5) / height)) * Math.tan(OPTIONS.FOV / 2 * Math.PI / 180);
    let ori = new Vector(0, 0, 0);
    let dir = new Vector(Px, Py, 1).normalize();
    
    let ray = new Ray(ori, dir, 0, -1);
    let col = OPTIONS.RAY_TRACING ? RayTracing.resolveRay(ray, OPTIONS, obstacles) : RayMarching.resolveRay(ray, OPTIONS, obstacles);
    if(col === OPTIONS.NULL_COLOR) col = OPTIONS.SKY_COLOR;

    return col;
}

export function antialiazedRenderPixel(x: number, y: number, width: number, height: number, antialiasing: number, OPTIONS: Options, obstacles: any[]): number[] {
    if(antialiasing <= 1) return renderPixel(x, y, width, height, OPTIONS, obstacles);

    let step = 1 / antialiasing;
    let start = - 0.5 + ((antialiasing % 2 === 0) ? step / 2 : 0);
    let colors = [];
    for(let i = start; i <= 0.5; i += step) {
        for(let j = start; j <= 0.5; j += step) {
            colors.push(renderPixel(x + i, y + j, width, height, OPTIONS, obstacles));
        }
    }

    return mergeColors(...colors);
}