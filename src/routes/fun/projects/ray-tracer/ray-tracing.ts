import type { Options } from "./options";
import { Ray } from "./ray";
import { colorLerp, map } from "./utils";
import type { Vector } from "./vector";

export class RayTracing {
    static resolveRay(ray: Ray, OPTIONS: Options, obstacles: any[], processLighting: boolean = true): number[] {
        const collision = RayTracing.getClosestCollision(ray, OPTIONS, obstacles);
        if(collision === null) {
            return OPTIONS.NULL_COLOR;
        } else {
            ray.lastColliderId = collision.colliderId;
            let finalColor = collision.material.color;
    
            if(collision.material.reflectiveness > OPTIONS.EPSILON && ray.bounces < OPTIONS.MAX_BOUNCE) {
                const reflectDirection = ray.dir.cp().reflect(collision.normal).normalize();
                const newRay = new Ray(collision.point, reflectDirection, ray.bounces + 1, ray.lastColliderId);
                let col = RayTracing.resolveRay(newRay, OPTIONS, obstacles);
                if(col !== OPTIONS.NULL_COLOR) {
                    finalColor = colorLerp(collision.material.color, col, collision.material.reflectiveness);
                }
            }
    
            if(processLighting) {
                // APPLY LIGHTING
                const collisionPoint = collision.point.cp().add(collision.normal.cp().mult(OPTIONS.EPSILON));
                const lightRayDir = OPTIONS.LIGHT.cp().sub(collision.point).normalize();
                if(OPTIONS.PROGRESSIVE_LIGHTING) {
                    let normalDiff = 1 - (Math.max(collision.normal.dot(lightRayDir), 0));
                    finalColor = colorLerp(finalColor, OPTIONS.SHADOW_COLOR, normalDiff);
                }
            
                if(!RayTracing.canSeeLight(collisionPoint, OPTIONS, obstacles)) {
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
        const toLight = OPTIONS.LIGHT.cp().sub(point);
        const distanceToLight = toLight.mag();
        const lightRayDir = toLight.cp().normalize();
        const lightRay = new Ray(point, lightRayDir, OPTIONS.MAX_BOUNCE, -1);
    
        for(let i = 0; i < obstacles.length; ++i) {
            const collision = RayTracing.collide(lightRay, obstacles[i], OPTIONS);
            if(collision !== null && collision.distance < distanceToLight) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * @param {Ray} ray ray to collide
     * @returns {any | null} return the closest collision or null if no collision
     */
    static getClosestCollision(ray: Ray, OPTIONS: Options, obstacles: any[]) {
        let closestCollision = null;
        for(let i = 0; i < obstacles.length; ++i) {
            if(obstacles[i].id !== ray.lastColliderId) {
                const collision = RayTracing.collide(ray, obstacles[i], OPTIONS);
                if(collision !== null) {
                    if(closestCollision === null || closestCollision.distance > collision.distance) {
                        closestCollision = collision;
                    }
                }
            }
        }
        return closestCollision;
    }
    
    static collide(ray: Ray, obstacle: any, OPTIONS: Options) {
        let result;
        switch(obstacle.type) {
            case 'sphere':
                result = RayTracing.collideSphere(obstacle, ray);
                break;
            case 'plane':
                result = RayTracing.collidePlane(obstacle, ray, OPTIONS);
                break;
            default:
                result = null;
                break;
        }
        return result;
    }
    
    static collideSphere(sphere: any, ray: Ray) {
        let m = ray.ori.cp().sub(sphere.center);
        let b = m.dot(ray.dir);
        let c = m.dot(m) - sphere.radius * sphere.radius; 
    
        if (c > 0 && b > 0) return null; 
        let discr = b * b - c; 
    
        if (discr < 0) return null; 
        let distance = - b - Math.sqrt(discr); 
    
        if (distance < 0) distance = 0;
        let point = ray.ori.cp().add(ray.dir.cp().mult(distance)); 
    
        return {
            point,
            distance,
            normal: point.cp().sub(sphere.center).normalize(),
            material: sphere.material,
            colliderId: sphere.id,
        };
    }
    
    static collidePlane(plane: any, ray: Ray, OPTIONS: Options) {
        let denom = plane.normal.cp().dot(ray.dir); 
        if (denom > OPTIONS.EPSILON) { 
            let toPlane = plane.pos.cp().sub(ray.ori); 
            let distance = toPlane.dot(plane.normal) / denom;
            if(distance >= 0) {
                const point = ray.ori.cp().add(ray.dir.cp().mult(distance));
                return {
                    point,
                    distance,
                    normal: plane.normal,
                    material: plane.material,
                    colliderId: plane.id,
                };
            }
        } 
    
        return null; 
    }
}