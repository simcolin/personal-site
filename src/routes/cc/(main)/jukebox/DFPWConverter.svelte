<script lang="ts">
    import type { FFmpeg } from "@ffmpeg/ffmpeg";
    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher<{ data: Uint8Array }>();

    let dialogElem: HTMLDialogElement;

    let toBlobURL: typeof import("@ffmpeg/util").toBlobURL;
    let loaded: boolean = false;
    let loading: boolean = false;
    let ffmpeg: FFmpeg;
    let logs: string[] = [];
    let dispatchData: Uint8Array;

    export function open() {
        dialogElem.showModal();
    }

    async function loadFFMPEG() {
        loading = true;
        const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.4/dist/esm"
        ffmpeg.on("log", ({ message }) => {
            logs.push(message);
            logs = logs;
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        loading = false;
        loaded = true;
    }

    function onFile(event: Event & { currentTarget: HTMLInputElement }) {
        if(!event.currentTarget.files) return;
        const file = event.currentTarget.files[0];
        if(!file) return;

        transcode(file)
    }

    async function transcode(file: File) {
        logs = [];
        const fileBytes = new Uint8Array(await file.arrayBuffer());
        const fileName = file.name.replace(/ /g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        await ffmpeg.writeFile(fileName, fileBytes);
        await ffmpeg.exec(`-i ${fileName} -ac 1 -acodec dfpwm -ar 48k -aq 0 output.dfpwm`.split(" "));
        // await ffmpeg.exec(`-i ${fileName} -acodec dfpwm -ar 48k -aq 0 output.dfpwm`.split(" "));
        // await ffmpeg.exec(`-i ${fileName} -filter_complex "[0:a]amerge=inputs=4[a]" -ac 1 -map 0:v -map "[a]" -acodec dfpwm -ar 48k -aq 0 output.dfpwm`.split(" "));
        
        const data = await ffmpeg.readFile("output.dfpwm");
        if(typeof data === "string") return;
        dispatchData = data;
    }

    function onImport() {
        dispatch("data", dispatchData);
        dispatchData = new Uint8Array();
        logs = [];
        dialogElem.close();
    }

    onMount(async () => {
        loading = true;
        try {
            const { FFmpeg } = await import("@ffmpeg/ffmpeg");
            toBlobURL = (await import("@ffmpeg/util")).toBlobURL;
            ffmpeg = new FFmpeg();
    
            await loadFFMPEG();
        } catch(e) {
            console.error(e);
        }
        loading = false;
    });
</script>

<dialog bind:this={dialogElem} class="modal">
    <div class="modal-box flex flex-col gap-4 max-w-[90%]">
        {#if loading}
            <div class="m-auto">Loading FFmpeg ... <span class="loading loading-spinner"/></div>
        {:else}
            <input type="file" on:input={onFile} class="file-input file-input-bordered file-input-primary w-full max-w-xs">
            <div class="mockup-code max-w-full overflow-y-auto">
                {#each logs as log, index}
                    <pre data-prefix="{index}"><code class="whitespace-normal">{log}</code></pre>
                {/each}
            </div>
        {/if}

        <div class="flex justify-end gap-2">
            {#if dispatchData}
                <button class="btn btn-success" on:click={onImport}>Import</button>
            {/if}
            <form method="dialog">
                <button class="btn btn-error">Close</button>
            </form>
        </div>
    </div>
</dialog>