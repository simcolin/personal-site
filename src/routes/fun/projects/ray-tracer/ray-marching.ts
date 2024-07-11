import type { Options } from "./options";
import { Ray } from "./ray";
import { colorLerp, map } from "./utils";
import type { Vector } from "./vector";

export class RayMarching {
    static resolveRay(ray: Ray, OPTIONS: Options, obstacles: any[], processLighting: boolean = true): number[] {
        const collision = RayMarching.getClosestCollision(ray, OPTIONS, obstacles);
        if(collision === null) {
            return OPTIONS.NULL_COLOR;
        } else {
            ray.lastColliderId = collision.colliderId;
            let finalColor = collision.material.color;
    
            if(collision.material.reflectiveness > OPTIONS.EPSILON && ray.bounces < OPTIONS.MAX_BOUNCE) {
                const reflectDirection = ray.dir.cp().reflect(collision.normal).normalize();
                const newRay = new Ray(collision.point.cp(), reflectDirection, ray.bounces + 1, ray.lastColliderId);
                let col = RayMarching.resolveRay(newRay, OPTIONS, obstacles);
                if(col !== OPTIONS.NULL_COLOR) {
                    finalColor = colorLerp(collision.material.color, col, collision.material.reflectiveness);
                }
            }
    
            if(processLighting) {
                // APPLY LIGHTING
                const collisionPoint = collision.point.cp().add(collision.normal.cp().mult(OPTIONS.HIT_DISTANCE));
                const lightRayDir = OPTIONS.LIGHT.cp().sub(collision.point).normalize();
                if(OPTIONS.PROGRESSIVE_LIGHTING) {
                    let normalDiff = 1 - (Math.max(collision.normal.dot(lightRayDir), 0));
                    finalColor = colorLerp(finalColor, OPTIONS.SHADOW_COLOR, normalDiff);
                }
            
                if(!RayMarching.canSeeLight(collisionPoint, OPTIONS, obstacles)) {
                    if(OPTIONS.DIRECT_LIGHTING) {
                        finalColor = colorLerp(finalColor, OPTIONS.SHADOW_COLOR, OPTIONS.DIRECT_SHADOW_FORCE);
                    }
                } else {
                    if(OPTIONS.SPECULAR_LIGHTING) {
                        const reflectDirection = ray.dir.cp().reflect(collision.normal).normalize();
                        let diff = lightRayDir.dot(reflectDirection);
                        if(diff > 0.8) {
                            finalColor = colorLerp(finalColor, OPTIONS.LIGHT_COLOR, map(diff, 0.8, 1, 0, 1));
                        }
                    }
                }
            }
    
            return finalColor;
        }
    }
    
    static canSeeLight(point: Vector, OPTIONS: Options, obstacles: any[]): boolean {
        const lightRayDir = OPTIONS.LIGHT.cp().sub(point).normalize();
        const lightRay = new Ray(point.cp(), lightRayDir, OPTIONS.MAX_BOUNCE, -1);
    
        return RayMarching.getClosestCollision(lightRay, OPTIONS, obstacles) === null;
    }
    
    static getClosestCollision(ray: Ray, OPTIONS: Options, obstacles: any[]) {
        let distanceFromStart = 0;
        let iter = 0;
        let collision = null;
    
        while(iter < OPTIONS.MAX_ITER && distanceFromStart < OPTIONS.MAX_DISTANCE && collision === null) {
            let { distance, obstacle } = RayMarching.getClosestDistance(ray, OPTIONS, obstacles);
            if(distance < OPTIONS.HIT_DISTANCE) {
                collision = RayMarching.getCollisionDetails(ray.ori, obstacle, distance);
            } else {
                ray.move(distance);
                iter++;
                distanceFromStart += distance;
            }
        }
        return collision;
    }
    
    static getClosestDistance(ray: Ray, OPTIONS: Options, obstacles: any[]) {
        let distance = OPTIONS.MAX_DISTANCE;
        let obstacle = null;
        for(let i = 0; i < obstacles.length; ++i) {
            if(obstacles[i].id !== ray.lastColliderId) {
                const dist = RayMarching.distanceToObstacle(ray.ori, obstacles[i]);
                if(distance > dist) {
                    distance = dist;
                    obstacle = obstacles[i];
                }
            }
        }
        return {
            distance,
            obstacle,
        };
    }
    
    static distanceToObstacle(point: Vector, obstacle: any): number {
        let distance;
        switch(obstacle.type) {
            case 'sphere':
                distance = RayMarching.distanceSphere(point, obstacle);
                break;
            case 'plane':
                distance = RayMarching.distancePlane(point, obstacle);
                break;
            default:
                distance = Infinity;
                break;
        }
        return distance;
    }
    
    static distanceSphere(point: Vector, sphere: any) {
        return point.cp().sub(sphere.center).mag() - sphere.radius;
    }
    
    static distancePlane(point: Vector, plane: any) {
        let d2 = plane.normal.dot(plane.pos.cp().sub(point));
        return d2;
    }
    
    static getCollisionDetails(point: Vector, obstacle: any, distance: number) {
        switch(obstacle.type) {
            case 'sphere':
                let normal = point.cp().sub(obstacle.center).normalize();
                return {
                    point,
                    normal,
                    distance,
                    material: obstacle.material,
                    colliderId: obstacle.id,
                }
            case 'plane':
                return {
                    point,
                    normal: obstacle.normal,
                    distance,
                    material: obstacle.material,
                    colliderId: obstacle.id,
                }
            default:
                return null;
        }
    }
}