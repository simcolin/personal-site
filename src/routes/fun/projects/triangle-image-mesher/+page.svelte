<script lang="ts">
    import { onMount } from "svelte";

    type Vector = { x: number, y: number };

    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;

    let imageInput: HTMLInputElement;
    let dropzoneText = "Drag & drop or click here";
    let generationTimeText = "No generation time";
    let downloadText = "Download Result";
    let downloadDisabled = true;

    let spacing = 20;
    let maxSpacing = 20;
    let randomness = 10;
    let maxRandomness = 10;
    let useGradient = false;

    let generationStartTime = 0;
    let generationEndTime = 0;

    let image: HTMLImageElement;
    let blob: Blob;
    let file: File;

    function onDropzoneDragOver(event: DragEvent) {
        event.preventDefault();
    }

    function onDropzoneDrop(event: DragEvent) {
        event.preventDefault();
        event.stopPropagation();
        const droppedFile = event.dataTransfer?.items[0]?.getAsFile();
        if(!droppedFile) return;
        file = droppedFile;
        tryReadFile();
    }

    function onImageChange(e: any) {
        file = e.target.files[0];
        tryReadFile();
    }

    function downloadCanvas() {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = "convert.png";
        link.href = url;
        link.click();
        link.remove();
    }

    function tryReadFile() {
        if (!file) return;
        dropzoneText = `${file.name} (${toReadableSize(file.size)})`;
        const reader = new FileReader();
        reader.onload = () => {
            image = new Image();
            image.onload = () => {
                drawImageToCanvas(image);
            }
            maxSpacing = Math.min(image.naturalWidth, image.naturalHeight);
            maxRandomness = maxSpacing;
            if(reader.result) {
                image.src = reader.result.toString();
            }
        }

        reader.readAsDataURL(file);
    }

    function drawImageToCanvas(image: HTMLImageElement) {
        generationStartTime = (new Date()).getTime();
        ctx.canvas.width = image.naturalWidth;
        ctx.canvas.height = image.naturalHeight;
        ctx.drawImage(image, 0, 0);

        generateRandomPoints(image.naturalWidth, image.naturalHeight);
    }

    function generateRandomPoints(width: number, height: number) {
        const xCount = Math.ceil(width / spacing);
        const yCount = Math.ceil(height / spacing);

        const points: Vector[][] = [];
        const colors: string[][] = [];
        for (let x = 0; x < xCount; ++x) {
            points[x] = [];
            colors[x] = [];
            for (let y = 0; y < yCount; ++y) {
                const point = {
                    x: Math.floor((x * spacing) + (Math.random() - 0.5) * randomness),
                    y: Math.floor((y * spacing) + (Math.random() - 0.5) * randomness),
                };
                points[x][y] = point;

                if(useGradient) {
                    const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
                    colors[x][y] = `#${byteToHex(pixel[0])}${byteToHex(pixel[1])}${byteToHex(pixel[2])}`;
                }
            }
        }

        drawTriangles(points, colors, xCount, yCount);
    }

    function drawTriangleGradient(a: Vector, b: Vector, c: Vector, ac: string, bc: string, cc: string) {
        const radius = 50;
        const grd1 = ctx.createRadialGradient(a.x, a.y, 0, a.x, a.y, radius);
        grd1.addColorStop(0, ac + "ff");
        grd1.addColorStop(1, ac + "00");

        const grd2 = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, radius);
        grd2.addColorStop(0, bc + "ff");
        grd2.addColorStop(1, bc + "00");

        const grd3 = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, radius);
        grd3.addColorStop(0, cc + "ff");
        grd3.addColorStop(1, cc + "00");

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.closePath();

        ctx.fillStyle = grd1;
        ctx.fill();
        ctx.fillStyle = grd2;
        ctx.fill();
        ctx.fillStyle = grd3;
        ctx.fill();
    }

    function drawTriangleWithRandomColor(a: Vector, b: Vector, c: Vector) {
        const colorPoints = getRandomPointInsideTriangle(a, b, c);

        const pixel = ctx.getImageData(colorPoints.x, colorPoints.y, 1, 1).data;
        const color = "rgb(" + pixel[0] + "," + pixel[1] + "," + pixel[2] + ")";

        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.lineTo(c.x, c.y);
        ctx.fill();
    }

    function getRandomPointInsideTriangle(a: Vector, b: Vector, c: Vector): Vector {
        const r1 = Math.random();
        const r2 = Math.random();

        const sqrtR1 = Math.sqrt(r1);

        const x = (1 - sqrtR1) * a.x + (sqrtR1 * (1 - r2)) * b.x + (sqrtR1 * r2) * c.x;
        const y = (1 - sqrtR1) * a.y + (sqrtR1 * (1 - r2)) * b.y + (sqrtR1 * r2) * c.y;

        return { x: Math.floor(x), y: Math.floor(y) };
    }

    function drawTriangles(points: Vector[][], colors: string[][], xCount: number, yCount: number) {
        for (let x = 0; x < xCount - 1; ++x) {
            for (let y = 0; y < yCount - 1; ++y) {
                const a = points[x][y];
                const b = points[x + 1][y];
                const c = points[x][y + 1];
                const d = points[x + 1][y + 1];

                if(useGradient) {
                    const ac = colors[x][y];
                    const bc = colors[x + 1][y];
                    const cc = colors[x][y + 1];
                    const dc = colors[x + 1][y + 1];

                    if (Math.random() > 0.5) {
                        drawTriangleGradient(a, b, c, ac, bc, cc);
                        drawTriangleGradient(b, c, d, bc, cc, dc);
                    } else {
                        drawTriangleGradient(a, b, d, ac, bc, dc);
                        drawTriangleGradient(a, c, d, ac, cc, dc);
                    }
                } else {
                    if (Math.random() > 0.5) {
                        drawTriangleWithRandomColor(a, b, c);
                        drawTriangleWithRandomColor(b, c, d);
                    } else {
                        drawTriangleWithRandomColor(a, b, d);
                        drawTriangleWithRandomColor(a, c, d);
                    }
                }

            }
        }

        canvas.toBlob(b => {
            if (b) {
                blob = b;
                downloadDisabled = false;
                downloadText = `Download Result (${toReadableSize(blob.size)})`;
            }
        });

        generationEndTime = (new Date()).getTime();
        generationTimeText = "Generation: " + (generationEndTime - generationStartTime) + "ms";
    }

    function byteToHex(byte: number) {
        return byte.toString(16).padStart(2, "0");
    }

    function toReadableSize(size: number) {
        if (size < 1024) return size.toFixed(1) + ' B';
        size /= 1024;
        if (size < 1024) return size.toFixed(1) + ' kB';
        size /= 1024;
        if (size < 1024) return size.toFixed(1) + ' MB';
        size /= 1024;
        return size.toFixed(1) + ' GB';
    }

    onMount(() => {
        const context = canvas.getContext("2d");
        if(!context) return;
        ctx = context;
    })
