<script lang="ts">
    import type { IDirectory } from "./types";
    import FileView from "./FileView.svelte";

    export let directory: IDirectory;

    $: sortedFiles = directory.files.sort((a, b) => {
        if (a.type === "dir" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "dir") return 1;
        return a.name.localeCompare(b.name);
    });
</script>

<li>
    <details open>
        <summary>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
            {directory.name}
        </summary>
        <ul>
            {#each sortedFiles as file}
                {#if file.type === "dir"}
                    <svelte:self directory={file} />
                {:else}
                    <FileView file={file} />
                {/if}
            {/each}
        </ul>
    </details>
</li>