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

export class Vector2 {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(vec: Vector2): Vector2 {
        this.x += vec.x;
        this.y += vec.y;
        return this;
    }

    mult(val: number): Vector2 {
        this.x *= val;
        this.y *= val;
        return this;
    }

    sub(vec: Vector2): Vector2 {
        this.x -= vec.x;
        this.y -= vec.y;
        return this;
    }

    div(val: number): Vector2 {
        this.x /= val;
        this.y /= val;
        return this;
    }
    
    copy(): Vector2 {
        return new Vector2(this.x, this.y);
    }
    
    length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize(): Vector2 {
        let len = this.length();
        if(len === 0) return this;
        this.x /= len;
        this.y /= len;
        return this;
    }

    rotate(angle: number) {
        let x = this.x;
        let y = this.y;
        this.x = x * Math.cos(angle) - y * Math.sin(angle);
        this.y = x * Math.sin(angle) + y * Math.cos(angle);
        return this;
    }
}

export type Color = [number, number, number, number];

/**
 * @param r red channel value between 0 and 255
 * @param g green channel value between 0 and 255
 * @param b blue channel value between 0 and 255
 * @param a alpha channel value between 0 and 255
 */
export function color(r: number, g: number, b: number, a: number = 255): Color {
    return [r, g, b, a];
}

export function colorLerp(a: Color, b: Color, t: number): Color {
    return [
        Math.floor(a[0] + (a[0] - b[0]) * t),
        Math.floor(a[1] + (a[1] - b[1]) * t),
        Math.floor(a[2] + (a[2] - b[2]) * t),
        Math.floor(a[3] + (a[3] - b[3]) * t),
    ];
}

export function colorToHsl(color: Color): string {
    return "hsl(" + Math.floor(color[0] / 255 * 360) + ", " + Math.floor(color[1] / 2.55) + "%, " + Math.floor(color[2] / 2.55) + "%)";
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
    return "rgba(" + color[0] + ", " + color[1] + ", " + color[2] + ", " + color[3]/255 + ")";
}

export const u = {
    random(a: number, b?: number) {
        if(typeof b === "number") {
            return a + Math.random() * (b - a);
        }
        return Math.random() * a;
    },
    map(val: number, fromMin: number, fromMax: number, toMin: number, toMax: number) {
        return (val - fromMin) / (fromMax - fromMin) * (toMax - toMin) + toMin;
    },
}
