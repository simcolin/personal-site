export class Vector {
    x: number;
    y: number;
    z: number;
    
    constructor(x: number, y: number, z: number) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    cp() {
        return new Vector(this.x, this.y, this.z);
    }

    add(vec: Vector): Vector {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
        return this;
    }

    mult(val: number): Vector {
        this.x *= val;
        this.y *= val;
        this.z *= val;
        return this;
    }

    sub(vec: Vector): Vector {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
        return this;
    }

    div(val: number): Vector {
        this.x /= val;
        this.y /= val;
        this.z /= val;
        return this;
    }

    mag() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    }

    magSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    reflect(normal: Vector): Vector {
        normal.normalize();
        return this.sub(normal.cp().mult(2 * this.dot(normal)));
    }

    dot(vec: Vector) {
        return this.x * vec.x + this.y * vec.y + this.z * vec.z;
    }

    lerp(vec: Vector, t: number): Vector {
        this.x = (this.x + vec.x) / 2;
        this.y = (this.y + vec.y) / 2;
        this.z = (this.z + vec.z) / 2;
        return this;
    }

    cross(vec: Vector): Vector {
        var x = this.y * vec.z - this.z * vec.y;
        var y = this.z * vec.x - this.x * vec.z;
        var z = this.x * vec.y - this.y * vec.x;
        return new Vector(x, y ,z);
    }

    normalize(): Vector {
        return this.div(this.mag());
    }
}