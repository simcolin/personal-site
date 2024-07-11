<script lang="ts">
    import { page } from "$app/stores";
</script>

<svelte:head>
    <title>Something went wrong ...</title>
</svelte:head>

<main class="w-screen h-screen bg-slate-800 text-white flex flex-col items-center">
    <div class="grow"/>
    <div class="flex flex-col items-center gap-2">
        <img class="object-contain" src="https://media.giphy.com/media/JUMLTR3dHEGpW/giphy.gif" alt="ryan reynolds facepalm frustration gif">
        <h1 class="text-2xl">Looks like something went wrong</h1>
        <h2 class="text-xl font-bold">{$page.status}: {$page.error?.message}</h2>
    </div>
    <div class="grow"/>
</main>