<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import { load_image_data_from_url, load_patterns, on_image_data_loaded } from "./image-recognition";
    const dispatch = createEventDispatcher();

    let board_image_url: string = "";
    let board_image_input: HTMLInputElement;
    let loading: boolean = false;

    async function on_import_click() {
        board_image_url = board_image_url.trim();
        if(board_image_url) {
            on_image_data_imported(`/api/image-gateway?url=${encodeURIComponent(board_image_url)}`);
        } else {
            board_image_input.click();
        }
    }

    function on_board_image_import(e: any) {
        loading = true;
        const file = e.target.files[0];
        if(!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const str = reader.result?.toString();
            if(!str) return;
            on_image_data_imported(str);
        }
        reader.readAsDataURL(file);
    }

    async function on_image_data_imported(data_url: string) {
        loading = true;
        const img_data = await load_image_data_from_url(data_url, { log_loading_time: true });
        process_image(img_data);
    }

    async function process_image(img_data: ImageData) {
        const setup = await on_image_data_loaded(img_data);
        loading = false;
        dispatch("setupgenerated", setup);
    }

    function on_paste(event: ClipboardEvent) {
        const items = (event.clipboardData)?.items;
        if(!items) return;
        for(const item of items) {
            if(item.kind === "file" && item.type.startsWith("image/")) {
                const file = item.getAsFile();
                if(!file) return;
                const reader = new FileReader();
                reader.onloadend = () => {
                    if(!reader.result) return;
                    on_image_data_imported(reader.result.toString());
                }
                reader.readAsDataURL(file);
            }
        }
    }

    onMount(() => {
        load_patterns();
    });
</script>

<svelte:window on:paste={on_paste} />

<!-- <input class="p-4 py-2 bg-transparent outline-none border border-slate-200 rounded focus:ring-1 ring-slate-200" type="text" bind:value={board_image_url} placeholder="Image URL"> -->
<input class="hidden" bind:this={board_image_input} on:change={on_board_image_import} type="file" accept="image/*">
<button class="bg-slate-700 text-slate-100 grow basis-0 p-4 py-2 rounded hover:bg-slate-600 flex justify-center items-center gap-2" on:click={on_import_click}>
    {#if loading}
        Importing
        <svg aria-hidden="true" class="w-4 h-4 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-slate-200" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
        </svg>
    {:else}
        Import Image
    {/if}
</button>