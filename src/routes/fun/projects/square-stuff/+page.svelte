<script lang="ts">
    import { onMount } from "svelte";
    import SquareWorker from "./worker?worker";
    import { u } from "../utils";

    let imageInput: HTMLInputElement;
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    let worker: Worker;

    let showOriginal: boolean = false;

    let iterationCount = 50000;
    let generationCount = 1;
    let progress = 0;
    let imageUrl: string = "/images/source.png";

    function onInput() {
        progress = 0;
        const file = imageInput.files ? imageInput.files[0] : null;
        if(file) {
            imageUrl = URL.createObjectURL(file);
            processImage(imageUrl);
        }
    }

    function processImage(url: string) {
        u.loadImage(url).then(source => {
            let imageData = u.loadImagePixels(source);

            canvas.width = source.naturalWidth;
            canvas.height = source.naturalHeight;

            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            worker?.terminate();
            worker = new SquareWorker();
            worker.postMessage({
                target: imageData.data,
                imgWidth: source.width,
                imgHeight: source.height,
                iterationCount,
                generationCount,
            });
            worker.onmessage = e => {
                for(const rect of e.data.rects) {
                    ctx.fillStyle = u.color(rect.color[0], rect.color[1], rect.color[2]).toRGB();
                    ctx.fillRect(rect.x - rect.size / 2, rect.y - rect.size / 2, rect.size, rect.size);
                }
                progress = e.data.progress * 100;
            }
        });
    }

    function setup() {        
        processImage(imageUrl);
    }

    onMount(async () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx = canvas.getContext("2d")!;
        setup();
    });
</script>

<div class="w-full h-full flex flex-col p-4 bg-slate-800 gap-2">
    <div class="flex items-center gap-2">
        <button on:click={() => imageInput.click()} class="rounded py-2 px-4 border bg-slate-700 hover:bg-slate-600">Input your image</button>
        <input bind:this={imageInput} on:input={onInput} accept="image/*" type="file" class="hidden">
    </div>
    <div class="flex items-center gap-2">
        Show original image
        <input type="checkbox" bind:checked={showOriginal}>
    </div>
    <div class="relative w-full h-8 min-h-8 border bg-slate-700 rounded">
        <div class="h-full bg-slate-300" style:width={progress + "%"} />
        <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference">Progress: {progress.toFixed(2)}%</span>
    </div>
    <div class="grow w-full overflow-hidden flex items-center justify-center">
        <img src={imageUrl} alt="source" class="w-full h-full object-contain" class:hidden={!showOriginal} >
        <canvas bind:this={canvas} class="w-full h-full object-contain" class:hidden={showOriginal} />
    </div>
</div>