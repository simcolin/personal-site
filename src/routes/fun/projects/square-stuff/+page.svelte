<script lang="ts">
    import type P5 from "p5";
    import { onDestroy, onMount } from "svelte";
    import SquareWorker from "./worker?worker";
    import ProjectView from "../ProjectView.svelte";

    let imageInput: HTMLInputElement;
    let canvasContainer: HTMLDivElement;
    let canvasElement: HTMLCanvasElement;
    let p5: P5;
    let worker: Worker;

    let showOriginal: boolean = false;

    let iterationCount = 50000;
    let generationCount = 1;
    let progress = 0;
    let imageUrl: string = "/images/source.png";

    $: if(canvasElement) {
        canvasElement.style.display = showOriginal ? "none" : "block";
    }

    let sketch = (sk: P5) => {
        imageInput.oninput = () => {
            progress = 0;
            const file = imageInput.files ? imageInput.files[0] : null;
            if(file) {
                imageUrl = URL.createObjectURL(file);
                processImage(imageUrl);
            }
        }

        function processImage(url: string) {
            sk.loadImage(url, source => {
                source.loadPixels();

                sk.resizeCanvas(source.width, source.height);
                sk.background(0);

                worker?.terminate();
                worker = new SquareWorker();
                worker.postMessage({
                    target: source.pixels,
                    imgWidth: source.width,
                    imgHeight: source.height,
                    iterationCount,
                    generationCount,
                });
                worker.onmessage = e => {
                    for(const rect of e.data.rects) {
                        sk.fill(rect.color[0], rect.color[1], rect.color[2])
                        sk.square(rect.x, rect.y, rect.size);
                    }
                    progress = e.data.progress * 100;
                }
            });
        }

        sk.setup = () => {
            const canvas = sk.createCanvas(window.innerWidth, window.innerHeight);
            canvas.parent(canvasContainer);
            canvasElement = canvas.elt;

            sk.noStroke();
            sk.noLoop();
            sk.rectMode(sk.CENTER);
            
            processImage(imageUrl);
        }
    }

    onMount(async () => {
        const P5 = await import("p5");
        p5 = new P5.default(sketch);
    });

    onDestroy(() => {
        worker?.terminate();
        p5?.remove();
    });
</script>

<ProjectView title="Square Stuff" id="square-stuff">
    <div class="w-full h-full flex flex-col p-4 bg-slate-800 gap-2">
        <div class="flex items-center gap-2">
            <button on:click={() => imageInput.click()} class="rounded py-2 px-4 border bg-slate-700 hover:bg-slate-600">Input your image</button>
            <input bind:this={imageInput} accept="image/*" type="file" class="hidden">
        </div>
        <div class="flex items-center gap-2">
            Show original image
            <input type="checkbox" bind:checked={showOriginal}>
        </div>
        <div class="relative w-full h-8 min-h-[2rem] min-h-8 border bg-slate-700 rounded">
            <div class="h-full bg-slate-300" style:width={progress + "%"} />
            <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference">Progress: {progress.toFixed(2)}%</span>
        </div>
        <div bind:this={canvasContainer} class="grow w-full canvas-container overflow-hidden flex items-center justify-center">
            <img src={imageUrl} alt="source" class="w-full h-full object-contain" class:hidden={!showOriginal} >
        </div>
    </div>
</ProjectView>

<style lang="postcss">
    .canvas-container :global(canvas) {
        width: 100% !important;
        height: 100% !important;
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }    
</style>