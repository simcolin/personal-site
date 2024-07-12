<script lang="ts">
    import type P5 from "p5";
    import { onDestroy, onMount } from "svelte";
    
    let canvasContainer: HTMLDivElement;
    let p5: P5;

    type Line = {
        pos: P5.Vector,
        prevPos: P5.Vector,
        color: P5.Color,
        direction: P5.Vector,
        thickness: number,
        rotationVel: number,
        nextSwitchTime: number,
        nextSpawnTime: number,
        permanent: boolean,
    };

    let sketch = (sk: P5) => {
        let lineCount = 50;
        let lineSpeed = 3;
        let lines: Line[] = [];
        let linesToDelete: number[] = [];

        const isInView = (vec: P5.Vector) => {
            return vec.x >= 0 && vec.x < sk.width && vec.y >= 0 && vec.y < sk.height;
        }
        
        const randomRot = () => {
            return sk.random(0, 1) > 0.5 ? sk.random(0.01, 0.04) : -sk.random(0.01, 0.04);
        }

        const updateLine = (line: Line, index: number) => {
            const now = Date.now();

            if(now > line.nextSwitchTime) {
                if(line.permanent) {
                    line.rotationVel = randomRot();
                    line.nextSwitchTime = now + sk.random(250, 1000);
                } else {
                    linesToDelete.push(index);
                }
            }

            if(now > line.nextSpawnTime) {
                line.nextSpawnTime = now + sk.random(100, 300);
                lines.push({
                    pos: sk.createVector(line.pos.x, line.pos.y),
                    prevPos: sk.createVector(line.pos.x, line.pos.y),
                    color: line.color,
                    direction: sk.createVector(line.direction.x, line.direction.y),
                    thickness: sk.random(1, 2.5),
                    rotationVel: randomRot(),
                    nextSwitchTime: now + sk.random(250, 1000),
                    nextSpawnTime: now + 50000,
                    permanent: false,
                });
            }

            line.direction.rotate(line.rotationVel);
            line.prevPos.x = line.pos.x;
            line.prevPos.y = line.pos.y;
            line.pos.x = line.pos.x + (line.direction.x * lineSpeed);
            line.pos.y = line.pos.y + (line.direction.y * lineSpeed);

            sk.stroke(line.color);
            sk.strokeWeight(line.thickness);
            sk.line(line.pos.x, line.pos.y, line.prevPos.x, line.prevPos.y);

            if(!isInView(line.pos)) {
                const lastPos = sk.createVector(line.pos.x, line.pos.y);
                line.pos.x = line.pos.x > 0 ? line.pos.x % sk.width : line.pos.x + sk.width;
                line.pos.y = line.pos.y > 0 ? line.pos.y % sk.height : line.pos.y + sk.height;

                line.prevPos.x += line.pos.x - lastPos.x;
                line.prevPos.y += line.pos.y - lastPos.y;

                sk.stroke(line.color);
                sk.line(line.pos.x, line.pos.y, line.prevPos.x, line.prevPos.y);
            }
        }

        sk.setup = () => {
            const nav = document.getElementById("nav")!;
            const canvas = sk.createCanvas(window.innerWidth - nav.clientWidth, window.innerHeight);
            canvas.parent(canvasContainer);
            sk.strokeCap(sk.ROUND);
            sk.strokeJoin(sk.ROUND);
            sk.frameRate(144);
            sk.colorMode(sk.HSB);

            for(let i = 0; i < lineCount; ++i) {
                let startPos = sk.createVector(sk.random(sk.width), sk.random(sk.height));
                
                lines.push({
                    pos: startPos,
                    prevPos: sk.createVector(startPos.x, startPos.y),
                    color: sk.color(sk.random(0, 255), sk.random(125, 255), sk.random(125, 255)),
                    direction: sk.createVector(0, 1).rotate(sk.random(0, 360)),
                    thickness: 5,
                    rotationVel: 0,
                    nextSwitchTime: 0,
                    nextSpawnTime: 0,
                    permanent: true,
                });
            }
            sk.background(0);
        }

        sk.draw = () => {
            sk.background(0, 0.05);
            for(let i = 0; i < lines.length; ++i) {
                updateLine(lines[i], i);
            }

            for(let i = linesToDelete.length - 1; i >= 0; --i) {
                lines.splice(linesToDelete[i], 1);
            }
            linesToDelete = [];
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