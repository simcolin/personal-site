<script lang="ts">
    import type P5 from "p5";
    import { onDestroy, onMount } from "svelte";

    let canvasContainer: HTMLDivElement;
    let p5: P5;

    type Line = {
        pos: P5.Vector,
        prevPos: P5.Vector,
        color: P5.Color,
        delay: number,
        direction: P5.Vector,
        spinning: boolean,
        lengthBeforeSpin: number,
        rotationVel: number,
        reset: boolean,
    };

    let sketch = (sk: P5) => {
        let startTime: number;
        let lineCount = 50;
        let lineSpeed = 5;
        let lines: Line[] = [];

        const updateLine = (line: Line) => {
            if(Date.now() < startTime + line.delay) return;

            if(line.reset) {
                line.pos = sk.createVector((sk.width / 2) + sk.random(-50, 50), sk.height);
                line.prevPos = sk.createVector(line.pos.x, line.pos.y);
                line.direction.x = 0;
                line.direction.y = -1;
                line.spinning = false;
                line.lengthBeforeSpin = sk.height * 0.25 + sk.random(0, sk.height * 0.75);
                line.reset = false;
            } else {
                if(line.spinning) {
                    line.direction.rotate(line.rotationVel);
                    line.rotationVel *= 1.0005;
                } else {
                    if(line.pos.y < line.lengthBeforeSpin) {
                        line.spinning = true;
                        let ratio = (sk.height * 0.75) / line.lengthBeforeSpin;
                        if(sk.random(0, 1) > 0.5) {
                            line.rotationVel = sk.random(0.01, 0.04) * ratio;
                        } else {
                            line.rotationVel = -sk.random(0.01, 0.04) * ratio;
                        }
                    }
                }
                line.prevPos.x = line.pos.x;
                line.prevPos.y = line.pos.y;
                line.pos.x = line.pos.x + (line.direction.x * lineSpeed);
                line.pos.y = line.pos.y + (line.direction.y * lineSpeed);
            }
        }

        const drawLine = (line: Line) => {
            sk.stroke(line.color);

            sk.line(line.pos.x, line.pos.y, line.prevPos.x, line.prevPos.y);
        }

        sk.setup = () => {
            const nav = document.getElementById("nav")!;
            const canvas = sk.createCanvas(window.innerWidth - nav.clientWidth, window.innerHeight);
            canvas.parent(canvasContainer);
            sk.strokeWeight(3);
            sk.strokeCap(sk.ROUND);
            sk.strokeJoin(sk.ROUND);
            sk.frameRate(144);
            startTime = Date.now();
            sk.colorMode(sk.HSB);

            for(let i = 0; i < lineCount; ++i) {
                lines.push({
                    pos: sk.createVector(0, 0),
                    prevPos: sk.createVector(0, 0),
                    color: sk.color(sk.random(0, 255), 255, 255),
                    delay: sk.random(2) * 1000,
                    direction: sk.createVector(0, 0),
                    spinning: false,
                    lengthBeforeSpin: 0,
                    rotationVel: 0,
                    reset: true,
                });
            }
            sk.background(14);
        }

        sk.draw = () => {
            for(let i = 0; i < lineCount; ++i) {
                updateLine(lines[i]);
                drawLine(lines[i]);
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

<div bind:this={canvasContainer} class="w-full h-full"></div>