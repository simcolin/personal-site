<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { colorLerp, colorToString, createColor, Vector3, type Color } from "./utils";
    import { createNoise3D } from "simplex-noise";
    import { PixelatedStrand, Strand } from "./strand";
        
    let canvasContainer: HTMLDivElement;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let rafHandle: number;

    // frame related vars
    let frameRate = 0;
    let deltaTime = 0;
    let frameCount = 0;
    let lastFrameTime = 0;
    
    const BACKGROUND_COLOR = createColor(0, 12, 0, 255); 
    const PIXEL_SIZE = 10;

    const WIND_SCALE = 50.0;
    const WIND_SPEED = 1000;

    const STRAND_MIN_LENGTH = 4;
    const STRAND_MAX_LENGTH = 10;
    const STRAND_COUNT = 1000;
    
    let windPosition = new Vector3(0, 0, 0);
    let windDirection = new Vector3(0, 0, 0);
    let windDirectionTarget = new Vector3(1, 1, 0.1).mult(WIND_SPEED);
    let pixelatedStrands: PixelatedStrand[] = [];
    let strands: PixelatedStrand[] = [];

    let renderPixel = false;

    let noise = createNoise3D();

    $: renderPixel, onRenderPixelChanged();

    function setup() {
        ctx.strokeStyle = "transparent";
        ctx.imageSmoothingEnabled = false;

        pixelatedStrands = [];
        strands = [];
        for (let i = 0; i < STRAND_COUNT; ++i) {
            let length = STRAND_MIN_LENGTH + Math.random() * (STRAND_MAX_LENGTH - STRAND_MIN_LENGTH);

            let strand = new Strand(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                Array(Math.floor(length)),
                Array(Math.floor(length) * 2)
            );
            strands.push(strand);

            let pixelatedStrand = new PixelatedStrand(
                Math.floor(strand.x / PIXEL_SIZE),
                Math.floor(strand.y / PIXEL_SIZE),
                Array(strand.colors.length),
                Array(strand.positions.length)
            );
            pixelatedStrands.push(pixelatedStrand);
        }

        pixelatedStrands.sort((a, b) => {
            return a.y - b.y;
        });

        strands.sort((a, b) => {
            return a.y - b.y;
        });
    }

    function draw() {
        ctx.fillStyle = colorToString(BACKGROUND_COLOR);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (renderPixel) {
            for(let strand of pixelatedStrands) {
                let noiseValue = noise( 
                    strand.x / WIND_SCALE + windPosition.x,
                    strand.y / WIND_SCALE + windPosition.y,
                    windPosition.z
                ) / 2 + 0.5;
                strand.update(0.5, noiseValue);
                strand.draw(ctx);
            }
        } else {
            for(let strand of strands) {
                let noiseValue = noise( 
                    strand.x / PIXEL_SIZE / WIND_SCALE + windPosition.x,
                    strand.y / PIXEL_SIZE / WIND_SCALE + windPosition.y,
                    windPosition.z
                ) / 2 + 0.5;
                strand.update(0.5, noiseValue);
                strand.draw(ctx);
            }
        }
        
        windDirection = windDirection.lerp(windDirectionTarget, 0.01)
        windPosition = windPosition.add(windDirection.copy().mult(deltaTime / 1000))

        frameCount++;
        deltaTime = (performance.now() - lastFrameTime) / 1000;
        if (frameCount % 10 === 0) {
            frameRate = Math.floor(1 / deltaTime);
        }
        lastFrameTime = performance.now();

        rafHandle = requestAnimationFrame(draw);
    }

    function onClick(event: MouseEvent) {
        let mouseX = event.offsetX;
        let mouseY = event.offsetY;

        windDirectionTarget = new Vector3(1, 1, 0.1).mult(WIND_SPEED);
        windDirectionTarget = new Vector3(canvas.width / 2 - mouseX, canvas.height / 2 - mouseY, 0)
            .normalize()
            .add(new Vector3(0, 0, 0.1))
            .mult(WIND_SPEED);
    }

    function onRenderPixelChanged() {
        if (!ctx) return;
        if (renderPixel) {
            ctx.scale(PIXEL_SIZE, PIXEL_SIZE);
        } else {
            ctx.resetTransform();
        }
    }

    onMount(() => {
        const nav = document.getElementById("nav")!;
        canvas.width = window.innerWidth - nav.clientWidth;
        canvas.height = window.innerHeight;

        ctx = canvas.getContext("2d")!;
        setup();
        rafHandle = requestAnimationFrame(draw);
    });

    onDestroy(() => {
        if (rafHandle) cancelAnimationFrame(rafHandle);
    })
</script>

<div bind:this={canvasContainer} class="w-full h-full relative">
    <div class="absolute top-2 right-2 z-10 shadow-md">{frameRate} FPS</div>
    <div class="flex items-center gap-1 absolute top-2 left-2 z-10 shadow-md">
        <input type="checkbox" bind:checked={renderPixel} />
        <span>Render Pixel</span>
    </div>
    <canvas bind:this={canvas} on:click={onClick} class="w-full h-full"></canvas>
</div>