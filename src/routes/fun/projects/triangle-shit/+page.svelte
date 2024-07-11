<script lang="ts">
    import type P5 from "p5";
    import { onDestroy, onMount } from "svelte";
    import ProjectView from "../ProjectView.svelte";

    let canvasContainer: HTMLDivElement;
    let p5: P5;

    let sketch = (sk: P5) => {
        let spacing;
        let points: Point[] = [];
        let triangles: Triangle[] = [];
        let pointXCount = 0;
        let pointYCount = 0;
        let colors: P5.Color[];

        const framerate = 165;
        let pointRadius = 0;

        function pointAt(x: number, y: number) {
            return points[y + x * pointYCount];
        }

        function getColor(pos: P5.Vector) {
            let ratio = pos.x / sk.width;

            let min: number = 0;
            let max: number = 0;

            if(ratio < 0) {
                return colors[0];
            }
            
            if(ratio >= 1) {
                return colors[colors.length - 1];
            }
            
            let step = 1 / (colors.length - 1);
            let i = 0;
            while(i < colors.length) {
                if(ratio < (i * step)) {
                    min = i - 1;
                    max = i;
                    break;
                }
                i++;
            }

            return sk.lerpColor(colors[min], colors[max], sk.map(ratio, min * step, max * step, 0, 1));
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
        
            let sx13 = sk.pow(x1, 2) - sk.pow(x3, 2);
        
            let sy13 = sk.pow(y1, 2) - sk.pow(y3, 2);
        
            let sx21 = sk.pow(x2, 2) - sk.pow(x1, 2);
            let sy21 = sk.pow(y2, 2) - sk.pow(y1, 2);
        
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
        
            return sk.createVector(h, k);
        }

        sk.setup = () => {
            const canvas = sk.createCanvas(window.innerWidth, window.innerHeight);
            canvas.parent(canvasContainer);
            sk.frameRate(framerate);

            spacing = sk.width / 10;
            pointRadius = spacing / 4;

            colors = [
                sk.color(19, 41, 61),
                sk.color(0, 100, 148),
                sk.color(36, 123, 160),
                sk.color(27, 152, 224),
                sk.color(232, 241, 242),
            ];

            pointXCount = 0;
            for(let x = -spacing; x < sk.width + (spacing * 2); x += spacing) {
                pointYCount = 0;
                for(let y = -spacing; y < sk.height + (spacing * 2); y += spacing) {
                    points.push(new Point(sk.createVector(x, y)));
                    pointYCount++;
                }
                pointXCount++;
            }

            for(let x = 0; x < pointXCount - 1; ++x) {
                for(let y = 0; y < pointYCount - 1; ++y) {
                    if(sk.random(1) > 0.5) {
                        triangles.push(new Triangle( pointAt(x, y), pointAt(x + 1, y), pointAt(x, y + 1)));
                        triangles.push(new Triangle( pointAt(x + 1, y), pointAt(x, y + 1), pointAt(x + 1, y + 1)));
                    } else {
                        triangles.push(new Triangle( pointAt(x, y), pointAt(x + 1, y), pointAt(x + 1, y + 1)));
                        triangles.push(new Triangle( pointAt(x, y), pointAt(x, y + 1), pointAt(x + 1, y + 1)));
                    }
                }
            }
        }

        sk.draw = () => {
            sk.background(31);

            sk.fill(100);
            sk.stroke(70, 60);
            sk.strokeWeight(1);
            for(let triangle of triangles) {
                triangle.render();
            }

            sk.stroke(70);
            sk.strokeWeight(5);
            for(let point of points) {
                point.update();
                point.render();
            }
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
                sk.fill(getColor(pos));
                sk.triangle(this.a.position.x, this.a.position.y, this.b.position.x, this.b.position.y, this.c.position.x, this.c.position.y);
            }
        }

        class Point {
            position: P5.Vector;
            origin: P5.Vector;
            dir: P5.Vector;
            speed: number;

            constructor(origin: P5.Vector) {
                this.position = origin.copy();
                this.origin = origin;
                this.dir = sk.createVector(0, 1).rotate(sk.random(360));
                this.dir.normalize();
                this.dir.mult(sk.random(pointRadius * 0.8, pointRadius * 1.2));
                this.speed = sk.random(-sk.QUARTER_PI, sk.QUARTER_PI) / framerate;
            }

            update() {
                this.position = this.origin.copy();
                this.dir.rotate(this.speed);
                this.position.add(this.dir);
            }

            render() {
                sk.point(this.position.x, this.position.y);
            }
        }
    }

    onMount(async () => {
        const P5 = await import("p5");
        p5 = new P5.default(sketch);
    });

    onDestroy(() => {
        p5?.remove();
    });
</script>

<ProjectView title="Triangle Shit" id="triangle-shit">
    <div bind:this={canvasContainer} class="w-full h-full" />
</ProjectView>