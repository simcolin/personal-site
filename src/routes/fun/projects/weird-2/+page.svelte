<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { color, colorToHsl, colorToString, u, Vector2 } from "../utils";
        
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let rafHandle: number;

    type Line = {
        pos: Vector2,
        prevPos: Vector2,
        color: string,
        direction: Vector2,
        thickness: number,
        rotationVel: number,
        nextSwitchTime: number,
        nextSpawnTime: number,
        permanent: boolean,
    };

    let lineCount = 50;
    let lineSpeed = 3;
    let lines: Line[] = [];
    let linesToDelete: number[] = [];

    function isInView(vec: Vector2) {
        return vec.x >= 0 && vec.x < canvas.width && vec.y >= 0 && vec.y < canvas.height;
    }
    
    function randomRot() {
        return u.random(0, 1) > 0.5 ? u.random(0.01, 0.04) : -u.random(0.01, 0.04);
    }

    function updateLine(line: Line, index: number) {
        const now = Date.now();

        if(now > line.nextSwitchTime) {
            if(line.permanent) {
                line.rotationVel = randomRot();
                line.nextSwitchTime = now + u.random(250, 1000);
            } else {
                linesToDelete.push(index);
            }
        }

        if(now > line.nextSpawnTime) {
            line.nextSpawnTime = now + u.random(100, 300);
            lines.push({
                pos: new Vector2(line.pos.x, line.pos.y),
                prevPos: new Vector2(line.pos.x, line.pos.y),
                color: line.color,
                direction: new Vector2(line.direction.x, line.direction.y),
                thickness: u.random(1, 2.5),
                rotationVel: randomRot(),
                nextSwitchTime: now + u.random(250, 1000),
                nextSpawnTime: now + 50000,
                permanent: false,
            });
        }

        line.direction.rotate(line.rotationVel);
        line.prevPos.x = line.pos.x;
        line.prevPos.y = line.pos.y;
        line.pos.x = line.pos.x + (line.direction.x * lineSpeed);
        line.pos.y = line.pos.y + (line.direction.y * lineSpeed);

        ctx.lineWidth = line.thickness;
        ctx.strokeStyle = line.color;
        ctx.beginPath();
        ctx.moveTo(line.prevPos.x, line.prevPos.y);
        ctx.lineTo(line.pos.x, line.pos.y);
        ctx.stroke();

        if(!isInView(line.pos)) {
            const lastPos = new Vector2(line.pos.x, line.pos.y);
            line.pos.x = line.pos.x > 0 ? line.pos.x % canvas.width : line.pos.x + canvas.width;
            line.pos.y = line.pos.y > 0 ? line.pos.y % canvas.height : line.pos.y + canvas.height;

            line.prevPos.x += line.pos.x - lastPos.x;
            line.prevPos.y += line.pos.y - lastPos.y;

            ctx.strokeStyle = line.color;
            ctx.beginPath();
            ctx.moveTo(line.prevPos.x, line.prevPos.y);
            ctx.lineTo(line.pos.x, line.pos.y);
            ctx.stroke();
        }
    }

    function setup() {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        for(let i = 0; i < lineCount; ++i) {
            let startPos = new Vector2(u.random(canvas.width), u.random(canvas.height));
            
            lines.push({
                pos: startPos,
                prevPos: new Vector2(startPos.x, startPos.y),
                color: colorToHsl(color(u.random(0, 255), u.random(125, 255), 127.5 + u.random(-50, 50))),
                direction: new Vector2(0, 1).rotate(u.random(2 * Math.PI)),
                thickness: 5,
                rotationVel: 0,
                nextSwitchTime: 0,
                nextSpawnTime: 0,
                permanent: true,
            });
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function draw() {
        ctx.fillStyle = colorToString(color(0, 0, 0, 255 * 0.05));
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for(let i = 0; i < lines.length; ++i) {
            updateLine(lines[i], i);
        }

        for(let i = linesToDelete.length - 1; i >= 0; --i) {
            lines.splice(linesToDelete[i], 1);
        }
        linesToDelete = [];

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