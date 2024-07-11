<script lang="ts">
    import { enhance } from "$app/forms";
    import { page } from "$app/stores";
    import "../ui.css";

    const routes = [
        { name: "Script Editor", path: "/cc" },
        { name: "Jukebox", path: "/cc/jukebox" },
    ];
</script>

<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
    <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap" rel="stylesheet" />
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100;200;300;400;500;600;700;800&display=swap" rel="stylesheet">
    <!-- <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" /> -->
</svelte:head>

<div class="w-full h-full flex flex-col">
    <header class="flex justify-between items-center p-4 bg-base-200">
        <h1>Tooser OS UI</h1>
        <nav class="tabs tabs-boxed">
            {#each routes as route}
                <a class="tab" class:tab-active={$page.url.pathname === route.path} href={route.path}>{route.name}</a>
            {/each}
        </nav>
        <div>
            <form use:enhance method="POST" action="cc/login?/logout">
                <button class="btn btn-primary">Logout</button>
            </form>
        </div>
    </header>
    <div class="grow overflow-hidden">
        <slot/>
    </div>
</div>
