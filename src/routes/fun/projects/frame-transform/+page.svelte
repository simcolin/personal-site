<script lang="ts">
    import { onMount } from "svelte";
    import { u, Vector2 } from "../utils";
    import { createNoise2D } from "simplex-noise";
        
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    let imgInputElem: HTMLInputElement;
    let img: HTMLImageElement;
    let transformName: string = "none";
    let var1: number = 5;
    let var2: number = 100;
    let noise = createNoise2D();

    type TransformFunction = (oldX: number, oldY: number, imageData: ImageData) => [number, number, number, number];
    const transformMap: Map<string, TransformFunction> = new Map([
        ["none", function(oldX, oldY, imageData) {
            let index = (oldX + canvas.width * oldY) * 4;
            return [
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2],
                imageData.data[index + 3],
            ];
        }],
        ["sin", function(oldX, oldY, imageData) {
            let x = Math.round(oldX + Math.sin(oldX) * var1);
            let y = Math.round(oldY + Math.sin(oldY) * var1);
            let index = (x + canvas.width * y) * 4;
            return [
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2],
                imageData.data[index + 3],
            ];
        }],
        ["tan", function(oldX, oldY, imageData) {
            let x = Math.round(oldX + Math.tan(oldX) * var1);
            let y = Math.round(oldY + Math.tan(oldY) * var1);
            let index = (x + canvas.width * y) * 4;
            return [
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2],
                imageData.data[index + 3],
            ];
        }],
        ["noise", function(oldX, oldY, imageData) {
            let value = noise(oldX / var2, oldY / var2);
            let offset = new Vector2(0, var1)
                .rotate((value + 1) / 2 * Math.PI * 2)
            
            let x = Math.round(oldX + offset.x);
            let y = Math.round(oldY + offset.y);
            let index = (x + canvas.width * y) * 4;
            return [
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2],
                imageData.data[index + 3],
            ];
        }],
        ["pixel", function(oldX, oldY, imageData) {
            let x = Math.floor(oldX / var1) * var1;
            let y = Math.floor(oldY / var1) * var1;
            let index = (x + canvas.width * y) * 4;
            return [
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2],
                imageData.data[index + 3],
            ];
        }],
    ]);

    function onImageInput(e: SvelteEvent<Event, HTMLInputElement>) {
        let file = e.currentTarget.files?.[0];
        if (!file) return;
        let reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result !== "string") return;
            u.loadImage(reader.result).then(loadedImg => {
                img = loadedImg;
                draw();
            });
        }
        reader.readAsDataURL(file);
    }

    function onTransformChange() {
        draw();
    }

    function scaleUpToCover(fromWidth: number, fromHeight: number, boundingWidth: number, boundingHeight: number) {
        let ratio = Math.min(
            (boundingWidth / fromWidth),
            (boundingHeight / fromHeight)
        );
        return {
            width: Math.round(fromWidth * ratio),
            height: Math.round(fromHeight * ratio),
        }
    }

    async function preload() {
        img = await u.loadImage("/images/source.png");
    }

    function setup() {
        draw();
    }

    function draw() {
        let currentTransformFunc = transformMap.get(transformName)!;
        if (!currentTransformFunc) {
            currentTransformFunc = transformMap.get("none")!;
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let { width, height } = scaleUpToCover(img.naturalWidth, img.naturalHeight, canvas.width, canvas.height);
        ctx.drawImage(img, canvas.width / 2 - width / 2, canvas.height / 2 - height / 2, width, height);
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let copy = new ImageData(imageData.data, imageData.width, imageData.height);
        for(let cx = 0; cx < canvas.width; ++cx) {
            for(let cy = 0; cy < canvas.height; ++cy) {
                let color = currentTransformFunc(cx, cy, imageData);
                let index = (cx + canvas.width * cy) * 4;
                copy.data[index] = color[0] || 0;
                copy.data[index + 1] = color[1] || 0;
                copy.data[index + 2] = color[2] || 0;
                copy.data[index + 3] = color[3] || 0;
            }
        }
        ctx.putImageData(copy, 0, 0);
    }

    onMount(() => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        ctx = canvas.getContext("2d")!;
        preload().then(() => {
            setup();
        });
    });
</script>

<div class="w-full h-full relative">
    <canvas bind:this={canvas} class="w-full h-full"></canvas>
    <div class="absolute top-4 left-4 flex items-center gap-2 rounded-lg p-2 bg-[#252f3f] tooz-shadow">
        <select class="select select-sm" bind:value={transformName} on:change={onTransformChange}>
            <option value="none">None</option>
            <option value="sin">Sin</option>
            <option value="tan">Tan</option>
            <option value="noise">Noise</option>
            <option value="pixel">Pixel</option>
        </select>
        <input class="input input-sm" type="number" bind:value={var1} on:change={onTransformChange} />
        <input class="input input-sm" type="number" bind:value={var2} on:change={onTransformChange} />
        <input class="hidden" bind:this={imgInputElem} accept="image/*" type="file" on:input={onImageInput} />
        <button class="btn btn-sm" on:click={() => imgInputElem?.click()}>
            Input your image
        </button>
    </div>
</div>