</script>

<div class="w-full h-full flex text-white">
    <nav class="flex flex-col items-center p-4 bg-slate-800 shrink-0 basis-[content]">
        <!-- <h2 class="text-xl my-4 font-bold">Triangle Image Mesher</h2> -->
        <p class="my-2">
            Drop an image, see the result,<br>
            Play with values and press generate,<br>
            Download the result if you like it
        </p>
        <label class="mb-1" for="image-input">Image</label>
        <input class="hidden" type="file" accept="image/*" on:change={onImageChange} bind:this={imageInput} id="image-input">
        <button
            class="w-full flex items-center justify-center border h-40 rounded cursor-pointer select-none mb-4"
            on:click={() => imageInput.click()}
            on:dragover={onDropzoneDragOver}
            on:drop={onDropzoneDrop}
        >
            {dropzoneText}
        </button>
        <label class="mb-1" for="spacing-input">Spacing</label>
        <input
            type="number" min="1" max={maxSpacing} id="spacing-input"
            bind:value={spacing}
            class="mb-4 w-full border rounded bg-transparent px-4 py-2 appearance-none outline-none"
        >
        <label class="mb-1" for="randomness-input">Randomness</label>
        <input
            type="number" min="0" max={maxRandomness} id="randomness-input"
            bind:value={randomness}
            class="mb-4 w-full border rounded bg-transparent px-4 py-2 appearance-none outline-none"
        >
        <label class="mb-1" for="gradient-checkbox">Gradiant</label>
        <input type="checkbox" id="gradient-checkbox" bind:checked={useGradient} class="mb-4 w-6 h-6">
        <p class="my-2">{generationTimeText}</p>
        <button class="mb-4 w-full py-2 rounded border bg-slate-700 hover:bg-slate-600" on:click={() => drawImageToCanvas(image)}>Generate</button>
        <button class="mb-4 w-full py-2 rounded border bg-slate-700 hover:bg-slate-600" class:opacity-50={downloadDisabled} disabled={downloadDisabled} on:click={downloadCanvas}>{downloadText}</button>
    </nav>
    <div class="canvas-ctn bg-slate-900 grow">
        <canvas bind:this={canvas} class="w-full h-full object-contain" />
    </div>
</div>

<style lang="postcss">
    input::-webkit-outer-spin-button, input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>