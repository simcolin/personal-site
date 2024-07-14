<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { u, Vector2 } from "../utils";

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let rafHandle: number;

    type Line = {
        pos: Vector2,
        prevPos: Vector2,
        color: string,
        delay: number,
        direction: Vector2,
        spinning: boolean,
        lengthBeforeSpin: number,
        rotationVel: number,
        reset: boolean,
    };

    let startTime: number;
    let lineCount = 50;
    let lineSpeed = 5;
    let lines: Line[] = [];

    function updateLine(line: Line) {
        if(Date.now() < startTime + line.delay) return;

        if(line.reset) {
            line.pos = u.vector2((canvas.width / 2) + u.random(-50, 50), canvas.height);
            line.prevPos = u.vector2(line.pos.x, line.pos.y);
            line.direction.x = 0;
            line.direction.y = -1;
            line.spinning = false;
            line.lengthBeforeSpin = canvas.height * 0.25 + u.random(0, canvas.height * 0.75);
            line.reset = false;
        } else {
            if(line.spinning) {
                line.direction.rotate(line.rotationVel);
                line.rotationVel *= 1.0005;
            } else {
                if(line.pos.y < line.lengthBeforeSpin) {
                    line.spinning = true;
                    let ratio = (canvas.height * 0.75) / line.lengthBeforeSpin;
                    if(u.random(0, 1) > 0.5) {
                        line.rotationVel = u.random(0.01, 0.04) * ratio;
                    } else {
                        line.rotationVel = -u.random(0.01, 0.04) * ratio;
                    }
                }
            }
            line.prevPos.x = line.pos.x;
            line.prevPos.y = line.pos.y;
            line.pos.x = line.pos.x + (line.direction.x * lineSpeed);
            line.pos.y = line.pos.y + (line.direction.y * lineSpeed);
        }
    }

    function drawLine(line: Line) {
        ctx.strokeStyle = line.color;
        ctx.beginPath();
        ctx.moveTo(line.prevPos.x, line.prevPos.y);
        ctx.lineTo(line.pos.x, line.pos.y);
        ctx.stroke();
    }

    function setup() {
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        startTime = Date.now();

        for(let i = 0; i < lineCount; ++i) {
            lines.push({
                pos: u.vector2(0, 0),
                prevPos: u.vector2(0, 0),
                color: u.color(u.random(0, 255), 255, 255/2).toHsl(),
                delay: u.random(2) * 1000,
                direction: u.vector2(0, 0),
                spinning: false,
                lengthBeforeSpin: 0,
                rotationVel: 0,
                reset: true,
            });
        }
        ctx.fillStyle = "#0d0d0d";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function draw() {
        for(let i = 0; i < lineCount; ++i) {
            updateLine(lines[i]);
            drawLine(lines[i]);
        }
        
        rafHandle = requestAnimationFrame(draw);
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