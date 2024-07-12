export class Vector3 {
    x: number;
    y: number;
    z: number;

    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(vec: Vector3): Vector3 {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    }

    mult(val: number): Vector3 {
        this.x *= val;
        this.y *= val;
        this.z *= val;
        return this;
    }

    sub(vec: Vector3): Vector3 {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    }

    lerp(vec: Vector3, t: number): Vector3 {
        this.x = this.x + (vec.x - this.x) * t;
        this.y = this.y + (vec.y - this.y) * t;
        this.z = this.z + (vec.z - this.z) * t;
        return this;
    }

    copy(): Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }

    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    normalize(): Vector3 {
        let len = this.length();
        if(len === 0) return this;
        this.x /= len;
        this.y /= len;
        this.z /= len;
        return this;
    }
}

export type Color = [number, number, number, number];

export function colorLerp(a: Color, b: Color, t: number): Color {
    return [
        Math.floor(a[0] + (a[0] - b[0]) * t),
        Math.floor(a[1] + (a[1] - b[1]) * t),
        Math.floor(a[2] + (a[2] - b[2]) * t),
        Math.floor(a[3] + (a[3] - b[3]) * t),
    ];
}

export function colorToHex(color: Color) {
    if (color[3] === 255) {
        return "#" + color[0].toString(16).padStart(2, "0")
            + color[1].toString(16).padStart(2, "0")
            + color[2].toString(16).padStart(2, "0");
    }
    return "#" + color[0].toString(16).padStart(2, "0")
        + color[1].toString(16).padStart(2, "0")
        + color[2].toString(16).padStart(2, "0")
        + color[3].toString(16).padStart(2, "0");
}

export function colorToString(color: Color) {
    if(color[3] === 255) {
        return "rgb(" + color[0] + ", " + color[1] + ", " + color[2] + ")";
    }
    return "rgba(" + color[0]/255 + ", " + color[1]/255 + ", " + color[2]/255 + ", " + color[3]/255 + ")";
}

export function createColor(r: number, g: number, b: number, a: number = 255): Color {
    return [r, g, b, a];
}