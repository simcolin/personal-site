<script lang="ts" context="module">
    export type Stats = {
        total: number,
        rendering: number,
        processing: number,
    };
</script>

<script lang="ts">
    import type { Options } from "./options";
    import { createEventDispatcher } from "svelte";
    import { Vector } from "./vector";
    import { colorToHex, hexToColor } from "./utils";
    const dispatch = createEventDispatcher();

    export let options: Options;
    export let stats: Stats;

    let opened: boolean = false;

    $: if(!options) {
        options = {
            NULL_COLOR: [0, 0, 0, 255],
            SKY_COLOR: [0, 0, 0, 255],
            MAX_BOUNCE: 2,
            SHADOW_COLOR: [0, 0, 0, 255],
            DIRECT_SHADOW_FORCE: 0.8,
            LIGHT_COLOR: [255, 255, 255, 255],
            EPSILON: 1e-5,
            FOV: 90,
            LIGHT: new Vector(2, 10, 10),
            MULTITHREAD: true,
            SPECULAR_LIGHTING: true,
            DIRECT_LIGHTING: true,
            PROGRESSIVE_LIGHTING: false,
            RANDOM_SEED: '5',
            ANTIALIASING: 1,
            RAY_TRACING: true,
            MAX_ITER: 5000,
            MAX_DISTANCE: 500,
            HIT_DISTANCE: 0.00001,
        }
    }

    $: options, sanithizeOptions();
    $: options, dispatch("rerender");

    function customParseFloat(value: any): any {
        if(typeof value === "string") {
            try {
                const parsed = parseFloat(value);
                if(!parsed || isNaN(parsed as any)) return value;
                return parsed;
            } catch(e) { }
        }
        return value;
    }

    function customParseInteger(value: any): any {
        if(typeof value === "string") {
            try {
                const parsed = parseInt(value);
                if(!parsed || isNaN(parsed as any)) return value;
                return parsed;
            } catch(e) { }
        }
        return value;
    }

    function sanithizeOptions() {
        try {
            options.FOV = customParseFloat(options.FOV);
            options.ANTIALIASING = customParseFloat(options.ANTIALIASING);
            options.MAX_BOUNCE = customParseInteger(options.MAX_BOUNCE);
            options.EPSILON = customParseFloat(options.EPSILON);
            options.MAX_ITER = customParseInteger(options.MAX_ITER);
            options.MAX_DISTANCE = customParseFloat(options.MAX_DISTANCE);
            options.HIT_DISTANCE = customParseFloat(options.HIT_DISTANCE);
            options.DIRECT_SHADOW_FORCE = customParseFloat(options.DIRECT_SHADOW_FORCE);
        } catch(e) { console.error(e) }
    }

    function setRandomSeed() {
        options.RANDOM_SEED = (Math.random() * 10000).toString(36).replace('.', '');
        dispatch("resetscene");
    }
</script>

<div class="absolute top-0 right-0 h-full bg-slate-800 border-l text-white" class:translate-x-0={!opened} class:translate-x-full={opened}>
    <button class="absolute bottom-0 right-full border-l border-t p-1 bg-slate-800" on:click={() => opened = !opened}>
        {#if opened}
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M15.125 21.1L6.7 12.7q-.15-.15-.213-.325T6.425 12q0-.2.062-.375T6.7 11.3l8.425-8.425q.35-.35.875-.35t.9.375q.375.375.375.875t-.375.875L9.55 12l7.35 7.35q.35.35.35.863t-.375.887q-.375.375-.875.375t-.875-.375Z"></path></svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="-scale-100" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M15.125 21.1L6.7 12.7q-.15-.15-.213-.325T6.425 12q0-.2.062-.375T6.7 11.3l8.425-8.425q.35-.35.875-.35t.9.375q.375.375.375.875t-.375.875L9.55 12l7.35 7.35q.35.35.35.863t-.375.887q-.375.375-.875.375t-.875-.375Z"></path></svg>
        {/if}
    </button>
    <div class="w-full h-full flex flex-col items-center p-3 max-h-full overflow-x-hidden overflow-y-auto gap-3 whitespace-nowrap">
        <h3>Options</h3>
        <div>
            Total: {stats.total.toFixed(2)}ms<br>
            Processing: {stats.processing.toFixed(2)}ms<br>
            Rendering: {stats.rendering.toFixed(2)}ms
        </div>
        <b class="w-full">General</b>
        <div class="flex gap-2 w-full pl-2">
            Fov
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.FOV}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Antialiasing
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.ANTIALIASING}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Multithreading
            <input class="grow" type="checkbox" bind:checked={options.MULTITHREAD}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Bounce per ray
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.MAX_BOUNCE}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Ray tracing
            <input class="grow" type="checkbox" bind:checked={options.RAY_TRACING}>
        </div>
        <b class="w-full">Ray Tracing</b>
        <div class="flex gap-2 w-full pl-2">
            Epsilon
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.EPSILON}>
        </div>
        <b class="w-full">Ray Marching</b>
        <div class="flex gap-2 w-full pl-2">
            Max iteration count
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.MAX_ITER}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Max distance
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.MAX_DISTANCE}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Hit distance
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.HIT_DISTANCE}>
        </div>
        <b class="w-full">Colors</b>
        <div class="flex gap-2 w-full pl-2">
            Sky
            <input class="grow border rounded p-0 bg-transparent outline-none" type="color" value={colorToHex(options.SKY_COLOR)} on:change={e => options.SKY_COLOR = hexToColor(e.currentTarget.value)}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Shadow
            <input class="grow border rounded p-0 bg-transparent outline-none" type="color" value={colorToHex(options.SHADOW_COLOR)} on:change={e => options.SHADOW_COLOR = hexToColor(e.currentTarget.value)}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Light
            <input class="grow border rounded p-0 bg-transparent outline-none" type="color" value={colorToHex(options.LIGHT_COLOR)} on:change={e => options.LIGHT_COLOR = hexToColor(e.currentTarget.value)}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Direct Shadow Force
            <input class="grow border rounded px-1 bg-transparent outline-none" type="number" bind:value={options.DIRECT_SHADOW_FORCE}>
        </div>
        <b class="w-full">Lighting</b>
        <div class="flex gap-2 w-full pl-2">
            Specular
            <input class="grow" type="checkbox" bind:checked={options.SPECULAR_LIGHTING}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Direct
            <input class="grow" type="checkbox" bind:checked={options.DIRECT_LIGHTING}>
        </div>
        <div class="flex gap-2 w-full pl-2">
            Normal based
            <input class="grow" type="checkbox" bind:checked={options.PROGRESSIVE_LIGHTING}>
        </div>
        <b class="w-full">Generation</b>
        <div class="flex gap-2 w-full pl-2">
            Seed
            <input class="grow border rounded px-1 bg-transparent outline-none" type="text" bind:value={options.RANDOM_SEED} on:change={() => dispatch("resetscene")}>
        </div>
        <button class="px-2 py-2 border rounded bg-transparent outline-none" on:click={setRandomSeed}>Random Seed</button>
    </div>
</div>

<style lang="postcss">
    input[type="color"] {
        @apply appearance-none;
    }

    input[type="color"]::-webkit-color-swatch-wrapper {
        @apply p-0;
    }

    input[type="color"]::-webkit-color-swatch {
        @apply rounded border-0;
    }
</style>