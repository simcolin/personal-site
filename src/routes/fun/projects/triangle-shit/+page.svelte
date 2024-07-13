<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { color, colorLerp, colorToHex, colorToString, u, Vector2 } from "../utils";
    
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let rafHandle: number;

    let spacing = 0;
    let points: Point[] = [];
    let triangles: Triangle[] = [];
    let pointXCount = 0;
    let pointYCount = 0;
    let pointRadius = 0;
    let colors = [
        color(19, 41, 61),
        color(0, 100, 148),
        color(36, 123, 160),
        color(27, 152, 224),
        color(232, 241, 242),
    ];

    function pointAt(x: number, y: number) {
        return points[y + x * pointYCount];
    }

    function getColor(pos: Vector2) {
        let ratio = pos.x / canvas.width;

        if(ratio < 0) {
            return colors[0];
        }
        
        if(ratio >= 1) {
            return colors[colors.length - 1];
        }
        
        let min = Math.floor(ratio * (colors.length - 1));
        let max = min + 1;
        let step = 1 / (colors.length - 1);

        let mapped = u.map(ratio, min * step, max * step, 0, 1);
        return colorLerp(colors[min], colors[max], mapped);
    }

    function findCircleCenter(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
        let x12 = x1 - x2;
        let x13 = x1 - x3;
    
        let y12 = y1 - y2;
        let y13 = y1 - y3;
    
        let y31 = y3 - y1;
        let y21 = y2 - y1;
    
        let x31 = x3 - x1;
        let x21 = x2 - x1;
    
        let sx13 = Math.pow(x1, 2) - Math.pow(x3, 2);
    
        let sy13 = Math.pow(y1, 2) - Math.pow(y3, 2);
    
        let sx21 = Math.pow(x2, 2) - Math.pow(x1, 2);
        let sy21 = Math.pow(y2, 2) - Math.pow(y1, 2);
    
        let f = ((sx13) * (x12)
                + (sy13) * (x12)
                + (sx21) * (x13)
                + (sy21) * (x13))
                / (2 * ((y31) * (x12) - (y21) * (x13)));
        let g = ((sx13) * (y12)
                + (sy13) * (y12)
                + (sx21) * (y13)
                + (sy21) * (y13))
                / (2 * ((x31) * (y12) - (x21) * (y13)));
    
        let h = -g;
        let k = -f;
    
        return new Vector2(h, k);
    }

    function setup() {
        spacing = canvas.width / 10;
        pointRadius = spacing / 4;

        pointXCount = 0;
        for(let x = -spacing; x < canvas.width + (spacing * 2); x += spacing) {
            pointYCount = 0;
            for(let y = -spacing; y < canvas.height + (spacing * 2); y += spacing) {
                points.push(new Point(new Vector2(x, y)));
                pointYCount++;
            }
            pointXCount++;
        }

        for(let x = 0; x < pointXCount - 1; ++x) {
            for(let y = 0; y < pointYCount - 1; ++y) {
                if(u.random(1) > 0.5) {
                    triangles.push(new Triangle(pointAt(x, y), pointAt(x + 1, y), pointAt(x, y + 1)));
                    triangles.push(new Triangle(pointAt(x + 1, y), pointAt(x, y + 1), pointAt(x + 1, y + 1)));
                } else {
                    triangles.push(new Triangle(pointAt(x, y), pointAt(x + 1, y), pointAt(x + 1, y + 1)));
                    triangles.push(new Triangle(pointAt(x, y), pointAt(x, y + 1), pointAt(x + 1, y + 1)));
                }
            }
        }
    }

    function draw() {
        ctx.fillStyle = colorToString(color(31, 31, 31));
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = colorToString(color(70, 70, 70, 60));
        ctx.lineWidth = 1;
        for(let triangle of triangles) {
            triangle.render();
        }

        ctx.fillStyle = colorToString(color(70, 70, 70));
        ctx.lineWidth = 5;
        for(let point of points) {
            point.update();
            point.render();
        }

        rafHandle = requestAnimationFrame(draw);
    }

    class Triangle {
        a: Point;
        b: Point;
        c: Point;

        constructor(a: Point, b: Point, c: Point) {
            this.a = a;
            this.b = b;
            this.c = c;
        }

        render() {
            let pos = findCircleCenter(this.a.position.x, this.a.position.y, this.b.position.x, this.b.position.y, this.c.position.x, this.c.position.y);
            ctx.fillStyle = colorToHex(getColor(pos));
            ctx.beginPath();
            ctx.moveTo(this.a.position.x, this.a.position.y);
            ctx.lineTo(this.b.position.x, this.b.position.y);
            ctx.lineTo(this.c.position.x, this.c.position.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }

    class Point {
        position: Vector2;
        origin: Vector2;
        dir: Vector2;
        speed: number;

        constructor(origin: Vector2) {
            this.position = origin.copy();
            this.origin = origin;
            this.dir = new Vector2(0, 1);
            this.dir.rotate(u.random(2 * Math.PI))
                .normalize()
                .mult(u.random(pointRadius * 0.8, pointRadius * 1.2));
            this.speed = u.random(-(Math.PI / 4), (Math.PI / 4)) / 165;
        }

        update() {
            this.position = this.origin.copy();
            this.dir.rotate(this.speed);
            this.position.add(this.dir);
        }

        render() {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, ctx.lineWidth / 2, 0, 2 * Math.PI, false);
            ctx.fill();
        }
    }

    onMount(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx = canvas.getContext("2d")!;
        setup();
        rafHandle = requestAnimationFrame(draw);
    });

    onDestroy(() => {
        if (rafHandle) cancelAnimationFrame(rafHandle);
    });
</script>

<div class="w-full h-full">
    <canvas bind:this={canvas} class="w-full h-full"></canvas>
</div>