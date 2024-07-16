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
        this.x = u.lerp(this.x, vec.x, t);
        this.y = u.lerp(this.y, vec.y, t);
        this.z = u.lerp(this.z, vec.z, t);
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

export class Color {
    array: [number, number, number, number];

    constructor(r: number, g: number, b: number, a: number = 255) {
        this.array = [r, g, b, a];
    }

    get r() { return this.array[0]; }
    set r(val: number) { this.array[0] = val; }

    get g() { return this.array[1]; }
    set g(val: number) { this.array[1] = val; }

    get b() { return this.array[2]; }
    set b(val: number) { this.array[2] = val; }

    get a() { return this.array[3]; }
    set a(val: number) { this.array[3] = val; }

    toString() {
        return this.toRGBA();
    }

    toRGBA() {
        if(this.array[3] === 255) {
            return "rgb(" + this.array[0] + ", " + this.array[1] + ", " + this.array[2] + ")";
        }
        return "rgba(" + this.array[0] + ", " + this.array[1] + ", " + this.array[2] + ", " + this.array[3]/255 + ")";
    }

    toRGB() {
        return "rgb(" + this.array[0] + ", " + this.array[1] + ", " + this.array[2] + ")";
    }

    toHex() {
        if (this.array[3] === 255) {
            return "#" + Math.round(this.array[0]).toString(16).padStart(2, "0")
                + Math.round(this.array[1]).toString(16).padStart(2, "0")
                + Math.round(this.array[2]).toString(16).padStart(2, "0");
        }
        return "#" + Math.round(this.array[0]).toString(16).padStart(2, "0")
            + Math.round(this.array[1]).toString(16).padStart(2, "0")
            + Math.round(this.array[2]).toString(16).padStart(2, "0")
            + Math.round(this.array[3]).toString(16).padStart(2, "0");
    }

    toHsl() {
        return "hsl(" + this.array[0] / 255 * 360 + ", " + this.array[1] / 2.55 + "%, " + this.array[2] / 2.55 + "%)";
    }

    lerp(color: Color, t: number) {
        this.array[0] = u.lerp(this.array[0], color.array[0], t);
        this.array[1] = u.lerp(this.array[1], color.array[1], t);
        this.array[2] = u.lerp(this.array[2], color.array[2], t);
        this.array[3] = u.lerp(this.array[3], color.array[3], t);
        return this;
    }

    toLerped(color: Color, t: number) {
        return new Color(
            u.lerp(this.array[0], color.array[0], t),
            u.lerp(this.array[1], color.array[1], t),
            u.lerp(this.array[2], color.array[2], t),
            u.lerp(this.array[3], color.array[3], t)
        );
    }

    copy() {
        return new Color(this.array[0], this.array[1], this.array[2], this.array[3]);
    }
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
    lerp(a: number, b: number, t: number) {
        return a + (b - a) * t;
    },
    clamp(v: number, min: number, max: number) {
        return Math.min(Math.max(v, min), max);
    },
    vector2(x: number, y: number) {
        return new Vector2(x, y);
    },
    vector3(x: number, y: number, z: number) {
        return new Vector3(x, y, z);
    },
    color(r: number, g: number, b: number, a: number = 255) {
        return new Color(r, g, b, a);
    },
    loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise(resolve => {
            let img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = e => { throw e };
            img.src = url;
        });
    },
    loadImagePixels(image: HTMLImageElement) {
        let canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        let context = canvas.getContext("2d")!;
        context.drawImage(image, 0, 0);
        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        canvas.remove();
        return imageData;
    },
    cropImage(image: HTMLImageElement, x: number, y: number, width: number, height: number): HTMLCanvasElement {
        let canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        let context = canvas.getContext("2d")!;
        context.drawImage(image, x, y, width, height, 0, 0, width, height);
        return canvas;
    },
}