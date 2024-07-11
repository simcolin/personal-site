<script lang="ts">
    import { onMount } from "svelte";
    import { Vector } from "./vector";
    import RayTracerOptions, { type Stats } from "./RayTracerOptions.svelte";
    import type { Options } from "./options";
    import { createPlane, createSphere, random } from "./obstacles";
    import { antialiazedRenderPixel } from "./rendering";
    import seedrandom from "seedrandom";
    import RayWorker from "./worker?worker";
    import ProjectView from "../ProjectView.svelte";

    let canvas: HTMLCanvasElement;

    let width: number = 0;
    let height: number = 0;

    let stats: Stats = {
        total: 0,
        rendering: 0,
        processing: 0,
    }

    let obstacles: any[];
    let workers: Worker[] = [];
    let workersRunning: boolean = false;
    let options: Options;
    let ctx: CanvasRenderingContext2D;
    let imageData: ImageData;
    let progress = 0;
    let pixelData: Uint16Array;

    function init() {
        generateRandomScene();
        for(let i = 0; i < navigator.hardwareConcurrency - 2; ++i) {
            const worker = new RayWorker();
            workers.push(worker);
        }
        
        render();
    }

    function generateRandomScene() {
        seedrandom(options.RANDOM_SEED, { global: true });

        obstacles = [];
        for(let i = 0; i < 8; ++i) {
            obstacles.push(createSphere(new Vector(random(-8, 8), random(-8, 8), random(8, 12)), random(2, 4)));
        }
        obstacles.push(createPlane(new Vector(0, -12, 0), new Vector(0, -1, 0)));
    }

    function updateStats(total: number, rendering: number, processing: number) {
        stats.total = total;
        stats.rendering = rendering;
        stats.processing = processing;
    }
    
    function render() {
        progress = 0;
        if(options.MULTITHREAD) {
            startWorkers();
        } else {
            let totalStart = performance.now();
            for(let i = 0; i < width; ++i) {
                for(let j = 0; j < height; ++j) {
                    let col = antialiazedRenderPixel(i, j, width, height, options.ANTIALIASING, options, obstacles);
                    
                    let index = 4 * (i + j * width);
                    imageData.data[index] = col[0];
                    imageData.data[index + 1] = col[1];
                    imageData.data[index + 2] = col[2];
                    imageData.data[index + 3] = col[3];
                }
                progress = i / width;
            }
            ctx.putImageData(imageData, 0, 0);
            progress = 1;
            updateStats(performance.now() - totalStart, 0, 0);
        }
    }

    function startWorkers() {
        console.log("startWorkers");
        if(workersRunning) return;
        workersRunning = true;
        let totalStart = performance.now();
        pixelData = new Uint16Array(width * height * 6);
        let counter = 0;
        let workersProgress: any[] = [];
        for(let i = 0; i < workers.length; ++i) {
            workers[i].postMessage({
                index: i,
                count: workers.length,
                width,
                height,
                obstacles,
                OPTS: options,
            });
            workers[i].onmessage = e => {
                if(e.data.length) {
                    counter++;
                    pixelData.set(e.data, e.data.length * i);
                    if(counter == workers.length) {
                        progress = 1;
                        onWorkersDone(totalStart);
                    }
                } else {
                    workersProgress[i] = e.data;
                    progress = workersProgress.reduce((a, b) => a + b) / workers.length;
                }
            }
        }
    }

    function onWorkersDone(totalStart: number) {
        progress = 1;
        workersRunning = false;
        let renderingStart = performance.now();
        for(let i = 0; i < pixelData.length; i += 6) {
            let index = 4 * (pixelData[i] + pixelData[i + 1] * width);
            imageData.data[index] = pixelData[i + 2];
            imageData.data[index + 1] = pixelData[i + 3];
            imageData.data[index + 2] = pixelData[i + 4];
            imageData.data[index + 3] = pixelData[i + 5];
        }
        ctx.putImageData(imageData, 0, 0);
        let totalEnd = performance.now();
        updateStats(totalEnd - totalStart, totalEnd - renderingStart, renderingStart - totalStart);
    }

    function onResetScene() {
        generateRandomScene();
        render();
    }

    function onRerender() {
        render();
    }

    onMount(() => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width
        canvas.height = height;

        const context = canvas.getContext('2d');
        if(!context) return;
        ctx = context;
        imageData = ctx.createImageData(width, height);

        init();
    });
</script>

<ProjectView title="Ray Tracer/Marcher" id="ray-tracer">
    <div class="w-full h-full relative bg-black">
        <div class="absolute left-0 bottom-0 h-1 border-t border-black bg-teal-500" style="width: {Math.floor(progress * 100)}%"/>
        <canvas class="w-full h-full" bind:this={canvas} />
        <RayTracerOptions bind:options={options} {stats} on:resetscene={onResetScene} on:rerender={onRerender} />
    </div>
</ProjectView>