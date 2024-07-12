<script lang="ts">
    import { page } from "$app/stores";

    const projects = [
        { name: "Weird 1", path: "/fun/projects/weird-1" },
        { name: "Weird 2", path: "/fun/projects/weird-2" },
        { name: "Triangle Background", path: "/fun/projects/triangle-shit" },
        { name: "Ray Tracer/Marcher", path: "/fun/projects/ray-tracer" },
        { name: "Wave Function Collapse", path: "/fun/projects/wave-function-collapse" },
        { name: "Triangle Image Mesher", path: "/fun/projects/triangle-image-mesher" },
        { name: "Square Stuff", path: "/fun/projects/square-stuff" },
        { name: "Game Of Life", path: "/fun/projects/game-of-life" },
        { name: "GPU Pathtracer", path: "/fun/projects/gpu-pathtracer" },
        // { name: "Animated Grass", path: "/fun/projects/animated-grass" },
    ];
</script>

<div class="w-screen h-screen flex">
    <nav id="nav" class="flex flex-col h-full py-4 shadow-xl z-10 bg-[#252f3f]">
        <h1 class="font-bold text-2xl text-center">Fun Projects</h1>
        <div class="flex flex-col gap-1 px-2 mt-4">
            {#each projects as project}
                <a class="px-4 py-2 whitespace-nowrap rounded-lg" class:active={$page.url.pathname === project.path} href={project.path}>{project.name}</a> 
            {/each}
        </div>
    </nav>
    <main class="w-full h-full grow relative flex overflow-auto">
        <slot />
    </main>
</div>

<style lang="postcss">
    a.active {
        @apply bg-[#161e2e];
    }

    a {
        @apply hover:bg-[#161e2e]/50;
    }
</style>