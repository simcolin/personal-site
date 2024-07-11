<script lang="ts">
    import DirectoryView from "./DirectoryView.svelte";
    import FileView from "./FileView.svelte";
    import type { IDirectory } from "./types";

    export let directory: IDirectory;

    $: sortedFiles = directory.files.sort((a, b) => {
        if (a.type === "dir" && b.type === "file") return -1;
        if (a.type === "file" && b.type === "dir") return 1;
        return a.name.localeCompare(b.name);
    });
</script>

<ul class="menu menu-xs bg-base-200 rounded-lg h-full w-full">
  {#each sortedFiles as file}
      {#if file.type === "dir"}
          <DirectoryView directory={file} />
      {:else}
          <FileView file={file} />
      {/if}
  {/each}
</ul>